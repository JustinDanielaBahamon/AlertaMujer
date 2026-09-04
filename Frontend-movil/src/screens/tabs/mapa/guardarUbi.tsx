import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons as MIcon } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import type { MainStackParamList } from "../../../navigation/types";
import { styles, COLORS } from "./guardar.Style";

type GuardarUbiRouteProp = RouteProp<MainStackParamList, "guardarUbi">;

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

export default function GuardarUbi() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const route = useRoute<GuardarUbiRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const { latitude, longitude } = route.params;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [notas, setNotas] = useState("");
  const [errorNombre, setErrorNombre] = useState(false);
  const [maxNotasAlcanzado, setMaxNotasAlcanzado] = useState(false);
  const [direccionInfo, setDireccionInfo] = useState<DireccionInfo | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (!mounted) return;

        const info = reverse[0];

        setDireccionInfo({
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
        });
      } catch {
        if (mounted) {
          setDireccionInfo({
            direccion: t.mapa.sin_calle,
            barrio: t.mapa.sector_desconocido,
            municipio: t.mapa.municipio_desconocido,
            ciudad: t.mapa.ciudad_desconocida,
            departamento: t.mapa.departamento_desconocido,
            pais: t.mapa.pais_desconocido,
          });
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

    // Validación: name es obligatorio en frequent_location
    if (!nombre.trim()) {
      setErrorNombre(true);
      return;
    }

    setGuardando(true);

    try {
      navigation.replace("historialMapa", {
        ubicacion: {
          id: Date.now().toString(),
          nombre: nombre.trim(),
          latitude,
          longitude,
          direccion: direccionInfo.direccion,
          barrio: direccionInfo.barrio,
          municipio: direccionInfo.municipio,
          ciudad: direccionInfo.ciudad,
          departamento: direccionInfo.departamento,
          pais: direccionInfo.pais,
          fecha: new Date().toISOString(),
          estado: "Activo",
          precision: t.mapa.precision_alta,
          notas: notas.trim() || undefined,
        },
      });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.screenBg }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          {t.mapa.cargando}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: COLORS.screenBg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header con degradado */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.mapa.guardar}</Text>
        </View>

        {/* Preview del mapa */}
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
              coordinate={{ latitude, longitude }}
              title={t.historialMapa.ubicacion_guardada_marcador}
              pinColor={COLORS.accent}
            />
          </MapView>
        </View>

        {/* Nombre de la ubicación — obligatorio */}
        <View style={styles.fieldBlock}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>{t.historialMapa.nombre_ubicacion}</Text>
            <Text style={styles.requiredMark}>*</Text>
          </View>
          <TextInput
            style={[styles.nombreInput, errorNombre && styles.inputError]}
            placeholder={t.historialMapa.nombre_placeholder}
            placeholderTextColor={COLORS.placeholder}
            value={nombre}
            onChangeText={(val) => {
              setNombre(val);
              if (errorNombre) setErrorNombre(false);
            }}
            maxLength={100}
            textAlignVertical="top"
          />
          {errorNombre && (
            <View style={styles.errorRow}>
              <MaterialIcons name="error-outline" size={13} color={COLORS.errorColor} />
              <Text style={styles.errorText}>{t.historialMapa.nombre_requerido}</Text>
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
                <MIcon name={s.icon} size={13} color={COLORS.accent} />
                <Text style={styles.chipText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info geocodificada */}
        <View style={styles.infoBlock}>
          <InfoItem icon="place" label={t.historialMapa.direccion} value={direccionInfo?.direccion ?? "—"} />
          <InfoItem icon="home" label={t.historialMapa.barrio} value={direccionInfo?.barrio ?? "—"} />
          <View style={styles.infoDoubleRow}>
            <InfoItem icon="my-location" label={t.historialMapa.latitud} value={latitude.toFixed(5)} compact />
            <InfoItem icon="location-on" label={t.historialMapa.longitud} value={longitude.toFixed(5)} compact />
          </View>
        </View>

        {/* Notas — opcional, con etiqueta clara */}
        <View style={styles.fieldBlock}>
          <View style={styles.notasLabelRow}>
            <MaterialIcons name="notes" size={16} color={COLORS.accentDark} />
            <Text style={styles.fieldLabel}>{t.historialMapa.notas_label}</Text>
          </View>
          <Text style={styles.notasHelper}>{t.historialMapa.notas_ayuda}</Text>
          <TextInput
            style={styles.notasInput}
            placeholder={t.historialMapa.notas_placeholder}
            placeholderTextColor={COLORS.placeholder}
            value={notas}
            onChangeText={(val) => {
              setNotas(val);
              setMaxNotasAlcanzado(val.length >= 200);
            }}
            multiline
            maxLength={200}
          />
          {maxNotasAlcanzado && (
            <View style={styles.maxCharWarning}>
              <MaterialIcons name="warning" size={13} color={COLORS.errorColor} />
              <Text style={styles.maxCharText}>{t.historialMapa.max_caracteres}</Text>
            </View>
          )}
          {maxNotasAlcanzado && (
            <View style={styles.maxCharWarning}>
              <MaterialIcons name="warning" size={13} color={COLORS.errorColor} />
              <Text style={styles.maxCharText}>{t.historialMapa.max_caracteres}</Text>
            </View>
          )}
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.primaryButton, guardando && { opacity: 0.7 }]}
          onPress={handleGuardar}
          disabled={guardando}
          activeOpacity={0.85}
        >
          {guardando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="bookmark" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>
                {t.tutorial.ubicacion_guardar_boton}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>{t.permisos.btn_regresar}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type InfoItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  compact?: boolean;
};

function InfoItem({ icon, label, value, compact }: InfoItemProps) {
  return (
    <View style={[styles.infoRow, compact && { flex: 1 }]}>
      <MaterialIcons name={icon} size={16} color={COLORS.accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}