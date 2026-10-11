import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Vibration } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useNotificaciones } from "../../../contexts/NotificacionesContext";
import type { MainStackParamList } from "../../../navigation/types";
import {
  LocationPermissionDeniedError,
  LocationService,
  LocationServicesDisabledError,
  type UbicacionDetallada,
} from "../../../services/location.service";

type Nav = NativeStackNavigationProp<MainStackParamList>;

// Estado de la ubicacion, independiente del idioma (el texto se traduce aparte)
type EstadoUbicacion = "cargando" | "lista" | "denegado" | "gps_apagado" | "error";

export function useInicioViewModel() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();
  const { t } = useLocale();
  const { config } = useNotificaciones();

  const [pressed, setPressed] = useState(false);
  const [estadoUbicacion, setEstadoUbicacion] =
    useState<EstadoUbicacion>("cargando");
  const [ubicacionResuelta, setUbicacionResuelta] = useState("");
  const [ubicacionDetallada, setUbicacionDetallada] =
    useState<UbicacionDetallada | null>(null);
  const [cargando, setCargando] = useState(false);

  const obtenerUbicacion = useCallback(async () => {
    try {
      setCargando(true);
      setEstadoUbicacion("cargando");

      // Usar el servicio centralizado de ubicación con alta precisión
      const ubicacion = await LocationService.getFullLocation();

      if (ubicacion) {
        setUbicacionDetallada(ubicacion);

        const nombreCompleto = LocationService.formatAddress(ubicacion);
        setUbicacionResuelta(nombreCompleto);
        setEstadoUbicacion("lista");

        console.log("Ubicación mejorada obtenida:", {
          direccion: ubicacion.direccionCompleta,
          barrio: ubicacion.barrio,
          ciudad: ubicacion.ciudad,
          precision: ubicacion.precision,
        });
      } else {
        setEstadoUbicacion("error");
      }
    } catch (error) {
      if (error instanceof LocationServicesDisabledError) {
        // GPS / servicios de ubicación del dispositivo apagados
        console.warn("GPS del dispositivo desactivado:", error.message);
        setEstadoUbicacion("gps_apagado");
      } else if (error instanceof LocationPermissionDeniedError) {
        // El usuario negó el permiso a la app
        console.warn("Permiso de ubicación denegado:", error.message);
        setEstadoUbicacion("denegado");
      } else {
        console.error("Error al obtener ubicación mejorada:", error);
        setEstadoUbicacion("error");
      }
    } finally {
      setCargando(false);
    }
  }, [t]);

  useEffect(() => {
    void obtenerUbicacion();
  }, [obtenerUbicacion]);

  // Texto de ubicacion ya traducido segun el idioma activo
  const ubicacionNombre = useMemo(() => {
    switch (estadoUbicacion) {
      case "cargando":
        return t.mapa.cargando;
      case "denegado":
        return t.inicio.permiso_denegado;
      case "gps_apagado":
        return "Activa el GPS del dispositivo";
      case "error":
        return t.inicio.error_actualizar;
      default:
        return ubicacionResuelta;
    }
  }, [estadoUbicacion, ubicacionResuelta, t]);

  // true solo cuando ya se resolvio una ubicacion real (para mostrar "GPS activo")
  const ubicacionLista = estadoUbicacion === "lista";

  const activarAlerta = useCallback(() => {
    if (config.vibracion) Vibration.vibrate(200);
    const stackNav = navigation.getParent()?.getParent();
    if (stackNav && "navigate" in stackNav) {
      (
        stackNav as { navigate: (name: keyof MainStackParamList) => void }
      ).navigate("Activacion");
      return;
    }
    navigation.navigate("Activacion");
  }, [navigation, config.vibracion]);

  // Vibra mientras el botón está presionado y se detiene al soltarlo
  const onPressInBoton = useCallback(() => {
    setPressed(true);
    if (config.vibracion) Vibration.vibrate([0, 400, 200], true);
  }, [config.vibracion]);
  const onPressOutBoton = useCallback(() => {
    setPressed(false);
    Vibration.cancel();
  }, []);

  // Si se sale de la pantalla con el botón presionado, no deja el teléfono vibrando
  useEffect(() => () => Vibration.cancel(), []);

  const cerrarSesion = useCallback(() => {
    signOut();
  }, [signOut]);

  return {
    pressed,
    ubicacionNombre,
    ubicacionLista,
    ubicacionDetallada,
    cargando,
    obtenerUbicacion,
    activarAlerta,
    onPressInBoton,
    onPressOutBoton,
    cerrarSesion,
  };
}