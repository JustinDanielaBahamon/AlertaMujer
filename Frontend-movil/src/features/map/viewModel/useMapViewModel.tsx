import { useEffect, useRef, useState } from "react";
import { Animated, Linking } from "react-native";
import * as Location from "expo-location";
import { locationPermission } from "../../../services/safePermissions";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import type { MainStackParamList } from "../../../navigation/types";

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type MapRouteParams = {
  targetAddress?: string;
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

  // ─── BUTTON ACTIONS ──────────────────────────────────────────────────────
  const actions = [
    {
      icon: "share",
      label: t.mapa.compartir,
      action: () => console.log("Compartir ubicación"),
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
          const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
          Linking.openURL(url);
        }
      },
    },
    {
      icon: "bookmark",
      label: t.mapa.guardar,
      action: async () => {
        if (!location) return;
        navigation.navigate("ClassifyZone", {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      },
    },
  ] as const;

  // ─── NAVIGATION TO ADDITIONAL ACTIONS ────────────────────────────────────
  const goToClassifyZone = () => {
    if (!location) return;
    navigation.navigate("ClassifyZone", {
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  const goToSavedLocations = () => {
    navigation.navigate("SavedLocations");
  };

  const goToHelpZones = () => {
    navigation.navigate("HelpZones");
  };

  const goToRouteHistory = () => {
    navigation.navigate("RouteHistory");
  };

  // ─── PROCESAMIENTO FINAL Y RETORNO ────────────────────────────────────────
  const rawCoordinate = alertDestination?.coordinate ?? location;
  const centerCoordinate: Coordinate = rawCoordinate ?? {
    latitude: 0,
    longitude: 0,
  };

  const openClassifyZone =() =>{
     navigation.navigate("ClassifyZone")
  };

  

  return {
    theme,
    t,
    location,
    fullscreen,
    setFullscreen,
    showClose,
    history: history,
    alertDestination: alertDestination,
    centerCoordinate: centerCoordinate,
    closeOpacity,
    lastUpdate: lastUpdate,
    precisionMetros,
    actions: actions,
    handleMapPress,
    formatHour: formatHour,
    refreshLocation: refreshLocation,
    retryPermissions: () => {
      setPermissionAttempts((prev) => prev + 1);
      setPermissionDenied(false);
      setDisabledServices(false);
    },
    permissionDenied: permissionDenied,
    disabledServices: disabledServices,
    loading: loading,
    goToClassifyZone: goToClassifyZone,
    goToSavedLocations: goToSavedLocations,
    openClassifyZone: openClassifyZone,
    goToHelpZones: goToHelpZones,
    goToRouteHistory: goToRouteHistory

  };
};