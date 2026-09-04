import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import type { MainStackParamList } from "../../../navigation/types";
import { createStyles } from "../styles/classifyZone.style";

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

type ClasificarZonaRouteProp = {
  key: string;
  name: "ClasificarZona";
  params?: {
    latitude?: number;
    longitude?: number;
    editarUbicacion?: {
      id: string;
      nombre: string;
      notas?: string;
      nivelRiesgo: "muy_segura" | "moderada" | "muy_insegura";
      descripcion: string;
    };
  };
};

type DireccionInfo = {
  direccion: string;
  barrio: string;
  municipio: string;
  ciudad: string;
  departamento: string;
  pais: string;
};

const SUGERENCIAS_NOMBRE = [
  { label: "Casa", icon: "home" as const },
  { label: "Trabajo", icon: "work" as const },
  { label: "Otro", icon: "edit" as const },
];

export default function ClasificarZonaView() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ClasificarZonaRouteProp>();

  const latitude = route.params?.latitude ?? 2.962828;
  const longitude = route.params?.longitude ?? -75.2855952;
  const editarUbicacion = route.params?.editarUbicacion;

  const styles = createStyles(theme);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nombre, setNombre] = useState(editarUbicacion?.nombre || "");
  const [notas, setNotas] = useState(editarUbicacion?.notas || "");
  const [errorNombre, setErrorNombre] = useState(false);
  const [maxNotasAlcanzado, setMaxNotasAlcanzado] = useState(false);
  const [direccionInfo, setDireccionInfo] = useState<DireccionInfo | null>(null);
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [descripcion, setDescripcion] = useState(editarUbicacion?.descripcion || "");
  const [nivelSeguridad, setNivelSeguridad] = useState<string | null>(
    editarUbicacion?.nivelRiesgo || null
  );

  // Cargar información de dirección usando reverse geocoding
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (!mounted) return;

        const info = reverse[0];

        const direccionData = {
          direccion: `${info?.street || t.mapa.sin_calle} ${info?.streetNumber || ""}`.trim(),
          barrio:
            info?.district && info.district !== info?.city
              ? info.district
              : t.mapa.sector_desconocido,
          municipio:
            info?.city || info?.district || t.mapa.municipio_desconocido,
          ciudad:
            info?.city ||
            info?.subregion ||
            info?.district ||
            t.mapa.ciudad_desconocida,
          departamento: info?.region || t.mapa.departamento_desconocido,
          pais: info?.country || t.mapa.pais_desconocido,
        };

        setDireccionInfo(direccionData);
        setDireccion(direccionData.direccion);
        setCiudad(direccionData.ciudad);
        setBarrio(direccionData.barrio);
      } catch {
        if (mounted) {
          const direccionData = {
            direccion: t.mapa.sin_calle,
            barrio: t.mapa.sector_desconocido,
            municipio: t.mapa.municipio_desconocido,
            ciudad: t.mapa.ciudad_desconocida,
            departamento: t.mapa.departamento_desconocido,
            pais: t.mapa.pais_desconocido,
          };
          setDireccionInfo(direccionData);
          setDireccion(direccionData.direccion);
          setCiudad(direccionData.ciudad);
          setBarrio(direccionData.barrio);
        }
      } finally {
        if (mounted) setCargando(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [latitude, longitude, t]);

  const handleGuardar = async () => {
    if (!direccionInfo || guardando) return;

    // Validación: nombre es obligatorio
    if (!nombre.trim()) {
      setErrorNombre(true);
      return;
    }

    // Validación: nivel de seguridad es obligatorio
    if (!nivelSeguridad) {
      alert("Por favor selecciona el nivel de seguridad de la zona");
      return;
    }

    setGuardando(true);

    try {
      const ubicacionGuardada = {
        id: editarUbicacion?.id || Date.now().toString(),
        nombre: nombre.trim(),
        latitude,
        longitude,
        direccion: direccionInfo.direccion,
        barrio: direccionInfo.barrio,
        municipio: direccionInfo.municipio,
        ciudad: direccionInfo.ciudad,
        departamento: direccionInfo.departamento,
        pais: direccionInfo.pais,
        fecha: editarUbicacion ? new Date().toISOString() : new Date().toISOString(),
        estado: "Activo",
        precision: t.mapa.precision_alta,
        notas: notas.trim() || undefined,
        nivelRiesgo: nivelSeguridad,
        descripcion: descripcion.trim(),
      };

      // Obtener ubicaciones existentes
      const ubicacionesExistentes = await AsyncStorage.getItem("ubicaciones_guardadas");
      let ubicaciones = ubicacionesExistentes ? JSON.parse(ubicacionesExistentes) : [];

      console.log("Ubicaciones existentes:", ubicaciones.length);
      console.log("Nombre a guardar:", nombre.trim());

      // Validación: verificar nombre duplicado (solo para nuevas ubicaciones)
      if (!editarUbicacion) {
        const nombreDuplicado = ubicaciones.some(
          (u: any) => u.nombre.toLowerCase() === nombre.trim().toLowerCase()
        );
        console.log("¿Nombre duplicado?", nombreDuplicado);

        if (nombreDuplicado) {
          Alert.alert(
            "Nombre duplicado",
            "Ya existe una ubicación con este nombre. Por favor usa un nombre diferente."
          );
          setGuardando(false);
          return;
        }
      }

      if (editarUbicacion) {
        // Actualizar ubicación existente
        const index = ubicaciones.findIndex((u: any) => u.id === editarUbicacion.id);
        if (index !== -1) {
          ubicaciones[index] = ubicacionGuardada;
        }
      } else {
        // Agregar nueva ubicación
        ubicaciones.push(ubicacionGuardada);
      }

      // Guardar en AsyncStorage
      await AsyncStorage.setItem("ubicaciones_guardadas", JSON.stringify(ubicaciones));

      console.log(editarUbicacion ? "Ubicación actualizada:" : "Ubicación guardada:", ubicacionGuardada);

      // Navegar a la pantalla de ubicaciones guardadas
      navigation.navigate("UbicacionesGuardadas");
    } catch (error) {
      console.error("Error al guardar ubicación:", error);
      alert("Error al guardar la ubicación");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#7B1DB2" />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          {t.mapa.cargando}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text
              style={[
                styles.headerTitle,
                { color: theme.text },
              ]}
            >
              Clasificar zona
            </Text>
          </View>

          <View style={styles.securityHeaderIcon}>
            <MaterialIcons
              name="security"
              size={22}
              color="#7B1DB2"
            />
          </View>
        </View>

        {/* DESCRIPCIÓN */}
        <Text
          style={[
            styles.description,
            { color: theme.contactSubtext },
          ]}
        >
          Ayuda a otras mujeres reportando el nivel de seguridad de esta zona.
        </Text>

        {/* UBICACIÓN EN EL MAPA */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          <MaterialIcons
            name="location-on"
            size={15}
            color="#7B1DB2"
          />{" "}
          Ubicación en el mapa
        </Text>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{
                latitude,
                longitude,
              }}
              pinColor="#7B1DB2"
            />
          </MapView>

          <View style={styles.mapCenterMarker}>
            <View style={styles.mapCenterDot} />
          </View>

          <TouchableOpacity style={styles.mapLocationButton}>
            <MaterialIcons
              name="my-location"
              size={18}
              color="#7B1DB2"
            />
          </TouchableOpacity>
        </View>

        {/* USAR UBICACIÓN ACTUAL */}
        <TouchableOpacity style={styles.useLocationButton}>
          <Text style={styles.useLocationText}>
            Usar mi ubicación actual
          </Text>
        </TouchableOpacity>

        {/* NOMBRE DE LA UBICACIÓN */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          <MaterialIcons
            name="bookmark"
            size={15}
            color="#7B1DB2"
          />{" "}
          Nombre de la ubicación
        </Text>
        <View style={styles.fieldLabelRow}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Nombre *
          </Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
            errorNombre && styles.inputError,
          ]}
          placeholder="Ej: Casa, Trabajo, Gimnasio"
          placeholderTextColor={theme.contactSubtext}
          value={nombre}
          onChangeText={(val) => {
            setNombre(val);
            if (errorNombre) setErrorNombre(false);
          }}
          maxLength={100}
        />
        {errorNombre && (
          <View style={styles.errorRow}>
            <MaterialIcons name="error-outline" size={13} color="#D81B60" />
            <Text style={styles.errorText}>El nombre es obligatorio</Text>
          </View>
        )}

        <View style={styles.chipsRow}>
          {SUGERENCIAS_NOMBRE.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={styles.chip}
              onPress={() => {
                setNombre(s.label);
                setErrorNombre(false);
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name={s.icon} size={13} color="#7B1DB2" />
              <Text style={styles.chipText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* INFORMACIÓN DE LA ZONA */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          <MaterialIcons
            name="home"
            size={15}
            color="#7B1DB2"
          />{" "}
          Información de la zona
        </Text>

        {/* DIRECCIÓN */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Dirección
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
          ]}
          placeholder="Ej: Carrera 1e Oeste #48"
          placeholderTextColor={theme.contactSubtext}
          value={direccion}
          onChangeText={setDireccion}
        />

        {/* CIUDAD */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Ciudad
        </Text>
        <TouchableOpacity
          style={[
            styles.selectInput,
            {
              backgroundColor: theme.card,
            },
          ]}
        >
          <Text
            style={{
              color: ciudad ? theme.text : theme.contactSubtext,
              fontSize: 12,
            }}
          >
            {ciudad || "Seleccione una ciudad"}
          </Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={18}
            color={theme.contactSubtext}
          />
        </TouchableOpacity>

        {/* BARRIO */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Barrio / Comuna
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
          ]}
          placeholder="Ej: Barrio Santa Inés"
          placeholderTextColor={theme.contactSubtext}
          value={barrio}
          onChangeText={setBarrio}
        />

        {/* DESCRIPCIÓN DE LA ZONA */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Descripción de la zona
        </Text>
        <TextInput
          style={[
            styles.descriptionInput,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
          ]}
          placeholder="Describe cómo es esta zona, incidentes frecuentes, iluminación, tránsito de personas, etc."
          placeholderTextColor={theme.contactSubtext}
          multiline
          maxLength={250}
          textAlignVertical="top"
          value={descripcion}
          onChangeText={setDescripcion}
        />
        <Text
          style={[
            styles.characterCounter,
            { color: theme.contactSubtext },
          ]}
        >
          {descripcion.length}/250
        </Text>

        {/* NOTAS ADICIONALES */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Notas adicionales (opcional)
        </Text>
        <TextInput
          style={[
            styles.descriptionInput,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
          ]}
          placeholder="Agrega notas personales sobre esta ubicación"
          placeholderTextColor={theme.contactSubtext}
          multiline
          maxLength={200}
          textAlignVertical="top"
          value={notas}
          onChangeText={(val) => {
            setNotas(val);
            setMaxNotasAlcanzado(val.length >= 200);
          }}
        />
        <Text
          style={[
            styles.characterCounter,
            { color: theme.contactSubtext },
          ]}
        >
          {notas.length}/200
        </Text>
        {maxNotasAlcanzado && (
          <View style={styles.errorRow}>
            <MaterialIcons name="warning" size={13} color="#D81B60" />
            <Text style={styles.errorText}>Máximo de caracteres alcanzado</Text>
          </View>
        )}

        {/* NIVEL DE SEGURIDAD */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          <MaterialIcons
            name="security"
            size={15}
            color="#7B1DB2"
          />{" "}
          Nivel de seguridad
        </Text>
        <Text style={[styles.securityDescription, { color: theme.contactSubtext }]}>
          Selecciona la opción que mejor describa esta zona.
        </Text>

        <View style={styles.securityGrid}>
          {/* MUY SEGURA */}
          <TouchableOpacity
            style={[
              styles.securityOption,
              styles.verySafe,
              nivelSeguridad === "muy_segura" && styles.selectedSecurity,
            ]}
            onPress={() => setNivelSeguridad("muy_segura")}
          >
            <MaterialIcons name="verified-user" size={17} color="#27AE60" />
            <Text style={styles.verySafeText}>Muy segura</Text>
            <Text style={styles.securitySmallText}>Zona muy segura</Text>
          </TouchableOpacity>

         

          {/* MODERADA */}
          <TouchableOpacity
            style={[
              styles.securityOption,
              styles.moderate,
              nivelSeguridad === "moderada" && styles.selectedSecurity,
            ]}
            onPress={() => setNivelSeguridad("moderada")}
          >
            <MaterialIcons name="warning" size={17} color="#D89B00" />
            <Text style={styles.moderateText}>Moderada</Text>
            <Text style={styles.securitySmallText}>Riesgo medio</Text>
          </TouchableOpacity>

         

          {/* MUY INSEGURA */}
          <TouchableOpacity
            style={[
              styles.securityOption,
              styles.veryUnsafe,
              nivelSeguridad === "muy_insegura" && styles.selectedSecurity,
            ]}
            onPress={() => setNivelSeguridad("muy_insegura")}
          >
            <MaterialIcons name="report" size={17} color="#E74C3C" />
            <Text style={styles.veryUnsafeText}>Muy insegura</Text>
            <Text style={styles.securitySmallText}>Riesgo muy alto</Text>
          </TouchableOpacity>

         
        </View>


        {/* GUARDAR UBICACIÓN */}
        <TouchableOpacity
          style={[styles.submitButton, guardando && { opacity: 0.7 }]}
          onPress={handleGuardar}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="bookmark" size={17} color="#fff" />
              <Text style={styles.submitButtonText}>Guardar ubicación</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: theme.contactSubtext }]}>
          Tu ubicación será guardada con su clasificación de seguridad.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}