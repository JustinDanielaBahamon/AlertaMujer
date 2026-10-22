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
import MapView, { Circle, Marker, Polyline, type LatLng } from "../../../components/map/MapLibreMap";
import * as Location from "expo-location";
import { locationPermission } from "../../../services/safePermissions";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { styles } from "../styles/HelpZones.style";
import { getZones } from "../../../services/zones.service";
import { LocationService } from "../../../services/location.service";

const mapZoneType = (zoneType?: string, riskLevel?: string): HelpZone["type"] => {
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

type ZoneFilter = "todas" | HelpZone["type"];

const FILTERS: { key: ZoneFilter; label: string; color: string }[] = [
  { key: "todas", label: "Todas", color: "#7B1DB2" },
  { key: "segura", label: "Segura", color: "#27AE60" },
  { key: "riesgo", label: "Riesgo", color: "#E74C3C" },
  { key: "asistencia", label: "Asistencia", color: "#3498DB" },
  { key: "policia", label: "Policía", color: "#9B59B6" },
];

const filterStyles = StyleSheet.create({
  row: {
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
  chipDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
});

type HelpZone = {
  id: string;
  name: string;
  type: "segura" | "riesgo" | "asistencia" | "policia";
  coordinate: {
    latitude: number;
    longitude: number;
  };
  address: string;
  /** Zone radius in meters (comes from the backend). */
  radio: number;
  /** Distance in meters from the current location, if known. */
  distance?: number;
};

// Neiva center, used if there is no location or zones.
const DEFAULT_CENTER: LatLng = { latitude: 2.9273, longitude: -75.2819 };

const formatDistance = (metros: number) =>
  metros < 1000 ? `${Math.round(metros)} m` : `${(metros / 1000).toFixed(1).replace(".", ",")} km`;

// About 80 m per minute on foot.
const walkingMinutes = (metros: number) => Math.max(1, Math.round(metros / 80));

export default function ZonasAuxiliares() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<any>();

  const [fullscreen, setFullscreen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<HelpZone | null>(null);
  const [filter, setFilter] = useState<ZoneFilter>("todas");

  const [helpZones, setHelpZones] = useState<HelpZone[]>([]);
  const [myPosition, setMyPosition] = useState<LatLng | null>(null);
  const fullMapRef = useRef<MapView>(null);
  const [loadingZones, setLoadingZones] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);

  // Load the real zones from the backend
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingZones(true);
      setZonesError(null);
      try {
        const zones = await getZones();
        if (!mounted) return;

        // Current location to show it on the map and compute distances
        let myPosition: LatLng | null = null;
        try {
          if (await locationPermission()) {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            myPosition = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          }
        } catch {
          myPosition = null;
        }
        if (mounted) setMyPosition(myPosition);

        const mapped: HelpZone[] = zones
          .filter((z) => z.isActive !== false && z.latitude != null && z.longitude != null)
          .map((z) => {
            const type = mapZoneType(z.zoneType, z.riskLevel);
            let distance: number | undefined;
            if (myPosition) {
              distance = Math.round(
                LocationService.calculateDistance(
                  myPosition.latitude,
                  myPosition.longitude,
                  Number(z.latitude),
                  Number(z.longitude)
                )
              );
            }
            return {
              id: String(z.id),
              name: z.name,
              type: type,
              coordinate: { latitude: Number(z.latitude), longitude: Number(z.longitude) },
              address: z.address ? `${z.address}${z.city ? ", " + z.city : ""}` : (z.city ?? ""),
              radio: Number(z.radiusMeters) > 0 ? Number(z.radiusMeters) : 100,
              distance: distance,
            };
          })
          // Closest first
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        setHelpZones(mapped);
      } catch (err) {
        console.error("Error al cargar zonas:", err);
        if (mounted) setZonesError("No se pudieron cargar las zonas");
      } finally {
        if (mounted) setLoadingZones(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Zones shown for the chosen filter (affects the list and the map markers)
  const filteredZones =
    filter === "todas"
      ? helpZones
      : helpZones.filter((z) => z.type === filter);

  const getZoneColor = (type: string) => {
    switch (type) {
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

  // The map centers on the user; without a location, on the closest zone or on Neiva.
  const mapCenter = useMemo(() => {
    const center = myPosition ?? filteredZones[0]?.coordinate ?? DEFAULT_CENTER;
    return { ...center, latitudeDelta: 0.03, longitudeDelta: 0.03 };
  }, [myPosition, filteredZones[0]?.id]);

  const centerOnMe = () => {
    if (!myPosition) return;
    fullMapRef.current?.animateToRegion({ ...myPosition, latitudeDelta: 0.015, longitudeDelta: 0.015 });
  };

  const openDirections = (zone: HelpZone) => {
    const { latitude, longitude } = zone.coordinate;
    const label = encodeURIComponent(zone.name);
    const url =
      Platform.OS === "android"
        ? `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`
        : `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${label}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.openstreetmap.org/directions?to=${latitude}%2C${longitude}`),
    );
  };

  // Circles of each zone, their markers, the user's dot and the line to the chosen zone.
  const mapLayers = () => (
    <>
      {filteredZones.map((zone) => (
        <Circle
          key={`c-${zone.id}`}
          center={zone.coordinate}
          radius={zone.radio}
          fillColor={getZoneColor(zone.type) + "33"}
          strokeColor={getZoneColor(zone.type)}
          strokeWidth={2}
        />
      ))}
      {myPosition && selectedZone && (
        <Polyline
          coordinates={[myPosition, selectedZone.coordinate]}
          strokeColor="#1E88E5"
          strokeWidth={3}
          lineDashPattern={[8, 6]}
        />
      )}
      {filteredZones.map((zone) => (
        <Marker
          key={`m-${zone.id}`}
          coordinate={zone.coordinate}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => setSelectedZone(zone)}
        >
          <View style={[markerStyles.zone, { backgroundColor: getZoneColor(zone.type) }]}>
            <MaterialIcons name={getZoneIcon(zone.type) as any} size={16} color="#fff" />
          </View>
        </Marker>
      ))}
      {myPosition && (
        <Marker coordinate={myPosition} anchor={{ x: 0.5, y: 0.5 }} title={t.mapa.tu_ubicacion_marcador}>
          <View style={markerStyles.yoHalo}>
            <View style={markerStyles.yo} />
          </View>
        </Marker>
      )}
    </>
  );

  const getZoneIcon = (type: string) => {
    switch (type) {
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

        {/* MAP */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapCenter}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            {mapLayers()}
          </MapView>

          <TouchableOpacity
            style={styles.openMapButton}
            onPress={() => setFullscreen(true)}
          >
            <MaterialIcons name="open-in-full" size={18} color="#fff" />
            <Text style={styles.openMapText}>{t.mapa.abrir_mapa_completo}</Text>
          </TouchableOpacity>
        </View>

        {/* LEGEND */}
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
            {myPosition && (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#1E88E5" }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>
                  {t.mapa.tu_ubicacion_marcador}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ZONE LIST */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t.mapa.zonas_cercanas}
        </Text>

        {/* FILTER BY ZONE TYPE */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={filterStyles.row}
        >
          {FILTERS.map((f) => {
            const enabled = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.8}
                style={[
                  filterStyles.chip,
                  {
                    borderColor: f.color,
                    backgroundColor: enabled ? f.color : theme.card,
                  },
                ]}
              >
                {f.key !== "todas" && (
                  <View
                    style={[
                      filterStyles.chipDot,
                      { backgroundColor: enabled ? "#fff" : f.color },
                    ]}
                  />
                )}
                <Text
                  style={[
                    filterStyles.chipText,
                    { color: enabled ? "#fff" : theme.text },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loadingZones ? (
          <Text style={[styles.zoneAddress, { color: theme.contactSubtext }]}>Cargando zonas...</Text>
        ) : zonesError ? (
          <Text style={[styles.zoneAddress, { color: "#E74C3C" }]}>{zonesError}</Text>
        ) : filteredZones.length === 0 ? (
          <Text style={[styles.zoneAddress, { color: theme.contactSubtext, marginHorizontal: 20 }]}>
            No hay zonas disponibles.
          </Text>
        ) : filteredZones.map((zone) => (
          <TouchableOpacity
            key={zone.id}
            style={[styles.zoneCard, { backgroundColor: theme.card }]}
            onPress={() => setSelectedZone(zone)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.zoneIcon,
                { backgroundColor: getZoneColor(zone.type) + "20" },
              ]}
            >
              <MaterialIcons
                name={getZoneIcon(zone.type) as any}
                size={24}
                color={getZoneColor(zone.type)}
              />
            </View>

            <View style={styles.zoneInfo}>
              <Text style={[styles.zoneName, { color: theme.text }]}>
                {zone.name}
              </Text>
              <Text style={[styles.zoneAddress, { color: theme.contactSubtext }]}>
                {zone.address}
              </Text>
              <View style={styles.zoneMeta}>
                <MaterialIcons
                  name="directions-walk"
                  size={14}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.zoneDistance, { color: theme.contactSubtext }]}>
                  {zone.distance != null
                    ? `${formatDistance(zone.distance)} · ${t.mapa.min_caminando.replace("{n}", String(walkingMinutes(zone.distance)))}`
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

      {/* DETAIL MODAL */}
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
                          { backgroundColor: getZoneColor(selectedZone.type) + "20" },
                        ]}
                      >
                        <MaterialIcons
                          name={getZoneIcon(selectedZone.type) as any}
                          size={32}
                          color={getZoneColor(selectedZone.type)}
                        />
                      </View>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {selectedZone.name}
                      </Text>
                    </View>

                    <View style={styles.modalBody}>
                      <InfoRow
                        icon="place"
                        label={t.mapa.direccion}
                        value={selectedZone.address}
                        theme={theme}
                      />
                      <InfoRow
                        icon="category"
                        label={t.mapa.tipo}
                        value={t.mapa[`zona_${selectedZone.type}`] || selectedZone.type}
                        theme={theme}
                      />
                      <InfoRow
                        icon="directions-walk"
                        label={t.mapa.distancia}
                        value={
                          selectedZone.distance == null
                            ? t.mapa.sin_ubicacion
                            : selectedZone.distance <= selectedZone.radio
                              ? t.mapa.dentro_de_zona
                              : `${formatDistance(selectedZone.distance)} · ${t.mapa.min_caminando.replace("{n}", String(walkingMinutes(selectedZone.distance)))}`
                        }
                        theme={theme}
                      />
                      <InfoRow
                        icon="radio-button-checked"
                        label={t.mapa.radio_zona}
                        value={formatDistance(selectedZone.radio)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="my-location"
                        label={t.mapa.latitud}
                        value={selectedZone.coordinate.latitude.toFixed(5)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="location-on"
                        label={t.mapa.longitud}
                        value={selectedZone.coordinate.longitude.toFixed(5)}
                        theme={theme}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.modalCloseButton, markerStyles.arriveButton]}
                      onPress={() => openDirections(selectedZone)}
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

      {/* FULL MAP MODAL */}
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView ref={fullMapRef} style={{ flex: 1 }} initialRegion={mapCenter}>
            {mapLayers()}
          </MapView>

          {myPosition && (
            <TouchableOpacity
              style={markerStyles.centerButton}
              onPress={centerOnMe}
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

const markerStyles = StyleSheet.create({
  zone: {
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
  centerButton: {
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
  arriveButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E88E5",
    marginBottom: 10,
  },
});
