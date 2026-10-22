import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Circle, Marker, Polyline } from "../../../components/map/MapLibreMap";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../styles/MapStyles";
import { createMapModalStyles } from "../styles/MapModal.style";
import { useMapViewModel } from "../viewModel/useMapViewModel";
import {
  formatRouteDate,
  MAX_IMPORTANTES,
  MAX_ROUTES,
  useRoutes,
  type SavedRoute,
} from "../../../contexts/RoutesContext";
import { POINT_B_COLOR } from "../routeColors";
import { useAuth } from "../../../contexts/AuthContext";
import { frequentLocationsService } from "../../../services/frequent-locations.service";
import AddressSearchBar from "./AddressSearchBar";
import { getZones } from "../../../services/zones.service";
import { getPlace } from "../../../services/geocoding.service";

type Coord = { latitude: number; longitude: number };

type AddressInfoBlock = {
  zone: string; // neighborhood, or the city if there is no neighborhood (used in the header)
  neighborhood: string;
  city: string;
  address: string;
};

// Different colors for each saved route, so they do not pile up
// Only the app palette: violets, purples and neon
const ROUTE_COLORS = [
  "#7B1DB2", // Purple
  "#D946EF", // Neon purple
  "#9333EA", // Violet
  "#C026D3", // Fuchsia
  "#6D28D9", // Dark violet
  "#A855F7", // Lila
  "#4C1D95", // Deep purple
  "#E879F9", // Light neon
];

// Zones classified by the user ("Classify zone" screen), drawn as circles on the map
type ClassifiedZone = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  riskLevel: "muy_segura" | "moderada" | "muy_insegura";
};

const ZONE_RADIUS_METERS = 150;

// Zones the user classified: app palette shades by level
const LEVEL_COLOR: Record<ClassifiedZone["riskLevel"], string> = {
  muy_segura: "#7C3AED",
  moderada: "#C084FC",
  muy_insegura: "#D946EF",
};

// System emergency zones (police, assistance, safe zones): always visible, in dark
// purple and with an icon, so they are not confused with the user's
type OfficialZone = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  radio: number;
};

const OFFICIAL_ZONE_COLOR = "#4C1D95";

const OFFICIAL_ZONE_ICON: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  policia: "local-police",
  asistencia: "health-and-safety",
  help: "support",
  safe: "verified-user",
};

