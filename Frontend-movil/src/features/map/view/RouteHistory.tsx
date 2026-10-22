import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Polyline } from "../../../components/map/MapLibreMap";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useSettingsViewModel } from "../../settings/viewModel/useSettingsViewModel";
import { formatRouteDate, useRoutes } from "../../../contexts/RoutesContext";
import { placeDescription, getPlace } from "../../../services/geocoding.service";
import { POINT_A_COLOR, POINT_B_COLOR } from "../routeColors";
import { styles } from "../styles/RouteHistory.style";
import { Alert } from "react-native";

type GpsPoint = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

type SavedRoute = {
  id: string;
  date: string;
  estimatedTime: string;
  estimatedDistance: string;
  startNeighborhood: string;
  endNeighborhood: string;
  municipality: string;
  department: string;
  country: string;
  points: GpsPoint[];
  pointCount: number;
  esManual: boolean;
  customName?: string;
  important: boolean;
};

// Estilos extra: acciones en vertical (estrella arriba, borrar abajo) y botón de borrar más grande
const extra = StyleSheet.create({
  verticalActions: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginLeft: 8,
  },
  starButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(217,70,239,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
});

const formatCoordinate = (p?: { latitude: number; longitude: number }) =>
  p ? `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}` : "--";

// Recorridos guardados antes de que se guardara la dirección: su etiqueta es genérica
const GENERIC_LABEL = /^(punto [ab]|inicio|fin)$/i;

type Addresses = Record<string, { start?: string; end?: string }>;

/**
 * Dirección y barrio de inicio y fin de cada recorrido. Si la etiqueta guardada ya los tiene se usa
 * tal cual; si es genérica ("Punto A") se buscan con las coordenadas, una consulta por segundo.
 */
function useRouteAddresses(routes: SavedRoute[]): Addresses {
  const [addresses, setAddresses] = useState<Addresses>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      for (const r of routes) {
        if (r.points.length === 0 || addresses[r.id]) continue;
        const search = async (text: string, p: GpsPoint) => {
          if (!GENERIC_LABEL.test(text.trim())) return text;
          const place = await getPlace(p.latitude, p.longitude);
          await new Promise((res) => setTimeout(res, 1100));
          return place ? placeDescription(place) || undefined : undefined;
        };
        const start = await search(r.startNeighborhood, r.points[0]);
        const end = await search(r.endNeighborhood, r.points[r.points.length - 1]);
        if (!alive) return;
        setAddresses((prev) => ({ ...prev, [r.id]: { start, end } }));
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes]);

  return addresses;
}

