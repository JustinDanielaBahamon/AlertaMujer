import { useCallback, useEffect, useState } from "react";
import { Vibration } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import type { MainStackParamList } from "../../src/navigation/types";
import { useAuth } from "../../src/contexts/AuthContext";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useInicioViewModel() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();

  const [pressed, setPressed] = useState(false);
  const [ubicacionNombre, setUbicacionNombre] = useState("Obteniendo ubicación...");
  const [cargando, setCargando] = useState(false);

  const obtenerUbicacion = useCallback(async () => {
    try {
      setCargando(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUbicacionNombre("Permiso denegado");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const direccion = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (direccion.length > 0) {
        const lugar = direccion[0];
        const nombreFinal = lugar.name || lugar.street || "Ubicación desconocida";
        setUbicacionNombre(`${nombreFinal}, ${lugar.city}`);
      }
    } catch {
      setUbicacionNombre("Error al actualizar");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void obtenerUbicacion();
  }, [obtenerUbicacion]);

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
    cargando,
    obtenerUbicacion,
    activarAlerta,
    onPressInBoton,
    onPressOutBoton,
    cerrarSesion,
  };
}
