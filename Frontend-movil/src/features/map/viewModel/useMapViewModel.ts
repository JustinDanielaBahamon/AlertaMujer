import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Linking, Share } from "react-native";
import * as Location from "expo-location";
import { locationPermission } from "../../../services/safePermissions";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import type { MainStackParamList } from "../../../navigation/types";
import type MapView from "../../../components/map/MapLibreMap";
import { useAuth } from "../../../contexts/AuthContext";
import { useRoutes, type SavedRoute } from "../../../contexts/RoutesContext";
import { frequentLocationsService } from "../../../services/frequent-locations.service";
import { getZones } from "../../../services/zones.service";
import { getPlace } from "../../../services/geocoding.service";

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type MapRouteParams = {
  targetAddress?: string;
};

/** Zone the user classified ("Classify zone" screen), drawn as a circle on the map. */
export type ClassifiedZone = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  riskLevel: "muy_segura" | "moderada" | "muy_insegura";
};

/** System emergency zone (police, assistance, safe, risk): always visible. */
export type OfficialZone = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  radio: number;
};

export type AddressInfoBlock = {
  zone: string; // neighborhood, or the city if there is no neighborhood (used in the header)
  neighborhood: string;
  city: string;
  address: string;
};

export const ZONE_RADIUS_METERS = 150;

