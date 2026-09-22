import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Linking, Platform } from "react-native";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export type Coordenada = {
  latitude: number;
  longitude: number;
};

// Tiempo total de la cuenta regresiva en segundos. 182s = 3:02, coincidiendo con el diseno de referencia.
const INITIAL_SECONDS = 182;

export function useAlertaActivaViewModel() {
  const navigation = useNavigation<Nav>();

  // Generico useState<number>: TypeScript garantiza que este estado solo puede contener un numero.
  const [secondsLeft, setSecondsLeft] = useState<number>(INITIAL_SECONDS);

  // Ubicacion actual, para el mini-mapa del header y para el mapa en pantalla completa.
  const [location, setLocation] = useState<Coordenada | null>(null);

  // Estado del mapa en pantalla completa (mismo mecanismo que useMapaViewModel: fullscreen + boton "cerrar mapa").
  const [fullscreen, setFullscreen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const closeOpacity = useRef(new Animated.Value(0)).current;

  // Efecto de cuenta regresiva: se ejecuta cada segundo y limpia su propio temporizador.
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Obtiene y sigue la ubicacion en tiempo real.
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let mounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;

        setLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });

        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 30 },
          (loc) => {
            if (!mounted) return;
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        );
      } catch {
        // Silenciar: si falla, el header simplemente muestra el icono de respaldo.
      }
    })();

    return () => {
      mounted = false;
      if (subscription) subscription.remove();
    };
  }, []);

  // Valor derivado (no es un estado): se recalcula en cada render a partir de secondsLeft.
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${String(seconds).padStart(2, "0")}`;

  // Se ejecuta cuando el usuario presiona "Estoy bien".
  const marcarEstoyBien = useCallback(() => {
    // TODO: llamar aqui a la capa de alertas/servicios para cerrar la alerta activa en el backend.
    navigation.replace("DrawerHome");
  }, [navigation]);

  // Abre el marcador del telefono con el 911 ya preparado.
  const llamarEmergencias = useCallback(() => {
    const url = Platform.OS === "android" ? "tel:911" : "telprompt:911";
    Linking.openURL(url).catch(() => {
      // Ignorar silenciosamente si el dispositivo no puede realizar llamadas.
    });
  }, []);

  // Abre el mapa en pantalla completa (equivalente al boton "navegar" del modulo Mapa),
  // pero sin salir de AlertaActiva: es un Modal local, no una navegacion.
  const abrirMapaCompleto = useCallback(() => {
    if (location) setFullscreen(true);
  }, [location]);

  // Al tocar el mapa en pantalla completa, muestra el boton "cerrar mapa" 15s (igual que en Mapa).
  const handleMapPress = useCallback(() => {
    if (showClose) return;

    setShowClose(true);
    Animated.timing(closeOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    setTimeout(() => {
      Animated.timing(closeOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
        setShowClose(false)
      );
    }, 15000);
  }, [showClose, closeOpacity]);

  // Cierra el mapa en pantalla completa y se queda en AlertaActiva (no navega a ningun lado).
  const cerrarMapaCompleto = useCallback(() => {
    setFullscreen(false);
    setShowClose(false);
  }, []);

  return {
    formattedTime,
    marcarEstoyBien,
    llamarEmergencias,
    location,
    fullscreen,
    showClose,
    closeOpacity,
    abrirMapaCompleto,
    handleMapPress,
    cerrarMapaCompleto,
  };
}