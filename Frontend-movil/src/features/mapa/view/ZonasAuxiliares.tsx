import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Circle, Marker, Polyline, type LatLng } from "../../../components/mapa/MapaLibre";
import * as Location from "expo-location";
import { permisoUbicacion } from "../../../services/permisosSeguros";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { styles } from "../styles/ZonasAuxiliares.style";
import { getZonas } from "../../../services/zones.service";
import { LocationService } from "../../../services/location.service";

const mapearTipoZona = (zoneType?: string, riskLevel?: string): ZonaAuxiliar["tipo"] => {
  const zt = (zoneType || "").toLowerCase();
  if (zt.includes("polic")) return "policia";
  if (zt.includes("asist")) return "asistencia";
  if (zt === "safe" || zt.includes("segura")) return "segura";
  if (zt === "risk" || zt.includes("riesgo")) return "riesgo";
  const rl = (riskLevel || "").toLowerCase();
  if (rl === "high" || rl === "alto") return "riesgo";
  if (rl === "low" || rl === "bajo") return "segura";
  return "riesgo";
};

type FiltroZona = "todas" | ZonaAuxiliar["tipo"];

const FILTROS: { clave: FiltroZona; etiqueta: string; color: string }[] = [
  { clave: "todas", etiqueta: "Todas", color: "#7B1DB2" },
  { clave: "segura", etiqueta: "Segura", color: "#27AE60" },
  { clave: "riesgo", etiqueta: "Riesgo", color: "#E74C3C" },
  { clave: "asistencia", etiqueta: "Asistencia", color: "#3498DB" },
  { clave: "policia", etiqueta: "Policía", color: "#9B59B6" },
];

const filtroStyles = StyleSheet.create({
  fila: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  chipPunto: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: "700",
  },
});

type ZonaAuxiliar = {
  id: string;
  nombre: string;
  tipo: "segura" | "riesgo" | "asistencia" | "policia";
  coordenada: {
    latitude: number;
    longitude: number;
  };
  direccion: string;
  /** Radio de la zona en metros (viene del backend). */
  radio: number;
  /** Distancia en metros desde la ubicación actual, si se conoce. */
  distancia?: number;
};

// Centro de Neiva, usado si no hay ubicación ni zonas.
const CENTRO_POR_DEFECTO: LatLng = { latitude: 2.9273, longitude: -75.2819 };

const formatearDistancia = (metros: number) =>
  metros < 1000 ? `${Math.round(metros)} m` : `${(metros / 1000).toFixed(1).replace(".", ",")} km`;

// Unos 80 m por minuto a pie.
const minutosCaminando = (metros: number) => Math.max(1, Math.round(metros / 80));

