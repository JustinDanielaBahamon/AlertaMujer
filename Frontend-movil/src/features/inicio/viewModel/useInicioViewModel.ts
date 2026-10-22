import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Vibration } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useNotifications } from "../../../contexts/NotificacionesContext";
import type { MainStackParamList } from "../../../navigation/types";
import {
  LocationPermissionDeniedError,
  LocationService,
  LocationServicesDisabledError,
  type DetailedLocation,
} from "../../../services/location.service";

type Nav = NativeStackNavigationProp<MainStackParamList>;

// Estado de la ubicacion, independiente del idioma (el texto se traduce aparte)
type LocationStatus = "cargando" | "lista" | "denegado" | "gps_apagado" | "error";

export function useHomeViewModel() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();
  const { t } = useLocale();
  const { config } = useNotifications();

  const [pressed, setPressed] = useState(false);
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("cargando");
  const [resolvedLocation, setResolvedLocation] = useState("");
  const [detailedLocation, setDetailedLocation] =
    useState<DetailedLocation | null>(null);
  const [loading, setLoading] = useState(false);

  // pedirPermiso = false al abrir la pantalla: los permisos se piden en el tutorial o al tocar "actualizar"
  const loadLocation = useCallback(async (requestPermission: boolean) => {
    try {
      setLoading(true);
      setLocationStatus("cargando");

      // Usar el servicio centralizado de ubicación con alta precisión
      const location = await LocationService.getFullLocation(requestPermission);

      if (location) {
        setDetailedLocation(location);

        const fullName = LocationService.formatAddress(location);
        setResolvedLocation(fullName);
        setLocationStatus("lista");

      } else {
        setLocationStatus("error");
      }
    } catch (error) {
      if (error instanceof LocationServicesDisabledError) {
        // GPS / servicios de ubicación del dispositivo apagados
        console.warn("GPS del dispositivo desactivado:", error.message);
        setLocationStatus("gps_apagado");
      } else if (error instanceof LocationPermissionDeniedError) {
        // El usuario negó el permiso a la app
        console.warn("Permiso de ubicación denegado:", error.message);
        setLocationStatus("denegado");
      } else {
        console.error("Error al obtener ubicación mejorada:", error);
        setLocationStatus("error");
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadLocation(false);
  }, [loadLocation]);

  const getLocation = useCallback(() => loadLocation(true), [loadLocation]);

  // Texto de ubicacion ya traducido segun el idioma activo
  const locationName = useMemo(() => {
    switch (locationStatus) {
      case "cargando":
        return t.mapa.cargando;
      case "denegado":
        return t.inicio.permiso_denegado;
      case "gps_apagado":
        return "Enciende la ubicación del celular y toca aquí";
      case "error":
        return t.inicio.error_actualizar;
      default:
        return resolvedLocation;
    }
  }, [locationStatus, resolvedLocation, t]);

  // true solo cuando ya se resolvio una ubicacion real (para mostrar "GPS activo")
  const locationList = locationStatus === "lista";

  const activateAlert = useCallback(() => {
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
  const onButtonPressIn = useCallback(() => {
    setPressed(true);
    if (config.vibracion) Vibration.vibrate([0, 400, 200], true);
  }, [config.vibracion]);
  const onButtonPressOut = useCallback(() => {
    setPressed(false);
    Vibration.cancel();
  }, []);

  // Si se sale de la pantalla con el botón presionado, no deja el teléfono vibrando
  useEffect(() => () => Vibration.cancel(), []);

  const signOutNow = useCallback(() => {
    signOut();
  }, [signOut]);

  return {
    pressed,
    locationName: locationName,
    locationList: locationList,
    detailedLocation: detailedLocation,
    loading: loading,
    getLocation: getLocation,
    activateAlert: activateAlert,
    onButtonPressIn: onButtonPressIn,
    onButtonPressOut: onButtonPressOut,
    signOutNow: signOutNow,
  };
}