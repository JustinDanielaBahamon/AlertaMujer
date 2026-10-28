import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Vibration } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useNotifications } from "../../../contexts/NotificationsContext";
import type { MainStackParamList } from "../../../navigation/types";
import {
  LocationPermissionDeniedError,
  LocationService,
  LocationServicesDisabledError,
  type DetailedLocation,
} from "../../../services/location.service";

type Nav = NativeStackNavigationProp<MainStackParamList>;

// Location status, independent of the language (the text is translated separately)
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

  // askPermission = false when the screen opens: permissions are asked in the tutorial or when tapping "update"
  const loadLocation = useCallback(async (requestPermission: boolean) => {
    try {
      setLoading(true);
      setLocationStatus((current) => (current === "lista" ? current : "cargando"));

      // At once: the position the phone already knows; then the precise GPS reading replaces it
      const quick = await LocationService.getQuickLocation();
      if (quick) {
        setDetailedLocation(quick);
        setResolvedLocation(LocationService.formatAddress(quick));
        setLocationStatus("lista");
      }

      const location = await LocationService.getFullLocation(requestPermission);

      if (location) {
        setDetailedLocation(location);

        const fullName = LocationService.formatAddress(location);
        setResolvedLocation(fullName);
        setLocationStatus("lista");

      } else if (!quick) {
        setLocationStatus("error");
      }
    } catch (error) {
      if (error instanceof LocationServicesDisabledError) {
        // GPS / device location services turned off
        console.warn("GPS del dispositivo desactivado:", error.message);
        setLocationStatus("gps_apagado");
      } else if (error instanceof LocationPermissionDeniedError) {
        // The user denied the permission to the app
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

  // Location text already translated to the active language
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

  // true only once a real location was resolved (to show "GPS active")
  const locationList = locationStatus === "lista";

  const activateAlert = useCallback(() => {
    if (config.vibracion) Vibration.vibrate(200);
    const stackNav = navigation.getParent()?.getParent();
    if (stackNav && "navigate" in stackNav) {
      (
        stackNav as { navigate: (name: keyof MainStackParamList) => void }
      ).navigate("Activation");
      return;
    }
    navigation.navigate("Activation");
  }, [navigation, config.vibracion]);

  // Vibrates while the button is pressed and stops when released
  const onButtonPressIn = useCallback(() => {
    setPressed(true);
    if (config.vibracion) Vibration.vibrate([0, 400, 200], true);
  }, [config.vibracion]);
  const onButtonPressOut = useCallback(() => {
    setPressed(false);
    Vibration.cancel();
  }, []);

  // If the screen is left with the button pressed, the phone is not left vibrating
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