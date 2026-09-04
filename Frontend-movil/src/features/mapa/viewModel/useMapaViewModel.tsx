import { useEffect, useRef, useState } from "react";
import { Animated, Linking } from "react-native";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import type { MainStackParamList } from "../../../navigation/types";

export type Coordenada = {
  latitude: number;
  longitude: number;
};

export type MapaRouteParams = {
  direccionObjetivo?: string;
};

export const useMapaViewModel = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const params = (route.params ?? {}) as MapaRouteParams;

  const [location, setLocation] = useState<Coordenada | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [historial, setHistorial] = useState<Coordenada[]>([]);
  const [intentosPermiso, setIntentosPermiso] = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(
    null
  );
  const [destinoAlerta, setDestinoAlerta] = useState<{
    direccion: string;
    coordenada: Coordenada;
  } | null>(null);

  const closeOpacity = useRef(new Animated.Value(0)).current;

  // ─── GEOLOCALIZAR DIRECCIÓN RECIBIDA POR PARÁMETRO ───────────────────────
  useEffect(() => {
    const direccion = params.direccionObjetivo?.trim();

    if (!direccion) {
      setDestinoAlerta(null);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const resultados = await Location.geocodeAsync(
          `${direccion}, Colombia`
        );

        if (!mounted) return;

        if (resultados.length > 0) {
          const { latitude, longitude } = resultados[0];
          setDestinoAlerta({
            direccion,
            coordenada: { latitude, longitude },
          });
        } else {
          setDestinoAlerta(null);
        }
      } catch {
        if (mounted) setDestinoAlerta(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params.direccionObjetivo]);

  // ─── FÓRMULA HAVERSINE ───────────────────────────────────────────────────
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
    let historialInterval: ReturnType<typeof setInterval>;

    const iniciarUbicacion = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (intentosPermiso === 0) {
          alert(t.mapa.permiso_denegado);
          return;
        }
        if (intentosPermiso === 1) {
          alert(t.mapa.permiso_denegado2);
          return;
        }
        if (intentosPermiso >= 2) {
          alert(t.mapa.permiso_configuracion);
          Linking.openSettings();
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const firstLoc: Coordenada = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(firstLoc);
      setUltimaActualizacion(new Date());
      setHistorial([firstLoc]);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 15000,
          distanceInterval: 30,
        },
        (loc) => {
          const newLoc: Coordenada = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };

          setLocation(newLoc);
          setUltimaActualizacion(new Date());

          setHistorial((prev) => {
            const ultimo = prev[prev.length - 1];
            if (!ultimo) return [newLoc];

            const distancia = getDistanceFromLatLonInMeters(
              ultimo.latitude,
              ultimo.longitude,
              newLoc.latitude,
              newLoc.longitude
            );

            if (distancia >= 10) {
              return [...prev, newLoc].slice(-20);
            }

            return prev;
          });
        }
      );

      historialInterval = setInterval(async () => {
        try {
          const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const newLoc: Coordenada = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          };

          setLocation(newLoc);
          setUltimaActualizacion(new Date());

          setHistorial((prev) => {
            const ultimo = prev[prev.length - 1];
            if (!ultimo) return [newLoc];

            const distancia = getDistanceFromLatLonInMeters(
              ultimo.latitude,
              ultimo.longitude,
              newLoc.latitude,
              newLoc.longitude
            );

            if (distancia >= 10) {
              return [...prev, newLoc].slice(-20);
            }

            return prev;
          });
        } catch (error) {
          console.error("Error en refresh automático:", error);
        }
      }, 60000);
    };

    iniciarUbicacion();

    return () => {
      if (subscription) subscription.remove();
      if (historialInterval) clearInterval(historialInterval);
    };
  }, [intentosPermiso]);

  // ─── REFRESH MANUAL ───────────────────────────────────────────────────────
  const refrescarUbicacion = async () => {
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLoc: Coordenada = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setLocation(newLoc);
      setUltimaActualizacion(new Date());

      setHistorial((prev) => {
        const nuevoHistorial = [...prev, newLoc];
        return nuevoHistorial.slice(-20);
      });
    } catch (error) {
      console.error("Error al refrescar ubicación:", error);
      alert("No se pudo obtener la ubicación actual");
    }
  };

  // ─── MANEJO DE PANTALLA COMPLETA ──────────────────────────────────────────
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

  // ─── FORMATEO DE HORA ─────────────────────────────────────────────────────
  const formatearHora = (fecha: Date) =>
    fecha.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ─── ACCIONES DE BOTONES ─────────────────────────────────────────────────
  const acciones = [
    {
      icono: "share",
      label: t.mapa.compartir,
      accion: () => console.log("Compartir ubicación"),
    },
    {
      icono: "refresh",
      label: t.mapa.actualizar,
      accion: refrescarUbicacion,
    },
    {
      icono: "navigation",
      label: t.mapa.navegar,
      accion: () => {
        if (location) {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
          Linking.openURL(url);
        }
      },
    },
    {
      icono: "bookmark",
      label: t.mapa.guardar,
      accion: async () => {
        if (!location) return;
        navigation.navigate("guardarUbi", {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      },
    },
  ] as const;

  // ─── NAVEGACIÓN A ACCIONES ADICIONALES ────────────────────────────────────
  const irAClasificarZona = () => {
    if (!location) return;
    navigation.navigate("ClasificarZona", {
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  const irAUbicacionesGuardadas = () => {
    navigation.navigate("UbicacionesGuardadas");
  };

  // ─── PROCESAMIENTO FINAL Y RETORNO ────────────────────────────────────────
  const rawCoordenada = destinoAlerta?.coordenada ?? location;
  const coordenadaCentro: Coordenada = rawCoordenada ?? {
    latitude: 0,
    longitude: 0,
  };

  const irClasificarZona =() =>{
     navigation.navigate("ClasificarZona")
  };

  

  return {
    theme,
    t,
    location,
    fullscreen,
    setFullscreen,
    showClose,
    historial,
    destinoAlerta,
    coordenadaCentro,
    closeOpacity,
    ultimaActualizacion,
    acciones,
    handleMapPress,
    formatearHora,
    reintentarPermisos: () => setIntentosPermiso((prev) => prev + 1),
    irAClasificarZona,
    irAUbicacionesGuardadas,
    irClasificarZona

  };
};