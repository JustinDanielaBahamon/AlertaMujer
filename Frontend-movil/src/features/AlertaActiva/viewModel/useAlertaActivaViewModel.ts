import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Animated, Linking, Platform } from "react-native";
import type MapView from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import { createAlert, finalizarAlerta } from "../../../services/alerts.service";
import { getOrCreateDevice } from "../../../services/devices.service";
import type { PuntoUbicacion } from "../../../services/alert-tracking.service";
import { descripcionLugar, obtenerLugar } from "../../../services/geocoding.service";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export type Coordenada = {
  latitude: number;
  longitude: number;
};

// Ciclo de actualizacion de la ubicacion: cada 30 s (10 veces) y luego 5 min de reposo.
const INTERVALO_ACTUALIZACION_MS = 30 * 1000;
const ACTUALIZACIONES_POR_CICLO = 10;
const REPOSO_MS = 5 * 60 * 1000;
const MAX_HISTORIAL = 15; // puntos a los que se les consulta el barrio (el mapa muestra todos)

// Cuanto esperar antes de la siguiente actualizacion, segun cuantas van en el ciclo actual.
const esperaTrasActualizacion = (hechas: number) =>
  hechas % ACTUALIZACIONES_POR_CICLO === 0 ? REPOSO_MS : INTERVALO_ACTUALIZACION_MS;

// Tiempo total de la cuenta regresiva en segundos. 182s = 3:02, coincidiendo con el diseno de referencia.
const INITIAL_SECONDS = 182;

// Mismo formato de tiempo relativo que el modulo "Alerta de emergencia": "5s", "3 min", "2 h".
const formatDuracion = (segundos: number) => {
  const s = Math.max(0, Math.round(segundos));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  return `${Math.floor(s / 3600)} h`;
};