const distanceMeters = (a: Coordinate, b: Coordinate) => {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

// Looks up the address of some coordinates (neighborhood, city and street)
const getAddressInfo = async (coord: Coordinate): Promise<AddressInfoBlock> => {
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

// Last known location. It lives outside the hook so that, when the map opens again
// (for example from a shortcut), it is painted instantly without waiting for the GPS.
let locationCache: Coordinate | null = null;

export const useMapViewModel = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const params = (route.params ?? {}) as MapRouteParams;

  const [location, setLocation] = useState<Coordinate | null>(locationCache);
  const [fullscreen, setFullscreen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [history, setHistory] = useState<Coordinate[]>([]);
  const [permissionAttempts, setPermissionAttempts] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [disabledServices, setDisabledServices] = useState(false);
  const [loading, setLoading] = useState(!locationCache);
  // GPS accuracy radius in meters (the phone estimates how exact the position is)
  const [precisionMetros, setPrecisionMetros] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(
    null
  );
  const [alertDestination, setAlertDestination] = useState<{
    address: string;
    coordinate: Coordinate;
  } | null>(null);

  const closeOpacity = useRef(new Animated.Value(0)).current;

  // ─── GEOLOCATE THE ADDRESS RECEIVED AS A PARAM ───────────────────────────
  useEffect(() => {
    const address = params.targetAddress?.trim();

    if (!address) {
      setAlertDestination(null);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const results = await Location.geocodeAsync(
          `${address}, Colombia`
        );

        if (!mounted) return;

        if (results.length > 0) {
          const { latitude, longitude } = results[0];
          setAlertDestination({
            address,
            coordinate: { latitude, longitude },
          });
        } else {
          setAlertDestination(null);
        }
      } catch {
        if (mounted) setAlertDestination(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params.targetAddress]);

  // ─── HAVERSINE FORMULA ───────────────────────────────────────────────────
  const getDistanceFromLatLonInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ─── GPS PRINCIPAL ────────────────────────────────────────────────────────
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let historyInterval: ReturnType<typeof setInterval> | undefined;
    let canceled = false;
    let hasLocation = locationCache !== null;

    // Store the position in state and in the cache for the next time the map opens
    const applyLocation = (coord: Coordinate, precision?: number | null) => {
      locationCache = coord;
      setPrecisionMetros(precision ?? null);
      hasLocation = true;
      setLocation(coord);
      setLastUpdate(new Date());
    };

    // Add a point to the history only if it moved at least 10 m
    const addToHistory = (newLoc: Coordinate) => {
      setHistory((prev) => {
        const lastItem = prev[prev.length - 1];
        if (!lastItem) return [newLoc];

        const distance = getDistanceFromLatLonInMeters(
          lastItem.latitude,
          lastItem.longitude,
          newLoc.latitude,
          newLoc.longitude
        );

        if (distance >= 10) {
          return [...prev, newLoc].slice(-20);
        }

        return prev;
      });
    };

    const startLocation = async () => {
      try {
        // Only show the loading screen if there is still no location to paint
        if (!hasLocation) setLoading(true);
        setPermissionDenied(false);

        // Services and permission are checked at the same time (before, one after the other)
        const [serviceEnabled, currentPermission] = await Promise.all([
          Location.hasServicesEnabledAsync(),
          Location.getForegroundPermissionsAsync(),
        ]);
        if (canceled) return;

        if (!serviceEnabled) {
          setLoading(false);
          setDisabledServices(true);
          alert(
            "⚠️ UBICACIÓN DESACTIVADA\n\n" +
            "Para usar el mapa, necesitas activar los servicios de ubicación de tu dispositivo.\n\n" +
            "Por favor:\n" +
            "1. Ve a Configuración de tu dispositivo\n" +
            "2. Busca 'Ubicación' o 'Location'\n" +
            "3. Activa los servicios de ubicación\n\n" +
            "Luego regresa e intenta nuevamente."
          );
          return;
        }

        // Only ask for the permission if it is not granted yet
        let status = currentPermission.status;
        if (status !== "granted") {
          status = (await locationPermission()) ? Location.PermissionStatus.GRANTED : Location.PermissionStatus.DENIED;
        }
        if (canceled) return;

        if (status !== "granted") {
          setLoading(false);
          setPermissionDenied(true);

          if (permissionAttempts === 0) {
            alert(
              "⚠️ PERMISO DE UBICACIÓN REQUERIDO\n\n" +
              "AlertaMujer necesita acceso a tu ubicación para mostrarte el mapa y garantizar tu seguridad.\n\n" +
              "Por favor concede el permiso de ubicación para continuar."
            );
            return;
          }
          if (permissionAttempts === 1) {
            alert(
              "⚠️ PERMISO DE UBICACIÓN NECESARIO\n\n" +
              "Sin acceso a tu ubicación, no podemos mostrarte el mapa ni garantizar tu seguridad.\n\n" +
              "Por favor habilita el permiso de ubicación en Configuración."
            );
            return;
          }
          if (permissionAttempts >= 2) {
            alert(
              "⚠️ CONFIGURACIÓN DE UBICACIÓN\n\n" +
              "Para usar el mapa, debes habilitar el permiso de ubicación desde la configuración de la aplicación.\n\n" +
              "Serás redirigido a Configuración."
            );
            Linking.openSettings();
            return;
          }
        }

        // 1) Paint the map NOW with the last known position (almost instant).
        // Then refine it with the GPS in the background.
        if (!hasLocation) {
          try {
            const latest = await Location.getLastKnownPositionAsync({
              maxAge: 10 * 60 * 1000,
            });
            if (latest && !canceled) {
              applyLocation(
                { latitude: latest.coords.latitude, longitude: latest.coords.longitude },
                latest.coords.accuracy,
              );
              setLoading(false);
            }
          } catch {
            // If there is no previous position, continue with the normal GPS
          }
        }

        // 2) Precise current position
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (canceled) return;

        const firstLoc: Coordinate = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        applyLocation(firstLoc, currentLocation.coords.accuracy);
        setHistory([firstLoc]);
        setLoading(false);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 15000,
            distanceInterval: 30,
          },
          (loc) => {
            const newLoc: Coordinate = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };

            applyLocation(newLoc, loc.coords.accuracy);
            addToHistory(newLoc);
          }
        );

        // If the screen closed while the subscription was being created, release it right away
        if (canceled) {
          subscription.remove();
          subscription = null;
          return;
        }

        historyInterval = setInterval(async () => {
          try {
            const current = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });

            const newLoc: Coordinate = {
              latitude: current.coords.latitude,
              longitude: current.coords.longitude,
            };

            applyLocation(newLoc, current.coords.accuracy);
            addToHistory(newLoc);
          } catch (error) {
            console.error("Error en refresh automático:", error);
          }
        }, 60000);
      } catch (error) {
        console.error("Error al obtener ubicación:", error);
        if (canceled) return;
        setLoading(false);
        // If there is already a location on screen it is not shown as "permission denied"
        if (!hasLocation) setPermissionDenied(true);
      }
    };

    startLocation();

    return () => {
      canceled = true;
      if (subscription) subscription.remove();
      if (historyInterval) clearInterval(historyInterval);
    };
  }, [permissionAttempts]);

  // ─── REFRESH MANUAL ───────────────────────────────────────────────────────
  const refreshLocation = async () => {
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLoc: Coordinate = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      locationCache = newLoc;
      setLocation(newLoc);
      setPrecisionMetros(current.coords.accuracy ?? null);
      setLastUpdate(new Date());

      setHistory((prev) => {
        const newHistory = [...prev, newLoc];
        return newHistory.slice(-20);
      });
    } catch (error) {
      console.error("Error al refrescar ubicación:", error);
      alert("No se pudo obtener la ubicación actual");
    }
  };

  // ─── FULL SCREEN HANDLING ────────────────────────────────────────────────
  const handleMapPress = () => {
    if (showClose) return;

    setShowClose(true);

    Animated.timing(closeOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(closeOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowClose(false));
    }, 15000);
  };

  // ─── TIME FORMATTING ─────────────────────────────────────────────────────
  const formatHour = (date: Date) =>
    date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ─── SCREEN STATE ─────────────────────────────────────────────────────────
  const { routes } = useRoutes();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const mounted = useRef(true);
  const lastGeocoded = useRef<Coordinate | null>(null);

  const [showRoutesOnMap, setShowRoutesOnMap] = useState(true); // On by default
  const [onlyImportant, setOnlyImportant] = useState(false); // Show all by default
  const [addressInfo, setAddressInfo] = useState<AddressInfoBlock | null>(null);
  const [routeInfo, setRouteInfo] = useState<SavedRoute | null>(null);
  const [routeInfoVisible, setRouteInfoVisible] = useState(false);
  const [mapReady, setMapReady] = useState(false); // the big map is drawn when the modal animation ends
  const [trackChanges, setTrackChanges] = useState(true); // custom pins are redrawn only for a few moments
  const [classifiedZones, setClassifiedZones] = useState<ClassifiedZone[]>([]);
  const [officialZones, setOfficialZones] = useState<OfficialZone[]>([]);
  const [showMyZones, setShowMyZones] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ coord: Coordinate; text: string } | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const currentAddress = addressInfo
    ? addressInfo.zone
      ? `${addressInfo.zone}, ${addressInfo.address}`.replace(/, $/, "")
      : addressInfo.address
    : "";

  // Saved routes drawn on the big map
  const visibleRoutes = useMemo(
    () =>
      !showRoutesOnMap
        ? []
        : routes.filter((r) => r?.points?.length > 0 && (!onlyImportant || r.important)),
    [routes, showRoutesOnMap, onlyImportant]
  );
  const importantRoutes = routes.filter((r) => r.important).length;

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
              .filter((u) => u.isActive !== false && u.latitude != null && u.longitude != null)
              .map((u) => ({
                id: String(u.id),
                name: u.name,
                latitude: Number(u.latitude),
                longitude: Number(u.longitude),
                riskLevel:
                  u.riskLevel === "muy_segura" || u.riskLevel === "muy_insegura" ? u.riskLevel : "moderada",
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

  // System emergency zones: loaded when entering the map (they do not depend on the user)
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
  }, [history.length, fullscreen, mapReady, visibleRoutes.length]);

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
        if (mounted.current) setAddressInfo(info);
      } catch (error) {
        console.error("Error al obtener dirección:", error);
      }
    })();
  }, [location]);

  // ─── SEARCH ───────────────────────────────────────────────────────────────
  // From the small map: the result opens the big map
  const showSearchResult = (coord: Coordinate, text: string) => {
    setSearchResult({ coord, text });
    setFullscreen(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResult(null);
  };

  // ─── SHARE ────────────────────────────────────────────────────────────────
  const shareLocation = async () => {
    if (!location) return;
    try {
      let info = addressInfo;
      if (!info) {
        try {
          info = await getAddressInfo(location);
        } catch {
          info = null;
        }
      }

      const now = new Date();
      const date = now.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
      const time = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
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

      await Share.share({ title: t.mapa.compartir_ubicacion, message: lines.join("\n") });
    } catch (error) {
      console.error("Error al compartir ubicación:", error);
      Alert.alert("Error", `${t.mapa.compartir_error}. Inténtalo nuevamente.`);
    }
  };

  // ─── BUTTON ACTIONS ──────────────────────────────────────────────────────
  const actions = [
    { icon: "share", label: t.mapa.compartir, action: shareLocation },
    { icon: "refresh", label: t.mapa.actualizar, action: refreshLocation },
    {
      icon: "navigation",
      label: t.mapa.navegar,
      action: () => {
        if (location) setFullscreen(true);
      },
    },
    {
      icon: "bookmark",
      label: t.mapa.guardar,
      action: () => {
        if (!location) return;
        navigation.navigate("ClassifyZone", { latitude: location.latitude, longitude: location.longitude });
      },
    },
  ] as const;

  // ─── BIG MAP CAMERA ───────────────────────────────────────────────────────
  // Every visible point: location, alert address, search, history and routes
  const visiblePoints = (): Coordinate[] => {
    const pts: Coordinate[] = location ? [location] : [];
    if (alertDestination) pts.push(alertDestination.coordinate);
    if (searchResult) pts.push(searchResult.coord);
    history.forEach((p) => pts.push(p));
    visibleRoutes.forEach((r) => r.points.forEach((p) => pts.push({ latitude: p.latitude, longitude: p.longitude })));
    return pts;
  };

  const centerOnMe = () => {
    if (!location) return;
    mapRef.current?.animateToRegion(
      { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 },
      400
    );
  };

  /** Fits every visible point; edgePadding leaves room for the screen's own buttons. */
  const seeAll = (edgePadding: { top: number; right: number; bottom: number; left: number }) => {
    const pts = visiblePoints();
    if (pts.length < 2) {
      centerOnMe();
      return;
    }
    mapRef.current?.fitToCoordinates(pts, { edgePadding, animated: true });
  };

  // ─── NAVIGATION ───────────────────────────────────────────────────────────
  const goToSavedLocations = () => navigation.navigate("SavedLocations");
  const goToHelpZones = () => navigation.navigate("HelpZones");
  const goToRouteHistory = () => navigation.navigate("RouteHistory");
  const goToSaveRoute = () => navigation.navigate("SaveRoute");

  // ─── CENTER ───────────────────────────────────────────────────────────────
  const centerCoordinate: Coordinate = alertDestination?.coordinate ?? location ?? { latitude: 0, longitude: 0 };
  const mapCenter: Coordinate = searchResult?.coord ?? centerCoordinate;

  return {
    theme,
    t,
    location,
    fullscreen,
    setFullscreen,
    showClose,
    history,
    alertDestination,
    centerCoordinate,
    mapCenter,
    closeOpacity,
    lastUpdate,
    precisionMetros,
    handleMapPress,
    formatHour,
    refreshLocation,
    retryPermissions: () => {
      setPermissionAttempts((prev) => prev + 1);
      setPermissionDenied(false);
      setDisabledServices(false);
    },
    permissionDenied,
    disabledServices,
    loading,
    // Screen
    mapRef,
    mapReady,
    trackChanges,
    actions,
    currentAddress,
    addressInfo,
    routes,
    importantRoutes,
    visibleRoutes,
    showRoutesOnMap,
    setShowRoutesOnMap,
    onlyImportant,
    setOnlyImportant,
    showMyZones,
    setShowMyZones,
    classifiedZones,
    officialZones,
    optionsOpen,
    toggleOptions: () => setOptionsOpen((v) => !v),
    searchQuery,
    setSearchQuery,
    searchResult,
    setSearchResult,
    showSearchResult,
    clearSearch,
    routeInfo,
    routeInfoVisible,
    openRouteInfo: (route: SavedRoute) => {
      setRouteInfo(route);
      setRouteInfoVisible(true);
    },
    closeRouteInfo: () => setRouteInfoVisible(false),
    seeAll,
    centerOnMe,
    goToSavedLocations,
    goToHelpZones,
    goToRouteHistory,
    goToSaveRoute,
  };
};
