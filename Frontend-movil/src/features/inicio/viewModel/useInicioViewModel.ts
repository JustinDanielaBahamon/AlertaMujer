import { useCallback, useEffect, useMemo, useState } from "react";
import { Vibration } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import type { MainStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";

type Nav = NativeStackNavigationProp<MainStackParamList>;

// Estado de la ubicacion, independiente del idioma (el texto se traduce aparte)
type EstadoUbicacion = "cargando" | "lista" | "denegado" | "error";

export function useInicioViewModel() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();
  const { t } = useLocale();

  const [pressed, setPressed] = useState(false);
  const [estadoUbicacion, setEstadoUbicacion] = useState<EstadoUbicacion>("cargando");
  const [ubicacionResuelta, setUbicacionResuelta] = useState("");
  const [cargando, setCargando] = useState(false);

  const obtenerUbicacion = useCallback(async () => {
    try {
      setCargando(true);
      setEstadoUbicacion("cargando");

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setEstadoUbicacion("denegado");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const direccion = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (direccion.length > 0) {
        const lugar = direccion[0];
        const nombreFinal = lugar.name || lugar.street || t.inicio.ubicacion_desconocida;
        setUbicacionResuelta(`${nombreFinal}, ${lugar.city}`);
        setEstadoUbicacion("lista");
      }
    } catch {
      setEstadoUbicacion("error");
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
      case "error":
        return t.inicio.error_actualizar;
      default:
        return ubicacionResuelta;
    }
  }, [estadoUbicacion, ubicacionResuelta, t]);

  // true solo cuando ya se resolvio una ubicacion real (para mostrar "GPS activo")
  const ubicacionLista = estadoUbicacion === "lista";

  const activarAlerta = useCallback(() => {
    Vibration.vibrate(200);
    const stackNav = navigation.getParent()?.getParent();
    if (stackNav && "navigate" in stackNav) {
      (stackNav as { navigate: (name: keyof MainStackParamList) => void }).navigate("Activacion");
      return;
    }
    navigation.navigate("Activacion");
  }, [navigation]);

  const onPressInBoton = useCallback(() => setPressed(true), []);
  const onPressOutBoton = useCallback(() => setPressed(false), []);

  const cerrarSesion = useCallback(() => {
    signOut();
  }, [signOut]);

  return {
    pressed,
    ubicacionNombre,
    ubicacionLista,
    cargando,
    obtenerUbicacion,
    activarAlerta,
    onPressInBoton,
    onPressOutBoton,
    cerrarSesion,
  };
}