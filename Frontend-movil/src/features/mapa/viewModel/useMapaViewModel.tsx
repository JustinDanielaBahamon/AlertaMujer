import { useEffect, useRef, useState } from "react";
import { Animated, Linking } from "react-native";
import * as Location from "expo-location";
import { permisoUbicacion } from "../../../services/permisosSeguros";
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

// Última ubicación conocida. Vive fuera del hook para que, al volver a abrir el mapa
// (por ejemplo desde un acceso rápido), se pinte al instante sin esperar al GPS.
let ubicacionCache: Coordenada | null = null;

export const useMapaViewModel = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const params = (route.params ?? {}) as MapaRouteParams;

  const [location, setLocation] = useState<Coordenada | null>(ubicacionCache);
  const [fullscreen, setFullscreen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [historial, setHistorial] = useState<Coordenada[]>([]);
  const [intentosPermiso, setIntentosPermiso] = useState(0);
  const [permisoDenegado, setPermisoDenegado] = useState(false);
  const [serviciosDesactivados, setServiciosDesactivados] = useState(false);
  const [cargando, setCargando] = useState(!ubicacionCache);
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
    let historialInterval: ReturnType<typeof setInterval> | undefined;
    let cancelado = false;
    let tieneUbicacion = ubicacionCache !== null;

    // Guarda la posición en el estado y en el caché para la próxima vez que se abra el mapa
    const aplicarUbicacion = (coord: Coordenada) => {
      ubicacionCache = coord;
      tieneUbicacion = true;
      setLocation(coord);
      setUltimaActualizacion(new Date());
    };

    // Agrega un punto al historial solo si se movió al menos 10 m
    const agregarAlHistorial = (newLoc: Coordenada) => {
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
    };

    const iniciarUbicacion = async () => {
      try {
        // Solo mostramos la pantalla de carga si todavía no hay ninguna ubicación que pintar
        if (!tieneUbicacion) setCargando(true);
        setPermisoDenegado(false);

        // Servicios y permiso se consultan al mismo tiempo (antes eran uno tras otro)
        const [servicioHabilitado, permisoActual] = await Promise.all([
          Location.hasServicesEnabledAsync(),
          Location.getForegroundPermissionsAsync(),
        ]);
        if (cancelado) return;

        if (!servicioHabilitado) {
          setCargando(false);
          setServiciosDesactivados(true);
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

        // Solo se pide el permiso si todavía no está concedido
        let status = permisoActual.status;
        if (status !== "granted") {
          status = (await permisoUbicacion()) ? Location.PermissionStatus.GRANTED : Location.PermissionStatus.DENIED;
        }
        if (cancelado) return;

        if (status !== "granted") {
          setCargando(false);
          setPermisoDenegado(true);

          if (intentosPermiso === 0) {
            alert(
              "⚠️ PERMISO DE UBICACIÓN REQUERIDO\n\n" +
              "AlertaMujer necesita acceso a tu ubicación para mostrarte el mapa y garantizar tu seguridad.\n\n" +
              "Por favor concede el permiso de ubicación para continuar."
            );
            return;
          }
          if (intentosPermiso === 1) {
            alert(
              "⚠️ PERMISO DE UBICACIÓN NECESARIO\n\n" +
              "Sin acceso a tu ubicación, no podemos mostrarte el mapa ni garantizar tu seguridad.\n\n" +
              "Por favor habilita el permiso de ubicación en Configuración."
            );
            return;
          }
          if (intentosPermiso >= 2) {
            alert(
              "⚠️ CONFIGURACIÓN DE UBICACIÓN\n\n" +
              "Para usar el mapa, debes habilitar el permiso de ubicación desde la configuración de la aplicación.\n\n" +
              "Serás redirigido a Configuración."
            );
            Linking.openSettings();
            return;
          }
        }

        // 1) Pintar el mapa YA con la última posición conocida (es casi instantáneo).
        //    Después se afina con el GPS en segundo plano.
        if (!tieneUbicacion) {
          try {
            const ultima = await Location.getLastKnownPositionAsync({
              maxAge: 10 * 60 * 1000,
            });
            if (ultima && !cancelado) {
              aplicarUbicacion({
                latitude: ultima.coords.latitude,
                longitude: ultima.coords.longitude,
              });
              setCargando(false);
            }
          } catch {
            // Si no hay posición previa seguimos con el GPS normal
          }
        }

        // 2) Posición actual precisa
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelado) return;

        const firstLoc: Coordenada = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        aplicarUbicacion(firstLoc);
        setHistorial([firstLoc]);
        setCargando(false);

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

            aplicarUbicacion(newLoc);
            agregarAlHistorial(newLoc);
          }
        );

        // Si la pantalla se cerró mientras se creaba la suscripción, se libera de inmediato
        if (cancelado) {
          subscription.remove();
          subscription = null;
          return;
        }

        historialInterval = setInterval(async () => {
          try {
            const current = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });

            const newLoc: Coordenada = {
              latitude: current.coords.latitude,
              longitude: current.coords.longitude,
            };

            aplicarUbicacion(newLoc);
            agregarAlHistorial(newLoc);
          } catch (error) {
            console.error("Error en refresh automático:", error);
          }
        }, 60000);
      } catch (error) {
        console.error("Error al obtener ubicación:", error);
        if (cancelado) return;
        setCargando(false);
        // Si ya hay una ubicación en pantalla no se muestra como "permiso denegado"
        if (!tieneUbicacion) setPermisoDenegado(true);
      }
    };

    iniciarUbicacion();

    return () => {
      cancelado = true;
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

      ubicacionCache = newLoc;
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
        navigation.navigate("ClasificarZona", {
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

  const irAZonasAuxiliares = () => {
    navigation.navigate("ZonasAuxiliares");
  };

  const irAHistorialRecorridos = () => {
    navigation.navigate("HistorialRecorridos");
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
    refrescarUbicacion,
    reintentarPermisos: () => {
      setIntentosPermiso((prev) => prev + 1);
      setPermisoDenegado(false);
      setServiciosDesactivados(false);
    },
    permisoDenegado,
    serviciosDesactivados,
    cargando,
    irAClasificarZona,
    irAUbicacionesGuardadas,
    irClasificarZona,
    irAZonasAuxiliares,
    irAHistorialRecorridos

  };
};