const distanceMeters = (a: Coord, b: Coord) => {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

// Looks up the address of some coordinates (neighborhood, city and street)
const getAddressInfo = async (coord: Coord): Promise<AddressInfoBlock> => {
  const reverse = await Location.reverseGeocodeAsync(coord);
  const info = reverse?.[0];

  const street = info?.street || info?.name || "";
  const number = info?.streetNumber || "";
  // In Colombia the phone geocoder almost never returns the neighborhood: OpenStreetMap fills it in
  const neighborhood =
    info?.district || (await getPlace(coord.latitude, coord.longitude).catch(() => null))?.neighborhood || "";
  const municipality = info?.city || info?.subregion || "";

  return {
    zone: neighborhood || municipality,
    neighborhood,
    city: [municipality, info?.region].filter(Boolean).join(", "),
    address: `${street} ${number}`.trim(),
  };
};

type MapStyles = ReturnType<typeof createMapModalStyles>;

// Dotted line + numbered route pins (same design as "Emergency alert")
function HistoryPins({
  points,
  current,
  lineColor,
  styles: ms,
  trackChanges,
  label,
  currentTitle,
}: {
  points: Coord[];
  current: Coord;
  lineColor: string;
  styles: MapStyles;
  trackChanges: boolean;
  label: string;
  currentTitle: string;
}) {
  // The line ends at the current position
  const line = [...points, current];

  return (
    <>
      {line.length > 1 && (
        <Polyline
          coordinates={line}
          strokeColor={lineColor}
          strokeWidth={3}
          lineDashPattern={[6, 4]}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {points.map((p, i) => (
        <Marker
          key={`hist-${i}`}
          coordinate={p}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={trackChanges}
          zIndex={i}
          title={`${label} ${i + 1}`}
        >
          <View style={ms.pin}>
            <Text style={ms.pinText}>{i + 1}</Text>
          </View>
        </Marker>
      ))}

      {/* Current position: big pin on top */}
      <Marker
        coordinate={current}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={trackChanges}
        zIndex={999}
        title={currentTitle}
      >
        <View style={ms.currentPin}>
          <MaterialIcons name="my-location" size={18} color="#FFFFFF" />
        </View>
      </Marker>
    </>
  );
}

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const { routes } = useRoutes();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const mounted = useRef(true);
  const lastGeocoded = useRef<Coord | null>(null);

  const [showRoutesOnMap, setShowRoutesOnMap] = useState(true); // On by default
  const [onlyImportant, setOnlyImportant] = useState(false); // Show all by default
  const [addressInfoText, setAddressInfoText] = useState<AddressInfoBlock | null>(null);
  const [routeInfoVisible, setRouteInfoVisible] = useState(false);
  const [routeInfo, setRouteInfo] = useState<SavedRoute | null>(null);
  const [mapReady, setMapReady] = useState(false); // the big map is drawn when the modal animation ends
  const [trackChanges, setTrackChanges] = useState(true); // custom pins are redrawn only for a few moments
  const [classifiedZones, setClassifiedZones] = useState<ClassifiedZone[]>([]);
  const [officialZones, setOfficialZones] = useState<OfficialZone[]>([]);
  const [showMyZones, setShowMyZones] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{
    coord: Coord;
    text: string;
  } | null>(null);

  const {
    theme,
    t,
    location,
    fullscreen,
    setFullscreen,
    history,
    alertDestination,
    centerCoordinate,
    lastUpdate,
    precisionMetros,
    formatHour,
    refreshLocation,
    retryPermissions,
    goToSavedLocations,
    goToHelpZones,
    goToRouteHistory,
    permissionDenied,
    disabledServices,
    loading,
  } = useMapViewModel();

  const ms = useMemo(() => createMapModalStyles(theme, insets), [theme, insets]);

  const currentAddress = addressInfoText
    ? addressInfoText.zone
      ? `${addressInfoText.zone}, ${addressInfoText.address}`.replace(/, $/, "")
      : addressInfoText.address
    : "";

  // Saved routes drawn on the big map (same logic as always)
  const visibleRoutes = useMemo(
    () =>
      !showRoutesOnMap
        ? []
        : (routes as any[]).filter(
            (r) => r?.points?.length > 0 && (!onlyImportant || r.important)
          ),
    [routes, showRoutesOnMap, onlyImportant]
  );

  const goToSaveRoute = () => {
    navigation.navigate("SaveRoute");
  };

  // Classified zones (safe / moderate / unsafe): reloaded every time the map is opened again
  useFocusEffect(
    useCallback(() => {
      let enabled = true;
      (async () => {
        try {
          if (!user?.id) {
            if (enabled) setClassifiedZones([]);
            return;
          }
          const savedOnes = await frequentLocationsService.getByUser(user.id);
          if (!enabled) return;
          setClassifiedZones(
            savedOnes
              .filter(
                (u) => u.isActive !== false && u.latitude != null && u.longitude != null
              )
              .map((u) => ({
                id: String(u.id),
                name: u.name,
                latitude: Number(u.latitude),
                longitude: Number(u.longitude),
                riskLevel:
                  u.riskLevel === "muy_segura" || u.riskLevel === "muy_insegura"
                    ? u.riskLevel
                    : "moderada",
              }))
          );
        } catch (error) {
          console.error("Error al cargar zonas clasificadas:", error);
        }
      })();
      return () => {
        enabled = false;
      };
    }, [user?.id])
  );

  // When an address is searched with the big map open, the camera moves there
  useEffect(() => {
    if (!fullscreen || !mapReady || !searchResult) return;
    mapRef.current?.animateToRegion(
      {
        latitude: searchResult.coord.latitude,
        longitude: searchResult.coord.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      },
      500
    );
  }, [searchResult, fullscreen, mapReady]);

  const handleSearchResult = (coord: Coord, text: string) => {
    setSearchResult({ coord, text });
    setFullscreen(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResult(null);
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // The big map is mounted when the modal finishes sliding so the animation does not stutter
  useEffect(() => {
    if (!fullscreen) {
      setMapReady(false);
      return;
    }
    const id = setTimeout(() => setMapReady(true), 300);
    return () => clearTimeout(id);
  }, [fullscreen]);

  // Custom pins are redrawn for a few moments when they change or the map opens
  useEffect(() => {
    setTrackChanges(true);
    const id = setTimeout(() => setTrackChanges(false), 600);
    return () => clearTimeout(id);
  }, [history?.length, fullscreen, mapReady, visibleRoutes.length]);

  // Current address (reverse geocoding). Only queried at the start or after moving more than 40 m,
  // so there is no network request on every GPS update.
  useEffect(() => {
    if (!location) return;

    const previous = lastGeocoded.current;
    if (previous && distanceMeters(previous, location) < 40) return;
    lastGeocoded.current = location;

    (async () => {
      try {
        const info = await getAddressInfo(location);
        if (mounted.current) setAddressInfoText(info);
      } catch (error) {
        console.error("Error al obtener dirección:", error);
      }
    })();
  }, [location]);

  const handleShare = async () => {
    if (!location) return;

    try {
      let info = addressInfoText;
      if (!info) {
        try {
          info = await getAddressInfo(location);
        } catch {
          info = null;
        }
      }

      const now = new Date();
      const date = now.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const time = now.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const lat = location.latitude.toFixed(6);
      const lng = location.longitude.toFixed(6);

      // Only the lines that actually have data are included
      const lines = [
        t.mapa.mensaje_ubicacion,
        "",
        info?.neighborhood ? `🏘️ Barrio: ${info.neighborhood}` : null,
        info?.city ? `🏙️ Ciudad: ${info.city}` : null,
        info?.address ? `🛣️ Dirección: ${info.address}` : null,
        `🧭 Coordenadas: ${lat}, ${lng}`,
        "",
        "🗺️ Ábrela en el mapa:",
        `https://www.google.com/maps?q=${lat},${lng}`,
        "",
        `🕐 Enviado el ${date} a las ${time}`,
        "💜 Compartido desde AlertaMujer",
      ].filter((line): line is string => line !== null);

      await Share.share({
        title: t.mapa.compartir_ubicacion,
        message: lines.join("\n"),
      });
    } catch (error) {
      console.error("Error al compartir ubicación:", error);
      Alert.alert("Error", `${t.mapa.compartir_error}. Inténtalo nuevamente.`);
    }
  };

  // ─── LOADING SCREEN ──────────────────────────────────────────────────────
  // System emergency zones: loaded when entering the map (they do not depend on the user).
  // It must go before the "no location" return: a hook after a return changes the
  // number of hooks between renders and React closes the app.
  useFocusEffect(
    useCallback(() => {
      let enabled = true;
      getZones()
        .then((zones) => {
          if (!enabled) return;
          setOfficialZones(
            zones
              .filter((z) => z.isActive !== false && z.latitude != null && z.longitude != null)
              .map((z) => ({
                id: String(z.id),
                name: z.name,
                type: (z.zoneType || "").toLowerCase(),
                latitude: Number(z.latitude),
                longitude: Number(z.longitude),
                radio: Number(z.radiusMeters) > 0 ? Number(z.radiusMeters) : ZONE_RADIUS_METERS,
              }))
          );
        })
        .catch((error) => console.warn("No se pudieron cargar las zonas de emergencia:", error));
      return () => {
        enabled = false;
      };
    }, [])
  );

  if (!location) {
    const esError = permissionDenied || disabledServices;
    
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <MaterialIcons 
          name={disabledServices ? "settings" : (permissionDenied ? "location-off" : "location-searching")} 
          size={48} 
          color={esError ? "#D946EF" : "#7B1DB2"} 
        />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          {disabledServices 
            ? "Ubicación desactivada" 
            : (permissionDenied 
              ? "Permiso de ubicación denegado" 
              : (loading ? t.mapa.cargando : "No se pudo obtener la ubicación"))}
        </Text>
        {disabledServices && (
          <Text style={[styles.loadingText, { color: theme.contactSubtext, fontSize: 13, marginTop: 4, textAlign: "center" }]}>
            Activa los servicios de ubicación en la configuración de tu dispositivo
          </Text>
        )}
        {permissionDenied && (
          <Text style={[styles.loadingText, { color: theme.contactSubtext, fontSize: 13, marginTop: 4, textAlign: "center" }]}>
            AlertaMujer necesita acceso a tu ubicación para mostrarte el mapa y garantizar tu seguridad
          </Text>
        )}
        <TouchableOpacity style={styles.retryButton} onPress={retryPermissions}>
          <Text style={styles.retryButtonText}>{disabledServices ? "Verificar de nuevo" : t.mapa.intentar_nuevo}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── CENTER COORDINATE AND LOCAL ACTIONS ─────────────────────────────────
  const computedCenter = centerCoordinate ?? alertDestination?.coordinate ?? location;
  const mapCenter: Coord = searchResult?.coord ?? computedCenter;

  // Circle with the safety level color of each classified zone (if the user shows them)
  const renderClassifiedZones = () =>
    !showMyZones
      ? null
      : classifiedZones.map((zone) => {
          const color = LEVEL_COLOR[zone.riskLevel];
          return (
            <Circle
              key={`zona-${zone.id}`}
              center={{ latitude: zone.latitude, longitude: zone.longitude }}
              radius={ZONE_RADIUS_METERS}
              strokeColor={color}
              strokeWidth={1.5}
              fillColor={`${color}22`}
            />
          );
        });

  // Emergency zones: dark purple circle and an icon of the zone type
  const renderOfficialZones = () =>
    officialZones.map((zone) => (
      <React.Fragment key={`oficial-${zone.id}`}>
        <Circle
          center={{ latitude: zone.latitude, longitude: zone.longitude }}
          radius={zone.radio}
          strokeColor={OFFICIAL_ZONE_COLOR}
          strokeWidth={2.5}
          fillColor={`${OFFICIAL_ZONE_COLOR}26`}
        />
        <Marker
          coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          title={zone.name}
        >
          <View style={[ms.routePin, { backgroundColor: OFFICIAL_ZONE_COLOR }]}>
            <MaterialIcons name={OFFICIAL_ZONE_ICON[zone.type] ?? "place"} size={14} color="#FFFFFF" />
          </View>
        </Marker>
      </React.Fragment>
    ));

  const actions = [
    {
      icon: "share",
      label: t.mapa.compartir,
      action: handleShare,
    },
    {
      icon: "refresh",
      label: t.mapa.actualizar,
      action: refreshLocation,
    },
    {
      icon: "navigation",
      label: t.mapa.navegar,
      action: () => {
        if (location) {
          setFullscreen(true);
        }
      },
    },
    {
      icon: "bookmark",
      label: t.mapa.guardar,
      action: () => {
        if (!location) return;
        navigation.navigate("ClassifyZone", {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      },
    },
  ] as const;

  // ─── BIG MAP FITTING ─────────────────────────────────────────────────────
  // Every visible point: location, alert address, history and routes.
  const visiblePoints = (): Coord[] => {
    const pts: Coord[] = [location];
    if (alertDestination) pts.push(alertDestination.coordinate);
    if (searchResult) pts.push(searchResult.coord);
    (history ?? []).forEach((p: Coord) => pts.push(p));
    visibleRoutes.forEach((r) =>
      r.points.forEach((p: any) => pts.push({ latitude: p.latitude, longitude: p.longitude }))
    );
    return pts;
  };

  const seeAll = () => {
    const pts = visiblePoints();
    if (pts.length < 2) {
      centerOnMe();
      return;
    }
    mapRef.current?.fitToCoordinates(pts, {
      edgePadding: { top: insets.top + 90, right: 60, bottom: insets.bottom + 130, left: 60 },
      animated: true,
    });
  };

  const centerOnMe = () => {
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      400
    );
  };

  const openRouteInfo = (route: SavedRoute) => {
    setRouteInfo(route);
    setRouteInfoVisible(true);
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* GRADIENT HEADER */}
        <LinearGradient
          colors={[theme.headercolor1, theme.headercolor2]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitleText}>{t.mapa.titulo}</Text>
              <Text style={styles.HeaderSubtitle}>{t.mapa.subtitulo}</Text>
              <View style={styles.locationRow}>
                <MaterialIcons name="place" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.headerSubtitleText}>
                  {currentAddress || t.mapa.obteniendo}
                </Text>
              </View>
            </View>
            <Image
              source={require("../../../../assets/imagesAlertaMujer/ScMapa/iconoUbi.png")}
              style={{ width: 100, height: 85, resizeMode: "cover" }}
            />
          </View>
        </LinearGradient>

        {/* ADDRESS SEARCH BAR */}
        <AddressSearchBar
          style={{ marginHorizontal: 20, marginTop: 20 }}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onResult={handleSearchResult}
          onClear={clearSearch}
          city={addressInfoText?.city}
        />

        {/* MAP */}
        <View style={ms.mapCard}>
          <MapView
            style={ms.miniMap}
            liteMode
            pointerEvents="none"
            toolbarEnabled={false}
            region={{
              latitude: mapCenter.latitude,
              longitude: mapCenter.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            {renderOfficialZones()}
            {renderClassifiedZones()}
            <Marker coordinate={location} title={t.mapa.tu_ubicacion_marcador} pinColor={theme.icon} />
            {searchResult && (
              <Marker
                coordinate={searchResult.coord}
                title={searchResult.text}
                pinColor="#E91E63"
              />
            )}
            {alertDestination && (
              <Marker
                coordinate={alertDestination.coordinate}
                title={t.mapa.direccion_alerta_marcador}
                description={alertDestination.address}
                pinColor="#7B1DB2"
              />
            )}
          </MapView>

          {/* Transparent layer: catches the tap so Android does not open the Google Maps app */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setFullscreen(true)}
            activeOpacity={0.9}
          >
            <View style={ms.miniBadge}>
              <View style={ms.miniBadgeDot} />
              <Text style={ms.miniBadgeText}>{t.mapa.activo}</Text>
            </View>
            <View style={ms.openButton}>
              <MaterialIcons name="open-in-full" size={16} color={theme.icon} />
              <Text style={ms.openText}>{t.mapa.abrir_mapa_completo}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* MAP OPTIONS: a single box with the layers the user wants to see */}
        <View style={[styles.routesSwitchContainer, op.panel, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={op.header}
            onPress={() => setOptionsOpen((v) => !v)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ expanded: optionsOpen }}
          >
            <View style={[op.headerIconItem, { backgroundColor: theme.icon + "22" }]}>
              <MaterialIcons name="tune" size={20} color={theme.icon} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.routesSwitchTitle, { color: theme.text }]}>{t.mapa.opciones_titulo}</Text>
              <Text style={[styles.routesSwitchSubtitle, { color: theme.contactSubtext }]}>
                {t.mapa.opciones_resumen.replace(
                  "{n}",
                  String([showRoutesOnMap, showMyZones, showRoutesOnMap && onlyImportant].filter(Boolean).length),
                )}
              </Text>
            </View>
            <MaterialIcons name={optionsOpen ? "expand-less" : "expand-more"} size={24} color={theme.icon} />
          </TouchableOpacity>

          {optionsOpen &&
            [
              {
                id: "recorridos",
                icon: "route",
                title: t.mapa.opcion_recorridos,
                detail: t.mapa.opcion_recorridos_desc
                  .replace("{n}", String(routes.length))
                  .replace("{max}", String(MAX_ROUTES)),
                value: showRoutesOnMap,
                change: setShowRoutesOnMap,
                disabled: false,
              },
              {
                id: "importantes",
                icon: "star",
                title: t.mapa.opcion_importantes,
                detail: showRoutesOnMap
                  ? t.mapa.opcion_importantes_desc
                      .replace("{n}", String(routes.filter((r) => r.important).length))
                      .replace("{max}", String(MAX_IMPORTANTES))
                  : t.mapa.opcion_importantes_bloqueada,
                value: showRoutesOnMap && onlyImportant,
                change: setOnlyImportant,
                disabled: !showRoutesOnMap,
              },
              {
                id: "zonas",
                icon: "layers",
                title: t.mapa.opcion_zonas,
                detail: t.mapa.opcion_zonas_desc.replace("{n}", String(classifiedZones.length)),
                value: showMyZones,
                change: setShowMyZones,
                disabled: false,
              },
            ].map((o) => (
              <View key={o.id} style={[op.row, { borderTopColor: theme.icon + "22" }, o.disabled && { opacity: 0.45 }]}>
                <MaterialIcons name={o.icon as any} size={20} color={theme.icon} />
                <View style={{ flex: 1 }}>
                  <Text style={[op.rowTitle, { color: theme.text }]}>{o.title}</Text>
                  <Text style={[op.detailRow, { color: theme.contactSubtext }]}>{o.detail}</Text>
                </View>
                <Switch
                  value={o.value}
                  onValueChange={o.change}
                  disabled={o.disabled}
                  trackColor={{ false: "#ccc", true: theme.tabActiveColor }}
                  thumbColor="#fff"
                />
              </View>
            ))}
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonsRow}>
          {actions.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionButton} onPress={a.action}>
              <View style={styles.buttonCircle}>
                <MaterialIcons name={a.icon} size={22} color="#7B1DB2" />
              </View>
              <Text style={[styles.buttonLabel, { color: theme.text }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LOCATION CARD: neighborhood and address; radius and coordinates in small print */}
        <View style={[styles.coordinatesCard, { backgroundColor: theme.card }]}>
          <View style={op.placeRow}>
            <View style={[op.placeIcon, { backgroundColor: theme.icon }]}>
              <MaterialIcons name="place" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[op.label, { color: theme.contactSubtext }]}>{t.mapa.barrio}</Text>
              <Text style={[op.neighborhood, { color: theme.text }]} numberOfLines={1}>
                {addressInfoText ? addressInfoText.neighborhood || addressInfoText.city || t.mapa.barrio_desconocido : t.mapa.obteniendo}
              </Text>
              <Text style={[op.label, { color: theme.contactSubtext, marginTop: 8 }]}>{t.mapa.direccion}</Text>
              <Text style={[op.address, { color: theme.text }]} numberOfLines={2}>
                {addressInfoText ? addressInfoText.address || t.mapa.direccion_desconocida : t.mapa.obteniendo}
              </Text>
            </View>
          </View>

          <View style={[op.technicalRow, { backgroundColor: theme.icon + "12" }]}>
            <View style={op.technicalDetail}>
              <MaterialIcons name="radar" size={14} color={theme.icon} />
              <Text style={[op.technicalText, { color: theme.text }]}>
                {t.mapa.radio} {precisionMetros != null ? `± ${Math.round(precisionMetros)} m` : "--"}
              </Text>
            </View>
            <View style={op.technicalDetail}>
              <MaterialIcons name="my-location" size={14} color={theme.icon} />
              <Text style={[op.technicalText, { color: theme.text }]} numberOfLines={1}>
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </Text>
            </View>
          </View>

          <View style={styles.activeRow}>
            <Text style={[styles.updateText, { color: theme.contactSubtext }]}>
              {t.mapa.ultima_actualizacion}{" "}
              {lastUpdate ? `${t.inicio.hoy}, ${formatHour(lastUpdate)}` : "--"}
            </Text>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>{t.mapa.activo}</Text>
            </View>
          </View>
        </View>

        {/* ADDITIONAL ACTIONS TITLE */}
        <Text style={[styles.historyTitle, { color: theme.text }]}>
          {t.mapa.acciones_adicionales}
        </Text>

        {/* SAVED LOCATIONS */}
        <TouchableOpacity
          style={[styles.historyItem, { backgroundColor: theme.card }]}
          onPress={goToSavedLocations}
          activeOpacity={0.85}
        >
          <View style={[styles.bubbleNumber, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="bookmark" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dateItem, { color: theme.text }]}>{t.mapa.ubicaciones_guardadas}</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              {t.mapa.ubicaciones_guardadas_desc}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
        </TouchableOpacity>

        {/* HELP ZONES */}
        <TouchableOpacity
          style={[styles.historyItem, { backgroundColor: theme.card }]}
          onPress={goToHelpZones}
          activeOpacity={0.85}
        >
          <View style={[styles.bubbleNumber, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="shield" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dateItem, { color: theme.text }]}>{t.mapa.zonas_auxiliares}</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              {t.mapa.zonas_auxiliares_desc}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext}/>
        </TouchableOpacity>

           {/* SAVE ROUTE */}
        <TouchableOpacity
          style={[styles.historyItem, { backgroundColor: theme.card }]}
          onPress={goToSaveRoute}
          activeOpacity={0.85}
        >
          <View style={[styles.bubbleNumber, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="add-location-alt" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dateItem, { color: theme.text }]}>Guardar Recorrido</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              Crea rutas de punto A a punto B
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
        </TouchableOpacity>

        {/* ROUTE HISTORY */}
        <TouchableOpacity
          style={[styles.historyItem, { backgroundColor: theme.card }]}
          onPress={goToRouteHistory}
          activeOpacity={0.85}
        >
          <View style={[styles.bubbleNumber, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="history" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dateItem, { color: theme.text }]}>{t.mapa.historial_recorridos}</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              {t.mapa.historial_recorridos_desc}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
        </TouchableOpacity>

       
      </ScrollView>

      {/* FULL-SCREEN MODAL (same design as "Emergency alert") */}
      <Modal
        visible={fullscreen}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setFullscreen(false)}
      >
        <View style={ms.modalContainer}>
          {mapReady ? (
            <MapView
              ref={mapRef}
              style={ms.modalMap}
              toolbarEnabled={false}
              initialRegion={{
                latitude: mapCenter.latitude,
                longitude: mapCenter.longitude,
                latitudeDelta: searchResult ? 0.006 : 0.01,
                longitudeDelta: searchResult ? 0.006 : 0.01,
              }}
            >
              {/* Classified zones: circle with the color of their safety level */}
              {renderOfficialZones()}
            {renderClassifiedZones()}

              <HistoryPins
                points={history ?? []}
                current={location}
                lineColor={theme.icon}
                styles={ms}
                trackChanges={trackChanges}
                label={t.mapa.historial}
                currentTitle={t.mapa.tu_ubicacion_marcador}
              />

              {searchResult && (
                <Marker
                  coordinate={searchResult.coord}
                  title={searchResult.text}
                  pinColor="#E91E63"
                />
              )}

              {alertDestination && (
                <Marker
                  coordinate={alertDestination.coordinate}
                  anchor={{ x: 0.5, y: 0.5 }}
                  tracksViewChanges={trackChanges}
                  zIndex={998}
                  title={t.mapa.direccion_alerta_marcador}
                  description={alertDestination.address}
                >
                  <View style={ms.currentPin}>
                    <MaterialIcons name="place" size={20} color="#FFFFFF" />
                  </View>
                </Marker>
              )}

              {/* Saved routes (same logic: screen switches and tap to see information) */}
              {visibleRoutes.map((route: any, index: number) => {
                const routeColor = ROUTE_COLORS[index % ROUTE_COLORS.length];
                const points = route.points.map((point: any) => ({
                  latitude: point.latitude,
                  longitude: point.longitude,
                }));

                return (
                  <React.Fragment key={route.id}>
                    {points.length > 1 && (
                      <Polyline
                        coordinates={points}
                        strokeWidth={4}
                        strokeColor={routeColor}
                        lineDashPattern={[6, 4]}
                        lineCap="round"
                        lineJoin="round"
                        tappable
                        onPress={() => openRouteInfo(route)}
                      />
                    )}

                    {/* Start marker */}
                    <Marker
                      coordinate={points[0]}
                      anchor={{ x: 0.5, y: 0.5 }}
                      tracksViewChanges={trackChanges}
                      title={
                        route.customName ||
                        `${route.startNeighborhood} → ${route.endNeighborhood}`
                      }
                      description="Inicio del recorrido"
                      onPress={() => openRouteInfo(route)}
                    >
                      <View style={[ms.routePin, { backgroundColor: routeColor }]}>
                        <MaterialIcons name="trip-origin" size={14} color="#FFFFFF" />
                      </View>
                    </Marker>

                    {/* End marker */}
                    <Marker
                      coordinate={points[points.length - 1]}
                      anchor={{ x: 0.5, y: 0.5 }}
                      tracksViewChanges={trackChanges}
                      title="Fin"
                    >
                      <View style={[ms.routePin, { backgroundColor: POINT_B_COLOR }]}>
                        <MaterialIcons name="flag" size={14} color="#FFFFFF" />
                      </View>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapView>
          ) : (
            <View style={ms.modalLoading}>
              <ActivityIndicator size="large" color={theme.icon} />
            </View>
          )}

          {/* Top bar: close + location status */}
          <View style={ms.modalTopBar} pointerEvents="box-none">
            <TouchableOpacity
              style={ms.modalCloseBtn}
              onPress={() => setFullscreen(false)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t.mapa.cerrar_mapa}
            >
              <MaterialIcons name="close" size={20} color={theme.icon} />
              <Text style={ms.modalCloseText}>{t.mapa.cerrar_mapa}</Text>
            </TouchableOpacity>

            <View style={ms.modalTitlePill} pointerEvents="none">
              <Text style={ms.modalTitle} numberOfLines={1}>
                {t.mapa.tu_ubicacion_marcador}
              </Text>
              <Text style={ms.modalSub} numberOfLines={1}>
                {t.mapa.ultima_actualizacion}{" "}
                {lastUpdate ? formatHour(lastUpdate) : "--"}
              </Text>
            </View>
          </View>

          {/* Address search inside the big map */}
          <AddressSearchBar
            style={{
              position: "absolute",
              top: insets.top + 66,
              left: insets.left + 12,
              right: insets.right + 12,
            }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onResult={(coord, text) => setSearchResult({ coord, text })}
            onClear={clearSearch}
            city={addressInfoText?.city}
          />

          {/* Safety level legend */}
          {showMyZones && classifiedZones.length > 0 && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: insets.top + 126,
                left: insets.left + 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 12,
                height: 30,
                borderRadius: 15,
                backgroundColor: theme.containerBackground,
              }}
            >
              {(
                [
                  ["muy_segura", "Segura"],
                  ["moderada", "Moderada"],
                  ["muy_insegura", "Insegura"],
                ] as const
              ).map(([level, label]) => (
                <View key={level} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: LEVEL_COLOR[level],
                    }}
                  />
                  <Text style={{ fontSize: 10.5, fontWeight: "700", color: theme.text }}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Coordinates and current address */}
          <View style={ms.modalInfo} pointerEvents="none">
            <Text style={ms.modalInfoText} numberOfLines={1}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
            {!!currentAddress && (
              <Text style={ms.neighborhoodInfoModal} numberOfLines={2}>
                {currentAddress}
              </Text>
            )}
          </View>

          {/* Go to my location / fit all the points */}
          <TouchableOpacity
            style={ms.modalLocBtn}
            onPress={centerOnMe}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <MaterialIcons name="my-location" size={22} color={theme.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={ms.modalFitBtn}
            onPress={seeAll}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <MaterialIcons name="zoom-out-map" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ROUTE INFORMATION MODAL */}
      <Modal visible={routeInfoVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setRouteInfoVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Información del Recorrido
                  </Text>
                  <TouchableOpacity onPress={() => setRouteInfoVisible(false)}>
                    <MaterialIcons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                
                {routeInfo && (
                  <View style={styles.modalBody}>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="route" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Nombre:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {routeInfo.customName || `${routeInfo.startNeighborhood} → ${routeInfo.endNeighborhood}`}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="place" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Inicio:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {routeInfo.startNeighborhood}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="flag" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Fin:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {routeInfo.endNeighborhood}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="calendar-today" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Fecha:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {formatRouteDate(routeInfo.date, true)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="schedule" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Tiempo estimado:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {routeInfo.estimatedTime}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="straighten" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Distancia:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {routeInfo.estimatedDistance}
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setRouteInfoVisible(false)}
                >
                  <Text style={styles.modalCloseText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
// Map options panel and location card
const op = StyleSheet.create({
  panel: { flexDirection: "column", alignItems: "stretch" },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconItem: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  rowTitle: { fontSize: 14, fontWeight: "600" },
  detailRow: { fontSize: 12, marginTop: 2 },
  placeRow: { flexDirection: "row", gap: 12 },
  placeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  neighborhood: { fontSize: 18, fontWeight: "800", marginTop: 2 },
  address: { fontSize: 14, fontWeight: "500", marginTop: 2 },
  technicalRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginTop: 12 },
  technicalDetail: { flexDirection: "row", alignItems: "center", gap: 4 },
  technicalText: { fontSize: 11, fontWeight: "600" },
});