export default function HistorialRecorridos() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<any>();
  const { showRoutes: showRoutes } = useSettingsViewModel();
  const { routes: manualRoutes, deleteRoute, toggleImportant } = useRoutes();

  const [fullscreen, setFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedRoute | null>(null);
  const detailMapRef = useRef<MapView>(null);

  // Encuadra todo el recorrido (inicio, fin y los puntos intermedios) en el mapa del detalle
  const fitRoute = () => {
    const points = selectedItem?.points ?? [];
    if (points.length < 2) return;
    detailMapRef.current?.fitToCoordinates(
      points.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
      { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: false },
    );
  };

  const allRoutes: SavedRoute[] = manualRoutes;
  const addresses = useRouteAddresses(allRoutes);

  // Dirección de inicio o fin para mostrar; mientras se busca, la etiqueta guardada
  const addressOf = (r: SavedRoute, end: "start" | "end") => {
    const found = addresses[r.id]?.[end];
    if (found) return found;
    const saved = end === "start" ? r.startNeighborhood : r.endNeighborhood;
    if (!GENERIC_LABEL.test(saved.trim())) return saved;
    return addresses[r.id] ? "Dirección no disponible" : "Buscando dirección…";
  };

  const confirmRemove = (id: string, name: string) => {
    Alert.alert(
      "Eliminar recorrido",
      `¿Estás segura de que quieres eliminar el recorrido "${name}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const result = await deleteRoute(id);
            if (!result.ok && result.reason) {
              Alert.alert("No se pudo eliminar", result.reason);
            }
          },
        },
      ]
    );
  };

  const toggleImportantHandler = async (id: string) => {
    const result = await toggleImportant(id);
    if (!result.ok && result.reason) {
      Alert.alert("Límite alcanzado", result.reason);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER MEJORADO */}
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
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t.mapa.historial_recorridos}</Text>
          <Text style={styles.headerSubtitle}>
            {t.mapa.historial_recorridos_desc}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* LISTA DE HISTORIAL */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t.mapa.historial_reciente}
        </Text>

        {!showRoutes ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <MaterialIcons name="location-off" size={48} color={theme.contactSubtext} />
            <Text style={[styles.emptyStateText, { color: theme.contactSubtext }]}>
              Los recorridos están ocultos
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.contactSubtext }]}>
              Activa «Mostrar recorridos en mapa» en Ajustes
            </Text>
          </View>
        ) : (
          allRoutes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.historyCard, { backgroundColor: theme.card }]}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.85}
            >
              <View style={styles.historyIcon}>
                <MaterialIcons name="route" size={24} color="#7B1DB2" />
              </View>

            <View style={styles.historyInfo}>
              <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={2}>
                {item.customName || `${item.startNeighborhood} → ${item.endNeighborhood}`}
              </Text>

              <View style={styles.dateRow}>
                <MaterialIcons
                  name="calendar-today"
                  size={16}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.timeText, { color: theme.contactSubtext }]}>
                  {formatRouteDate(item.date)}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <MaterialIcons name="trip-origin" size={14} color={POINT_A_COLOR} />
                <Text
                  style={[styles.addressText, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {addressOf(item, "start")}
                </Text>
              </View>

              <View style={[styles.locationRow, { marginTop: 4 }]}>
                <MaterialIcons name="flag" size={14} color={POINT_B_COLOR} />
                <Text
                  style={[styles.addressText, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {addressOf(item, "end")}
                </Text>
              </View>
            </View>

            {/* ACCIONES: estrella y borrar, una debajo de la otra */}
            <View style={extra.verticalActions}>
              <TouchableOpacity
                style={extra.starButton}
                onPress={() => toggleImportantHandler(item.id)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={item.important ? "star" : "star-border"}
                  size={28}
                  color={item.important ? "#FFD700" : theme.contactSubtext}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={extra.deleteButton}
                onPress={() =>
                  confirmRemove(
                    item.id,
                    item.customName || `${item.startNeighborhood} → ${item.endNeighborhood}`
                  )
                }
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete" size={30} color={POINT_B_COLOR} />
              </TouchableOpacity>
            </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MODAL DETALLE MEJORADO */}
      <Modal visible={!!selectedItem} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setSelectedItem(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                {selectedItem && (
                  <>
                    {/* HEADER DEL MODAL */}
                    <View style={styles.modalHeaderImproved}>
                      <View style={styles.modalIcon}>
                        <MaterialIcons name="route" size={32} color="#7B1DB2" />
                      </View>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {selectedItem.customName || `Recorrido #${selectedItem.id}`}
                      </Text>
                    </View>

                    <View style={styles.modalBody}>
                      <InfoRow
                        icon="calendar-today"
                        label="Fecha"
                        value={formatRouteDate(selectedItem.date, true)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="trip-origin"
                        label="Inicio"
                        value={addressOf(selectedItem, "start")}
                        theme={theme}
                      />
                      <InfoRow
                        icon="flag"
                        label="Fin"
                        value={addressOf(selectedItem, "end")}
                        theme={theme}
                      />
                      {!!selectedItem.municipality && (
                        <InfoRow
                          icon="location-city"
                          label="Municipio"
                          value={[selectedItem.municipality, selectedItem.department].filter(Boolean).join(", ")}
                          theme={theme}
                        />
                      )}
                      <InfoRow
                        icon="straighten"
                        label="Distancia"
                        value={selectedItem.estimatedDistance}
                        theme={theme}
                      />
                      <InfoRow
                        icon="schedule"
                        label="Tiempo a pie"
                        value={selectedItem.estimatedTime}
                        theme={theme}
                      />
                      <InfoRow
                        icon="my-location"
                        label="Coordenadas"
                        value={`${formatCoordinate(selectedItem.points[0])} → ${formatCoordinate(
                          selectedItem.points[selectedItem.points.length - 1],
                        )}`}
                        theme={theme}
                      />
                    </View>

                    {/* MAPA PREVIEW CON POLYLINE */}
                    <View style={styles.mapPreview}>
                      <MapView
                        ref={detailMapRef}
                        style={styles.map}
                        initialRegion={{
                          latitude: selectedItem.points[0].latitude,
                          longitude: selectedItem.points[0].longitude,
                          latitudeDelta: 0.02,
                          longitudeDelta: 0.02,
                        }}
                        onMapReady={fitRoute}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                      >
                        {/* Línea del recorrido */}
                        <Polyline
                          coordinates={selectedItem.points.map(point => ({
                            latitude: point.latitude,
                            longitude: point.longitude,
                          }))}
                          strokeWidth={4}
                          strokeColor="#7B1DB2"
                        />

                        {/* Marcador de inicio */}
                        <Marker
                          coordinate={selectedItem.points[0]}
                          title="Inicio"
                          pinColor={POINT_A_COLOR}
                        />

                        {/* Marcador de fin */}
                        <Marker
                          coordinate={selectedItem.points[selectedItem.points.length - 1]}
                          title="Fin"
                          pinColor={POINT_B_COLOR}
                        />
                      </MapView>
                    </View>

                    {/* BOTONES DE ACCIÓN */}
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.modalButtonSecondary]}
                        onPress={() => setSelectedItem(null)}
                      >
                        <MaterialIcons name="close" size={20} color={theme.text} />
                        <Text style={[styles.modalActionText, { color: theme.text }]}>
                          {t.modal.cerrar}
                        </Text>
                      </TouchableOpacity>

                     
                    </View>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
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