import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import type { MainStackParamList } from "../../../navigation/types";
import { styles } from "./guardar.Style";

type GuardarUbiRouteProp = RouteProp<MainStackParamList, "guardarUbi">;

type DireccionInfo = {
  direccion: string;
  barrio: string;
  municipio: string;
  ciudad: string;
  departamento: string;
  pais: string;
};

export default function GuardarUbi() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const route = useRoute<GuardarUbiRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const { latitude, longitude } = route.params;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [notas, setNotas] = useState("");
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

    setGuardando(true);

    try {
      navigation.replace("historialMapa", {
        ubicacion: {
          id: Date.now().toString(),
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
          notas: notas.trim() || t.mapa.nota_guardada,
        },
      });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#6C2BD9" />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          {t.mapa.cargando}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
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

          <Text style={styles.headerTitle}>{t.mapa.guardar}</Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
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
                pinColor="#6C2BD9"
              />
            </MapView>
          </View>

          <InfoItem
            icon="place"
            label={t.historialMapa.direccion}
            value={direccionInfo?.direccion ?? "—"}
            theme={theme}
          />
          <InfoItem
            icon="home"
            label={t.historialMapa.barrio}
            value={direccionInfo?.barrio ?? "—"}
            theme={theme}
          />
          <InfoItem
            icon="location-city"
            label={t.historialMapa.municipio}
            value={direccionInfo?.municipio ?? "—"}
            theme={theme}
          />
          <InfoItem
            icon="my-location"
            label={t.historialMapa.latitud}
            value={latitude.toFixed(5)}
            theme={theme}
          />
          <InfoItem
            icon="location-on"
            label={t.historialMapa.longitud}
            value={longitude.toFixed(5)}
            theme={theme}
          />

          <TextInput
            style={[
              styles.notasInput,
              {
                color: theme.text,
                borderColor: theme.icono + "40",
                backgroundColor: theme.background,
              },
            ]}
            placeholder={t.mapa.nota_guardada}
            placeholderTextColor={theme.contactSubtext}
            value={notas}
            onChangeText={setNotas}
            multiline
            maxLength={200}
          />

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
                <MaterialIcons name="bookmark" size={22} color="#fff" />
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
            <Text style={styles.secondaryButtonText}>
              {t.permisos.btn_regresar}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

type InfoItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  theme: { text: string; contactSubtext: string };
};

function InfoItem({ icon, label, value, theme }: InfoItemProps) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={20} color="#6C2BD9" />
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}