export default function ZonasAuxiliares() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<any>();

  const [fullscreen, setFullscreen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZonaAuxiliar | null>(null);
  const [filtro, setFiltro] = useState<FiltroZona>("todas");

  const [zonasAuxiliares, setZonasAuxiliares] = useState<ZonaAuxiliar[]>([]);
  const [miPosicion, setMiPosicion] = useState<LatLng | null>(null);
  const mapaCompletoRef = useRef<MapView>(null);
  const [cargandoZonas, setCargandoZonas] = useState(true);
  const [errorZonas, setErrorZonas] = useState<string | null>(null);

  // Cargar zonas reales desde el backend
  React.useEffect(() => {
    let mounted = true;
    const cargar = async () => {
      setCargandoZonas(true);
      setErrorZonas(null);
      try {
        const zonas = await getZonas();
        if (!mounted) return;

        // Ubicación actual para mostrarla en el mapa y calcular distancias
        let miPosicion: LatLng | null = null;
        try {
          if (await permisoUbicacion()) {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            miPosicion = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          }
        } catch {
          miPosicion = null;
        }
        if (mounted) setMiPosicion(miPosicion);

        const mapeadas: ZonaAuxiliar[] = zonas
          .filter((z) => z.isActive !== false && z.latitude != null && z.longitude != null)
          .map((z) => {
            const tipo = mapearTipoZona(z.zoneType, z.riskLevel);
            let distancia: number | undefined;
            if (miPosicion) {
              distancia = Math.round(
                LocationService.calculateDistance(
                  miPosicion.latitude,
                  miPosicion.longitude,
                  Number(z.latitude),
                  Number(z.longitude)
                )
              );
            }
            return {
              id: String(z.id),
              nombre: z.name,
              tipo,
              coordenada: { latitude: Number(z.latitude), longitude: Number(z.longitude) },
              direccion: z.address ? `${z.address}${z.city ? ", " + z.city : ""}` : (z.city ?? ""),
              radio: Number(z.radiusMeters) > 0 ? Number(z.radiusMeters) : 100,
              distancia,
            };
          })
          // Las más cercanas primero
          .sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
        setZonasAuxiliares(mapeadas);
      } catch (err) {
        console.error("Error al cargar zonas:", err);
        if (mounted) setErrorZonas("No se pudieron cargar las zonas");
      } finally {
        if (mounted) setCargandoZonas(false);
      }
    };
    cargar();
    return () => {
      mounted = false;
    };
  }, []);

  // Zonas que se muestran según el filtro elegido (afecta la lista y los marcadores del mapa)
  const zonasFiltradas =
    filtro === "todas"
      ? zonasAuxiliares
      : zonasAuxiliares.filter((z) => z.tipo === filtro);

  const getZoneColor = (tipo: string) => {
    switch (tipo) {
      case "segura":
        return "#27AE60";
      case "riesgo":
        return "#E74C3C";
      case "asistencia":
        return "#3498DB";
      case "policia":
        return "#9B59B6";
      default:
        return "#7B1DB2";
    }
  };

  // El mapa se centra en la usuaria; si no hay ubicación, en la zona más cercana o en Neiva.
  const centroMapa = useMemo(() => {
    const centro = miPosicion ?? zonasFiltradas[0]?.coordenada ?? CENTRO_POR_DEFECTO;
    return { ...centro, latitudeDelta: 0.03, longitudeDelta: 0.03 };
  }, [miPosicion, zonasFiltradas[0]?.id]);

  const centrarEnMi = () => {
    if (!miPosicion) return;
    mapaCompletoRef.current?.animateToRegion({ ...miPosicion, latitudeDelta: 0.015, longitudeDelta: 0.015 });
  };

  const abrirComoLlegar = (zona: ZonaAuxiliar) => {
    const { latitude, longitude } = zona.coordenada;
    const etiqueta = encodeURIComponent(zona.nombre);
    const url =
      Platform.OS === "android"
        ? `geo:${latitude},${longitude}?q=${latitude},${longitude}(${etiqueta})`
        : `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${etiqueta}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.openstreetmap.org/directions?to=${latitude}%2C${longitude}`),
    );
  };

  // Círculos de cada zona, sus marcadores, el punto de la usuaria y la línea hasta la zona elegida.
  const capasMapa = () => (
    <>
      {zonasFiltradas.map((zona) => (
        <Circle
          key={`c-${zona.id}`}
          center={zona.coordenada}
          radius={zona.radio}
          fillColor={getZoneColor(zona.tipo) + "33"}
          strokeColor={getZoneColor(zona.tipo)}
          strokeWidth={2}
        />
      ))}
      {miPosicion && selectedZone && (
        <Polyline
          coordinates={[miPosicion, selectedZone.coordenada]}
          strokeColor="#1E88E5"
          strokeWidth={3}
          lineDashPattern={[8, 6]}
        />
      )}
      {zonasFiltradas.map((zona) => (
        <Marker
          key={`m-${zona.id}`}
          coordinate={zona.coordenada}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => setSelectedZone(zona)}
        >
          <View style={[marcadorStyles.zona, { backgroundColor: getZoneColor(zona.tipo) }]}>
            <MaterialIcons name={getZoneIcon(zona.tipo) as any} size={16} color="#fff" />
          </View>
        </Marker>
      ))}
      {miPosicion && (
        <Marker coordinate={miPosicion} anchor={{ x: 0.5, y: 0.5 }} title={t.mapa.tu_ubicacion_marcador}>
          <View style={marcadorStyles.yoHalo}>
            <View style={marcadorStyles.yo} />
          </View>
        </Marker>
      )}
    </>
  );

  const getZoneIcon = (tipo: string) => {
    switch (tipo) {
      case "segura":
        return "verified-user";
      case "riesgo":
        return "warning";
      case "asistencia":
        return "medical-services";
      case "policia":
        return "local-police";
      default:
        return "location-on";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
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
            <Text style={styles.headerTitle}>{t.mapa.zonas_auxiliares}</Text>
            <Text style={styles.headerSubtitle}>
              {t.mapa.zonas_auxiliares_desc}
            </Text>
          </View>
        </LinearGradient>

        {/* MAPA */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={centroMapa}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            {capasMapa()}
          </MapView>

          <TouchableOpacity
            style={styles.openMapButton}
            onPress={() => setFullscreen(true)}
          >
            <MaterialIcons name="open-in-full" size={18} color="#fff" />
            <Text style={styles.openMapText}>{t.mapa.abrir_mapa_completo}</Text>
          </TouchableOpacity>
        </View>

        {/* LEYENDA */}
        <View style={[styles.legendContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.legendTitle, { color: theme.text }]}>
            {t.mapa.leyenda}
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#27AE60" }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {t.mapa.zona_segura}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#E74C3C" }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {t.mapa.zona_riesgo}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#3498DB" }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {t.mapa.punto_asistencia}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#9B59B6" }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {t.mapa.policia}
              </Text>
            </View>
            {miPosicion && (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#1E88E5" }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>
                  {t.mapa.tu_ubicacion_marcador}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* LISTA DE ZONAS */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t.mapa.zonas_cercanas}
        </Text>

        {/* FILTRO POR TIPO DE ZONA */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={filtroStyles.fila}
        >
          {FILTROS.map((f) => {
            const activo = filtro === f.clave;
            return (
              <TouchableOpacity
                key={f.clave}
                onPress={() => setFiltro(f.clave)}
                activeOpacity={0.8}
                style={[
                  filtroStyles.chip,
                  {
                    borderColor: f.color,
                    backgroundColor: activo ? f.color : theme.card,
                  },
                ]}
              >
                {f.clave !== "todas" && (
                  <View
                    style={[
                      filtroStyles.chipPunto,
                      { backgroundColor: activo ? "#fff" : f.color },
                    ]}
                  />
                )}
                <Text
                  style={[
                    filtroStyles.chipTexto,
                    { color: activo ? "#fff" : theme.text },
                  ]}
                >
                  {f.etiqueta}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {cargandoZonas ? (
          <Text style={[styles.zoneAddress, { color: theme.contactSubtext }]}>Cargando zonas...</Text>
        ) : errorZonas ? (
          <Text style={[styles.zoneAddress, { color: "#E74C3C" }]}>{errorZonas}</Text>
        ) : zonasFiltradas.length === 0 ? (
          <Text style={[styles.zoneAddress, { color: theme.contactSubtext, marginHorizontal: 20 }]}>
            No hay zonas disponibles.
          </Text>
        ) : zonasFiltradas.map((zona) => (
          <TouchableOpacity
            key={zona.id}
            style={[styles.zoneCard, { backgroundColor: theme.card }]}
            onPress={() => setSelectedZone(zona)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.zoneIcon,
                { backgroundColor: getZoneColor(zona.tipo) + "20" },
              ]}
            >
              <MaterialIcons
                name={getZoneIcon(zona.tipo) as any}
                size={24}
                color={getZoneColor(zona.tipo)}
              />
            </View>

            <View style={styles.zoneInfo}>
              <Text style={[styles.zoneName, { color: theme.text }]}>
                {zona.nombre}
              </Text>
              <Text style={[styles.zoneAddress, { color: theme.contactSubtext }]}>
                {zona.direccion}
              </Text>
              <View style={styles.zoneMeta}>
                <MaterialIcons
                  name="directions-walk"
                  size={14}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.zoneDistance, { color: theme.contactSubtext }]}>
                  {zona.distancia != null
                    ? `${formatearDistancia(zona.distancia)} · ${t.mapa.min_caminando.replace("{n}", String(minutosCaminando(zona.distancia)))}`
                    : "--"}
                </Text>
              </View>
            </View>

            <MaterialIcons
              name="chevron-right"
              size={20}
              color={theme.contactSubtext}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MODAL DETALLE */}
      <Modal visible={!!selectedZone} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setSelectedZone(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                {selectedZone && (
                  <>
                    <View style={styles.modalHeader}>
                      <View
                        style={[
                          styles.modalIcon,
                          { backgroundColor: getZoneColor(selectedZone.tipo) + "20" },
                        ]}
                      >
                        <MaterialIcons
                          name={getZoneIcon(selectedZone.tipo) as any}
                          size={32}
                          color={getZoneColor(selectedZone.tipo)}
                        />
                      </View>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {selectedZone.nombre}
                      </Text>
                    </View>

                    <View style={styles.modalBody}>
                      <InfoRow
                        icon="place"
                        label={t.mapa.direccion}
                        value={selectedZone.direccion}
                        theme={theme}
                      />
                      <InfoRow
                        icon="category"
                        label={t.mapa.tipo}
                        value={t.mapa[`zona_${selectedZone.tipo}`] || selectedZone.tipo}
                        theme={theme}
                      />
                      <InfoRow
                        icon="directions-walk"
                        label={t.mapa.distancia}
                        value={
                          selectedZone.distancia == null
                            ? t.mapa.sin_ubicacion
                            : selectedZone.distancia <= selectedZone.radio
                              ? t.mapa.dentro_de_zona
                              : `${formatearDistancia(selectedZone.distancia)} · ${t.mapa.min_caminando.replace("{n}", String(minutosCaminando(selectedZone.distancia)))}`
                        }
                        theme={theme}
                      />
                      <InfoRow
                        icon="radio-button-checked"
                        label={t.mapa.radio_zona}
                        value={formatearDistancia(selectedZone.radio)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="my-location"
                        label={t.mapa.latitud}
                        value={selectedZone.coordenada.latitude.toFixed(5)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="location-on"
                        label={t.mapa.longitud}
                        value={selectedZone.coordenada.longitude.toFixed(5)}
                        theme={theme}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.modalCloseButton, marcadorStyles.botonLlegar]}
                      onPress={() => abrirComoLlegar(selectedZone)}
                    >
                      <MaterialIcons name="directions" size={18} color="#fff" />
                      <Text style={styles.modalCloseText}>{t.mapa.como_llegar}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setSelectedZone(null)}
                    >
                      <Text style={styles.modalCloseText}>{t.modal?.cerrar ?? "Cerrar"}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL MAPA COMPLETO */}
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView ref={mapaCompletoRef} style={{ flex: 1 }} initialRegion={centroMapa}>
            {capasMapa()}
          </MapView>

          {miPosicion && (
            <TouchableOpacity
              style={marcadorStyles.botonCentrar}
              onPress={centrarEnMi}
              accessibilityRole="button"
              accessibilityLabel={t.mapa.centrar_en_mi}
            >
              <MaterialIcons name="my-location" size={24} color="#1E88E5" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.fullscreenCloseButton}
            onPress={() => setFullscreen(false)}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

type InfoRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  theme: any;
};

function InfoRow({ icon, label, value, theme }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={20} color="#7B1DB2" />
      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const marcadorStyles = StyleSheet.create({
  zona: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 3,
  },
  yoHalo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(30,136,229,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  yo: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#1E88E5",
    borderWidth: 2,
    borderColor: "#fff",
  },
  botonCentrar: {
    position: "absolute",
    right: 16,
    bottom: 40,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  botonLlegar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E88E5",
    marginBottom: 10,
  },
});
