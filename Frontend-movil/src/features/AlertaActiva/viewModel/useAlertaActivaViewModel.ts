import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Linking, Platform } from "react-native";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import { createAlert, finalizarAlerta } from "../../../services/alerts.service";
import { getOrCreateDevice } from "../../../services/devices.service";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export type Coordenada = {
  latitude: number;
  longitude: number;
};

// Tiempo total de la cuenta regresiva en segundos. 182s = 3:02, coincidiendo con el diseno de referencia.
const INITIAL_SECONDS = 182;

export function useAlertaActivaViewModel() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  // Referencia al id de la alerta creada en el backend (para poder cerrarla).
  const alertaCreadaIdRef = useRef<number | null>(null);
  const [errorAlerta, setErrorAlerta] = useState<string | null>(null);

  // Crea la alerta en el backend al activar el SOS (una sola vez, incluyendo la ubicación).
  // Generico useState<number>: TypeScript garantiza que este estado solo puede contener un numero.
  const [secondsLeft, setSecondsLeft] = useState<number>(INITIAL_SECONDS);

  // Ubicacion actual, para el mini-mapa del header y para el mapa en pantalla completa.
  const [location, setLocation] = useState<Coordenada | null>(null);

  // Estado del mapa en pantalla completa (mismo mecanismo que useMapaViewModel: fullscreen + boton "cerrar mapa").
  const [fullscreen, setFullscreen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const closeOpacity = useRef(new Animated.Value(0)).current;

  // Modal de confirmacion para cancelar la alerta ("Estoy bien" -> "Si, cancelar").
  const [confirmarVisible, setConfirmarVisible] = useState(false);

  // Efecto de cuenta regresiva: se ejecuta cada segundo y limpia su propio temporizador.
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const alertaCreacionIniciadaRef = useRef(false);

  // Crea la alerta en el backend al activar el SOS (una sola vez, incluyendo la ubicación).
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id || alertaCreacionIniciadaRef.current || !location) return;
      alertaCreacionIniciadaRef.current = true;
      try {
        const device = await getOrCreateDevice(user.id);
        const alerta = await createAlert({
          userProfileId: user.id,
          deviceId: device.id,
          alertType: "main",
          activationMethod: "panic_button",
          status: "active",
          message: "Alerta SOS activada desde la app",
          latitude: location?.latitude,
          longitude: location?.longitude,
        });
        if (mounted) {
          alertaCreadaIdRef.current = alerta.id;
        }
      } catch (err) {
        console.error("No se pudo crear la alerta en el backend:", err);
        if (mounted)
          setErrorAlerta("No se pudo registrar la alerta en el servidor");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id, location]);

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
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 15000,
            distanceInterval: 30,
          },
          (loc) => {
            if (!mounted) return;
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          },
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

  // Al tocar "Estoy bien" solo se abre la ventana de verificacion.
  const abrirConfirmacion = useCallback(() => {
    setConfirmarVisible(true);
  }, []);

  // Cierra la ventana de verificacion sin cancelar la alerta.
  const cerrarConfirmacion = useCallback(() => {
    setConfirmarVisible(false);
  }, []);

  // Se ejecuta cuando el usuario confirma "Si, cancelar".
  const marcarEstoyBien = useCallback(() => {
    setConfirmarVisible(false);
    // Cerrar la alerta activa en el backend (estado cancelada)
    if (alertaCreadaIdRef.current) {
      finalizarAlerta(alertaCreadaIdRef.current, "cancelled").catch((err) =>
        console.error("No se pudo cerrar la alerta en el backend:", err),
      );
    }
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
  }, [showClose, closeOpacity]);

  // Cierra el mapa en pantalla completa y se queda en AlertaActiva (no navega a ningun lado).
  const cerrarMapaCompleto = useCallback(() => {
    setFullscreen(false);
    setShowClose(false);
  }, []);

  return {
    formattedTime,
    marcarEstoyBien,
    abrirConfirmacion,
    cerrarConfirmacion,
    confirmarVisible,
    llamarEmergencias,
    location,
    fullscreen,
    showClose,
    closeOpacity,
    abrirMapaCompleto,
    handleMapPress,
    cerrarMapaCompleto,
    errorAlerta,
  };
}
