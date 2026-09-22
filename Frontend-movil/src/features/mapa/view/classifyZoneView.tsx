import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient"; // <-- NUEVA IMPORTACIÓN
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
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

  // Coordenadas actuales del estado para permitir actualizaciones al presionar "Mi ubicación"
  const editarUbicacion = route.params?.editarUbicacion;
  const initialLat = route.params?.latitude ?? 2.962828;
  const initialLng = route.params?.longitude ?? -75.2855952;

  const [coords, setCoords] = useState({
    latitude: initialLat,
    longitude: initialLng,
  });

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

  const [isLocationHovered, setIsLocationHovered] = useState(false);

  // Función reutilizable de Geocodificación Inversa
  const fetchAddress = useCallback(
    async (lat: number, lng: number) => {
      try {
        setCargando(true);
        const reverse = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });

        const info = reverse[0];

        const direccionData: DireccionInfo = {
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
        const fallbackData: DireccionInfo = {
          direccion: t.mapa.sin_calle,
          barrio: t.mapa.sector_desconocido,
          municipio: t.mapa.municipio_desconocido,
          ciudad: t.mapa.ciudad_desconocida,
          departamento: t.mapa.departamento_desconocido,
          pais: t.mapa.pais_desconocido,
        };
        setDireccionInfo(fallbackData);
        setDireccion(fallbackData.direccion);
        setCiudad(fallbackData.ciudad);
        setBarrio(fallbackData.barrio);
      } finally {
        setCargando(false);
      }
    },
    [t]
  );

  // Carga inicial
  useEffect(() => {
    fetchAddress(coords.latitude, coords.longitude);
  }, [coords, fetchAddress]);

  // Handler para "Usar mi ubicación actual"
  const handleUsarUbicacionActual = async () => {
    try {
      setCargando(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se requiere permiso de ubicación.");
        setCargando(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoords({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (err) {
      Alert.alert("Error", "No se pudo obtener la ubicación actual.");
      setCargando(false);
    }
  };

  const handleGuardar = async () => {
    if (guardando) return;

    // Validación: nombre obligatorio
    if (!nombre.trim()) {
      setErrorNombre(true);
      return;
    }

    // Validación: nivel de seguridad obligatorio
    if (!nivelSeguridad) {
      Alert.alert("Atención", "Por favor selecciona el nivel de seguridad de la zona.");
      return;
    }

    setGuardando(true);

    try {
      const ubicacionGuardada = {
        id: editarUbicacion?.id || Date.now().toString(),
        nombre: nombre.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,

        // CORRECCIÓN: Se guardan las variables locales editadas en los TextInput
        direccion: direccion.trim() || direccionInfo?.direccion || "",
        barrio: barrio.trim() || direccionInfo?.barrio || "",
        municipio: direccionInfo?.municipio || "",
        ciudad: ciudad.trim() || direccionInfo?.ciudad || "",
        departamento: direccionInfo?.departamento || "",
        pais: direccionInfo?.pais || "",

        fecha: new Date().toISOString(),
        estado: "Activo",
        precision: t.mapa.precision_alta,
        notas: notas.trim() || undefined,
        nivelRiesgo: nivelSeguridad,
        descripcion: descripcion.trim(),
      };

      // Obtener ubicaciones existentes
      const ubicacionesExistentes = await AsyncStorage.getItem("ubicaciones_guardadas");
      let ubicaciones = ubicacionesExistentes ? JSON.parse(ubicacionesExistentes) : [];

      // Validación: verificar nombre duplicado (solo al crear)
      if (!editarUbicacion) {
        const nombreDuplicado = ubicaciones.some(
          (u: any) => u.nombre.toLowerCase() === nombre.trim().toLowerCase()
        );

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
        const index = ubicaciones.findIndex((u: any) => u.id === editarUbicacion.id);
        if (index !== -1) {
          ubicaciones[index] = ubicacionGuardada;
        }
      } else {
        ubicaciones.push(ubicacionGuardada);
      }

      // Guardar en AsyncStorage
      await AsyncStorage.setItem("ubicaciones_guardadas", JSON.stringify(ubicaciones));

      // Navegar a la pantalla de ubicaciones guardadas
      navigation.navigate("UbicacionesGuardadas");
    } catch (error) {
      console.error("Error al guardar ubicación:", error);
      Alert.alert("Error", "Error al guardar la ubicación");
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
        {/* ================= HEADER ACTUALIZADO ================= */}
        <LinearGradient
          colors={[theme.headercolor1, theme.headercolor2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Clasificar zona</Text>
            <Text style={styles.headerSubtitle}>
              Ayuda a otras mujeres reportando la seguridad
            </Text>
          </View>
        </LinearGradient>
        {/* ======================================================= */}

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
            region={{
              latitude: coords.latitude,
              longitude: coords.longitude,
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
                latitude: coords.latitude,
                longitude: coords.longitude,
              }}
              pinColor="#7B1DB2"
            />
          </MapView>

          <View style={styles.mapCenterMarker}>
            <View style={styles.mapCenterDot} />
          </View>

          <TouchableOpacity 
            style={styles.mapLocationButton}
            onPress={handleUsarUbicacionActual}
          >
            <MaterialIcons
              name="my-location"
              size={18}
              color="#7B1DB2"
            />
          </TouchableOpacity>
        </View>

        {/* USAR UBICACIÓN ACTUAL */}
        <Pressable
          onPress={handleUsarUbicacionActual}
          onHoverIn={() => setIsLocationHovered(true)}
          onHoverOut={() => setIsLocationHovered(false)}
          style={({ pressed }) => {
            const isActive = pressed || isLocationHovered;
            return [
              styles.useLocationButton,
              isActive && {
                backgroundColor: "#7B1DB2",
                borderColor: "#5A1387",
              },
            ];
          }}
        >
          {({ pressed }) => {
            const isActive = pressed || isLocationHovered;
            return (
              <Text
                style={[
                  styles.useLocationText,
                  isActive && { color: "#FFFFFF", fontWeight: "bold" },
                ]}
              >
                Usar mi ubicación actual
              </Text>
            );
          }}
        </Pressable>

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
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
          ]}
          placeholder="Ej: Neiva"
          placeholderTextColor={theme.contactSubtext}
          value={ciudad}
          onChangeText={setCiudad}
        />

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