type Padding = { top: number; right: number; bottom: number; left: number };
const PADDING_MAPA: Padding = { top: 80, right: 60, bottom: 80, left: 60 };
const PADDING_MAPA_COMPLETO: Padding = { top: 130, right: 60, bottom: 120, left: 60 };

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

  // Recorrido de la alerta: cada ubicacion obtenida se guarda como un punto (igual que en
  // "Alerta de emergencia": id, coordenadas y hora de registro). 1 = primer punto.
  const [puntos, setPuntos] = useState<PuntoUbicacion[]>([]);
  const puntoContador = useRef(0);
  const [ahora, setAhora] = useState(Date.now());

  // Barrio y lugar de cada punto (id del punto -> "Carrera 7 · Barrio X"), por geocodificacion inversa.
  const [barrios, setBarrios] = useState<Record<string, string>>({});
  const barriosConsultados = useRef<Set<string>>(new Set());
  const vivo = useRef(true);

  // Mapa pequeno y mapa en pantalla completa (refs para poder encuadrar todos los pines).
  const mapRef = useRef<MapView>(null);
  const [mapaListo, setMapaListo] = useState(false);
  const mapaCompletoRef = useRef<MapView>(null);
  const [mapaCompletoListo, setMapaCompletoListo] = useState(false);

  // Estado del mapa en pantalla completa (mismo mecanismo que useMapaViewModel: fullscreen + boton "cerrar mapa").
  const [fullscreen, setFullscreen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const closeOpacity = useRef(new Animated.Value(0)).current;

  // Modal de confirmacion para cancelar la alerta ("Estoy bien" -> "Si, cancelar").
  const [confirmarVisible, setConfirmarVisible] = useState(false);

  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
    };
  }, []);

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

  // Actualiza la ubicacion en ciclos para ahorrar bateria: cada 30 s (10 veces) y luego
  // 5 min de reposo, en los que el GPS no se consulta. Despues repite el ciclo.
  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hechas = 0;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || !mounted) return;

      const actualizar = async () => {
        hechas += 1;
        try {
          const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!mounted) return;
          const coords = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          };
          setLocation(coords);

          // Cada ubicacion obtenida tambien se registra como un punto del recorrido.
          puntoContador.current += 1;
          const id = `activa-${puntoContador.current}`;
          setPuntos((prev) => [...prev, { id, ...coords, recordedAt: new Date() }]);
        } catch {
          // Silenciar: si falla, el header muestra el icono de respaldo o la ultima ubicacion.
        }
        if (mounted) timer = setTimeout(actualizar, esperaTrasActualizacion(hechas));
      };

      actualizar();
    })();

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Consulta el barrio/lugar solo de los puntos nuevos, uno por uno y empezando por el mas
  // reciente. Se espera 1,1 s entre consultas para respetar el limite del servicio.
  useEffect(() => {
    const pendientes = puntos
      .slice(-MAX_HISTORIAL)
      .filter((p) => !barriosConsultados.current.has(p.id))
      .reverse();
    if (pendientes.length === 0) return;
    pendientes.forEach((p) => barriosConsultados.current.add(p.id));

    (async () => {
      for (const p of pendientes) {
        if (!vivo.current) return;
        const lugar = await obtenerLugar(p.latitude, p.longitude);
        const texto = lugar ? descripcionLugar(lugar) : "";
        if (texto && vivo.current) {
          setBarrios((prev) => ({ ...prev, [p.id]: texto }));
        }
        await new Promise((r) => setTimeout(r, 1100));
      }
    })();
  }, [puntos]);

  // Reloj para el "hace X segundos" de la etiqueta del mapa.
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Valor derivado (no es un estado): se recalcula en cada render a partir de secondsLeft.
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${String(seconds).padStart(2, "0")}`;

  // Datos derivados del ultimo punto (mismos que muestra "Alerta de emergencia").
  const ultimo = puntos.length > 0 ? puntos[puntos.length - 1] : null;
  const tiempoDesdeUltimo = ultimo
    ? formatDuracion((ahora - ultimo.recordedAt.getTime()) / 1000)
    : "";
  const barrioUltimo = ultimo ? (barrios[ultimo.id] ?? null) : null;
  const coordsUltimo = ultimo
    ? `${ultimo.latitude.toFixed(4)}, ${ultimo.longitude.toFixed(4)}`
    : "";

  // Encuadra todos los pines en el mapa indicado.
  const ajustarEn = useCallback(
    (ref: RefObject<MapView | null>, padding: Padding) => {
      if (!ref.current || puntos.length === 0) return;
      const coords = puntos.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));
      if (coords.length === 1) {
        ref.current.animateToRegion(
          { ...coords[0], latitudeDelta: 0.005, longitudeDelta: 0.005 },
          400,
        );
      } else {
        ref.current.fitToCoordinates(coords, { edgePadding: padding, animated: true });
      }
    },
    [puntos],
  );

  // Mapa pequeno: se reencuadra cuando llega un punto nuevo.
  useEffect(() => {
    if (mapaListo) ajustarEn(mapRef, PADDING_MAPA);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapaListo, puntos.length]);

  // Mapa en pantalla completa: igual, mientras este abierto.
  useEffect(() => {
    if (fullscreen && mapaCompletoListo) ajustarEn(mapaCompletoRef, PADDING_MAPA_COMPLETO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen, mapaCompletoListo, puntos.length]);

  const onMapReady = useCallback(() => setMapaListo(true), []);
  const onMapaCompletoReady = useCallback(() => setMapaCompletoListo(true), []);

  const verTodosLosPuntos = useCallback(() => {
    ajustarEn(mapaCompletoRef, PADDING_MAPA_COMPLETO);
  }, [ajustarEn]);

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
    setMapaCompletoListo(false);
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
    // Mapa con el mismo diseno y datos que "Alerta de emergencia"
    mapRef,
    mapaCompletoRef,
    puntos,
    ultimo,
    tiempoDesdeUltimo,
    barrioUltimo,
    coordsUltimo,
    onMapReady,
    onMapaCompletoReady,
    verTodosLosPuntos,
  };
}