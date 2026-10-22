import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import type { RefObject } from "react";
import { Alert, Animated, Linking, Platform } from "react-native";
import type MapView from "../../../components/mapa/MapaLibre";
import * as Location from "expo-location";
import { useNavigation, usePreventRemove, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { createAlertWithRetries, endAlert, getAlert, getViews } from "../../../services/alerts.service";
import { getPublicSettings } from "../../../services/settings.service";
import { toDate } from "../../../services/alert-tracking.service";
import { getOrCreateDevice } from "../../../services/devices.service";
import type { LocationPoint } from "../../../services/alert-tracking.service";
import { placeDescription, getPlace } from "../../../services/geocoding.service";
import { reportLocation } from "../../../services/location-reporter.service";
import { locationPermission } from "../../../services/permisosSeguros";
import { takeOverAlert } from "../../agitar/alertaEnSegundoPlano";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type ActiveAlertRoute = RouteProp<MainStackParamList, "ActiveAlert">;

export type Coordinate = {
  latitude: number;
  longitude: number;
};

// Ciclo de actualizacion de la ubicacion: cada 30 s (10 veces) y luego 5 min de reposo.
const UPDATE_INTERVAL_MS = 30 * 1000;
const UPDATES_PER_CYCLE = 10;
const REST_MS = 5 * 60 * 1000;
const MAX_HISTORY = 15; // puntos a los que se les consulta el barrio (el mapa muestra todos)

// Cuanto esperar antes de la siguiente actualizacion, segun cuantas van en el ciclo actual.
const delayAfterUpdate = (done: number) =>
  done % UPDATES_PER_CYCLE === 0 ? REST_MS : UPDATE_INTERVAL_MS;

// La alerta espera la ubicación como máximo esto; si el GPS no responde (bajo techo, sin señal) se
// crea igual y la ubicación se agrega cuando llegue. Antes la alerta no se enviaba sin GPS.
const MAX_LOCATION_WAIT_MS = 8 * 1000;
// Una lectura de GPS que tarde más que esto se abandona y se usa la última ubicación conocida
const MAX_READ_TIME_MS = 15 * 1000;
const MAX_LAST_KNOWN_AGE_MS = 15 * 60 * 1000;

/** Ubicación actual con límite de tiempo; si no llega, la última que conoce el teléfono. */
async function readLocation(): Promise<Location.LocationObject | null> {
  try {
    const current = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolver) => setTimeout(() => resolver(null), MAX_READ_TIME_MS)),
    ]);
    if (current) return current;
  } catch {
    // sin GPS: se intenta con la última conocida
  }
  return Location.getLastKnownPositionAsync({ maxAge: MAX_LAST_KNOWN_AGE_MS }).catch(() => null);
}

// Si no se pueden leer los ajustes: duración máxima de una alerta y número de emergencias en Colombia
const DEFAULT_MAX_DURATION_MIN = 30;
const DEFAULT_EMERGENCY_NUMBER = "123";
// Cada cuánto se revisa en el servidor si la alerta sigue activa (vencida, atendida o cancelada)
const STATUS_CHECK_MS = 30 * 1000;

/** Cómo terminó la alerta, cuando el servidor la cerró sin que la usuaria tocara "Estoy bien". */
export type AlertEnd = { status: string; minutes: number };

// Mismo formato de tiempo relativo que el modulo "Alerta de emergencia": "5s", "3 min", "2 h".
const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  return `${Math.floor(s / 3600)} h`;
};

type Padding = { top: number; right: number; bottom: number; left: number };
const MAP_PADDING: Padding = { top: 80, right: 60, bottom: 80, left: 60 };
const FULL_MAP_PADDING: Padding = { top: 130, right: 60, bottom: 120, left: 60 };

export function useActiveAlertViewModel() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { t } = useLocale();
  const route = useRoute<ActiveAlertRoute>();

  // Si viene un contacto, la alerta es solo para esa persona (no para todos).
  const targetContact = route.params?.contact;
  const method = route.params?.method;
  // Alerta que ya se creó en segundo plano al agitar el teléfono
  const existingAlert = route.params?.alertId;

  // Referencia al id de la alerta creada en el backend (para poder cerrarla).
  const createdAlertIdRef = useRef<number | null>(null);
  // Mismo id como estado: el chat de la alerta aparece cuando ya existe
  const [alertId, setAlertId] = useState<number | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  // Estado del envío al servidor, para que la usuaria sepa si sus contactos ya fueron avisados
  const [delivery, setDelivery] = useState<{ status: "enviando" | "enviada" | "fallida"; attempt: number; total: number }>({
    status: "enviando",
    attempt: 1,
    total: 1,
  });
  const [manualRetries, setManualRetries] = useState(0);
  // La creación con reintentos puede durar más que un cambio de ubicación: se usa el montaje de la pantalla
  const screenMountedRef = useRef(true);
  useEffect(() => {
    screenMountedRef.current = true;
    return () => {
      screenMountedRef.current = false;
    };
  }, []);

  // Hasta cuándo sigue activa la alerta en el servidor (inicio + duración máxima del panel)
  const [alertStart, setAlertStart] = useState<Date | null>(null);
  const [maxDurationMin, setMaxDurationMin] = useState(DEFAULT_MAX_DURATION_MIN);
  const [emergencyNumber, setEmergencyNumber] = useState(DEFAULT_EMERGENCY_NUMBER);
  // La alerta terminó en el servidor: se deja de enviar la ubicación y se pregunta qué hacer
  const [end, setEnd] = useState<AlertEnd | null>(null);
  const endedRef = useRef(false);
  useEffect(() => {
    getPublicSettings()
      .then((a) => {
        if (a.sosMaxDurationMinutes && a.sosMaxDurationMinutes > 0) setMaxDurationMin(a.sosMaxDurationMinutes);
        if (a.emergencyPhoneNumber) setEmergencyNumber(a.emergencyPhoneNumber);
      })
      .catch(() => {});
  }, []);

  // Ubicacion actual, para el mini-mapa del header y para el mapa en pantalla completa.
  const [location, setLocation] = useState<Coordinate | null>(null);

  // Recorrido de la alerta: cada ubicacion obtenida se guarda como un punto (igual que en
  // "Alerta de emergencia": id, coordenadas y hora de registro). 1 = primer punto.
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const counterDot = useRef(0);
  const [now, setNow] = useState(Date.now());

  // Barrio y lugar de cada punto (id del punto -> "Carrera 7 · Barrio X"), por geocodificacion inversa.
  const [barrios, setBarrios] = useState<Record<string, string>>({});
  const queriedNeighborhoods = useRef<Set<string>>(new Set());
  const alive = useRef(true);

  // Mapa pequeno y mapa en pantalla completa (refs para poder encuadrar todos los pines).
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const fullMapRef = useRef<MapView>(null);
  const [fullMapReady, setFullMapReady] = useState(false);

  // Estado del mapa en pantalla completa (mismo mecanismo que useMapaViewModel: fullscreen + boton "cerrar mapa").
  const [fullscreen, setFullscreen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const closeOpacity = useRef(new Animated.Value(0)).current;

  // Modal de confirmacion para cancelar la alerta ("Estoy bien" -> "Si, cancelar").
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Mientras la alerta está activa no se puede salir con "atrás" ni con el gesto: solo con
  // "Estoy bien" -> "Si, cancelar". Antes se podía salir, la alerta quedaba en curso sin enviar
  // ubicación y se podían activar otras encima.
  const [canLeave, setCanLeave] = useState(false);
  const newAlertRef = useRef(false);
  usePreventRemove(!canLeave, () => {
    Alert.alert(t.alertaActiva.salirBloqueadoTitulo, t.alertaActiva.salirBloqueadoDescripcion);
  });
  useEffect(() => {
    if (!canLeave) return;
    // "Sigo en peligro": se abre una alerta nueva (la anterior ya la cerró el servidor)
    if (newAlertRef.current) navigation.replace("ActiveAlert", targetContact ? { contact: targetContact } : undefined);
    else navigation.replace("DrawerHome");
  }, [canLeave, navigation, targetContact]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);


  const alertCreationStartedRef = useRef(false);
  // Última ubicación obtenida (para enviarla si la alerta se creó antes de tenerla)
  const lastLocationRef = useRef<{ latitude: number; longitude: number; accuracy?: number | null } | null>(null);
  const [locationWaitExpired, setLocationWaitExpired] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLocationWaitExpired(true), MAX_LOCATION_WAIT_MS);
    return () => clearTimeout(t);
  }, []);

  // Si la alerta ya existe, esta pantalla toma el seguimiento que hacía el servicio en segundo plano
  useEffect(() => {
    if (!existingAlert) return;
    alertCreationStartedRef.current = true;
    createdAlertIdRef.current = existingAlert;
    setAlertId(existingAlert);
    setAlertStart(new Date());
    getAlert(existingAlert)
      .then((a) => a.startedAt && setAlertStart(toDate(a.startedAt)))
      .catch(() => {});
    takeOverAlert();
  }, [existingAlert]);

  // Crea la alerta en el backend al activar el SOS (una sola vez, incluyendo la ubicación).
  // Si falla, se vuelve a intentar con la siguiente ubicación o al tocar "Reintentar".
  useEffect(() => {
    (async () => {
      if (!user?.id || alertCreationStartedRef.current) return;
      if (!location && !locationWaitExpired) return; // se espera un poco la ubicación, no más
      alertCreationStartedRef.current = true;

      try {
        setAlertError(null);
        setDelivery({ status: "enviando", attempt: 1, total: 1 });
        const device = await getOrCreateDevice();
        const alert = await createAlertWithRetries({
          userProfileId: user.id,
          deviceId: device.id,
          alertType: "main",
          activationMethod: targetContact
            ? "contact"
            : method === "agitar" ? "suspicious_movement"
            : method === "encendido" ? "power_button"
            : method === "widget" ? "widget"
            : "panic_button",
          status: "active",
          // Alerta normal; si es individual, el mensaje indica el contacto destinatario.
          message: targetContact
            ? `Alerta SOS activada desde la app solo para: ${targetContact.name ?? ""} (${targetContact.phoneNumber})`
            : method === "agitar"
              ? "Alerta SOS activada al agitar el teléfono"
              : method === "encendido"
                ? "Alerta SOS activada con el botón de encendido"
                : method === "widget"
                  ? "Alerta SOS activada desde el widget"
                  : "Alerta SOS activada desde la app",
          latitude: location?.latitude,
          longitude: location?.longitude,
          // Alerta individual: el backend solo avisa a este contacto
          contactIds: targetContact ? [Number(targetContact.id)] : undefined,
        }, {
          onAttempt: ({ attempt, total }) => screenMountedRef.current && setDelivery({ status: "enviando", attempt, total }),
        });
        createdAlertIdRef.current = alert.id;
        setAlertId(alert.id);
        setAlertStart(alert.startedAt ? toDate(alert.startedAt) : new Date());
        if (screenMountedRef.current) setDelivery((e) => ({ ...e, status: "enviada" }));
        // El primer punto del recorrido sale ya: así el contacto ve dónde está desde el primer momento
        // (antes esperaba la siguiente lectura del GPS y veía "sin ubicaciones")
        if (lastLocationRef.current) {
          reportLocation({ ...lastLocationRef.current, alertaId: alert.id });
        }
      } catch (err) {
        console.error("No se pudo crear la alerta en el backend:", err);
        // Se permite volver a intentarlo desde la pantalla
        alertCreationStartedRef.current = false;
        if (screenMountedRef.current) {
          setAlertError("No se pudo registrar la alerta en el servidor");
          setDelivery((e) => ({ ...e, status: "fallida" }));
        }
      }
    })();
    // reintentosManuales: al tocar "Reintentar" se vuelve a correr la creación
  }, [user?.id, location, locationWaitExpired, targetContact, method, manualRetries]);

  const retrySend = useCallback(() => {
    if (createdAlertIdRef.current || alertCreationStartedRef.current) return;
    setManualRetries((n) => n + 1);
  }, []);

  // Actualiza la ubicacion en ciclos para ahorrar bateria: cada 30 s (10 veces) y luego
  // 5 min de reposo, en los que el GPS no se consulta. Despues repite el ciclo.
  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let done = 0;

    (async () => {
      if (!(await locationPermission()) || !mounted) return;

      // La última ubicación conocida es inmediata: el mapa aparece sin esperar al GPS
      const latest = await Location.getLastKnownPositionAsync({ maxAge: MAX_LAST_KNOWN_AGE_MS }).catch(() => null);
      if (latest && mounted) {
        const coords = { latitude: latest.coords.latitude, longitude: latest.coords.longitude };
        lastLocationRef.current = { ...coords, accuracy: latest.coords.accuracy };
        setLocation((current) => current ?? coords);
      }

      const update = async () => {
        if (endedRef.current) return; // la alerta terminó en el servidor: no se envía más
        done += 1;
        try {
          const current = await readLocation();
          if (!current) throw new Error("Sin ubicación");
          if (!mounted) return;
          const coords = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          };
          setLocation(coords);
          lastLocationRef.current = { ...coords, accuracy: current.coords.accuracy };
          // Durante la alerta cada punto se envía al backend asociado a la alerta
          reportLocation({ ...coords, accuracy: current.coords.accuracy, alertaId: createdAlertIdRef.current });

          // Cada ubicacion obtenida tambien se registra como un punto del recorrido.
          counterDot.current += 1;
          const id = `activa-${counterDot.current}`;
          setPoints((prev) => [...prev, { id, ...coords, recordedAt: new Date() }]);
        } catch {
          // Silenciar: si falla, el header muestra el icono de respaldo o la ultima ubicacion.
        }
        if (mounted) timer = setTimeout(update, delayAfterUpdate(done));
      };

      update();
    })();

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Consulta el barrio/lugar solo de los puntos nuevos, uno por uno y empezando por el mas
  // reciente. Se espera 1,1 s entre consultas para respetar el limite del servicio.
  useEffect(() => {
    const pendingItems = points
      .slice(-MAX_HISTORY)
      .filter((p) => !queriedNeighborhoods.current.has(p.id))
      .reverse();
    if (pendingItems.length === 0) return;
    pendingItems.forEach((p) => queriedNeighborhoods.current.add(p.id));

    (async () => {
      for (const p of pendingItems) {
        if (!alive.current) return;
        const place = await getPlace(p.latitude, p.longitude);
        const text = place ? placeDescription(place) : "";
        if (text && alive.current) {
          setBarrios((prev) => ({ ...prev, [p.id]: text }));
        }
        await new Promise((r) => setTimeout(r, 1100));
      }
    })();
  }, [points]);

  // Reloj para el "hace X" de la etiqueta del mapa. Cada 10 s y no cada segundo: un tic por segundo
  // volvía a dibujar toda la pantalla (mapa, cámara y chat) y el teléfono se ponía lento.
  // La cuenta regresiva tiene su propio reloj en <CuentaRegresiva>.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, []);

  // Momento en que la alerta vence en el servidor
  const alertEndMs = alertStart ? alertStart.getTime() + maxDurationMin * 60000 : null;
  const alertEnd = useMemo(() => (alertEndMs === null ? null : new Date(alertEndMs)), [alertEndMs]);

  // ¿Sigue activa? Se revisa cada 30 s y al llegar el contador a 0. Si el servidor la cerró
  // (venció, la marcaron atendida o se canceló desde otro lado) se deja de enviar la ubicación
  const checkStatus = useCallback(async () => {
    const id = createdAlertIdRef.current;
    if (!id || endedRef.current) return;
    try {
      const a = await getAlert(id);
      const status = (a.status || "").toLowerCase();
      if (status && status !== "active") {
        endedRef.current = true;
        setEnd({ status, minutes: maxDurationMin });
      }
    } catch {
      // Sin conexión: se revisa en la siguiente vuelta
    }
  }, [maxDurationMin]);

  useEffect(() => {
    if (!alertId) return;
    const t = setInterval(checkStatus, STATUS_CHECK_MS);
    return () => clearInterval(t);
  }, [alertId, checkStatus]);

  // Quién abrió el seguimiento: le da tranquilidad saber que sus contactos la están viendo
  const [views, setViews] = useState({ total: 0, watchingNow: 0 });
  useEffect(() => {
    if (!alertId) return;
    const leer = () => getViews(alertId).then(setViews).catch(() => {});
    leer();
    const t = setInterval(leer, 15000);
    return () => clearInterval(t);
  }, [alertId]);

  // Al llegar a cero se pregunta al servidor si la alerta ya terminó
  useEffect(() => {
    if (alertId === null || alertEndMs === null) return;
    const t = setTimeout(checkStatus, Math.max(0, alertEndMs - Date.now()) + 1000);
    return () => clearTimeout(t);
  }, [alertId, alertEndMs, checkStatus]);

  // Datos derivados del ultimo punto (mismos que muestra "Alerta de emergencia").
  const lastItem = points.length > 0 ? points[points.length - 1] : null;
  const timeSinceLast = lastItem
    ? formatDuration((now - lastItem.recordedAt.getTime()) / 1000)
    : "";
  const lastNeighborhood = lastItem ? (barrios[lastItem.id] ?? null) : null;
  const lastCoords = lastItem
    ? `${lastItem.latitude.toFixed(4)}, ${lastItem.longitude.toFixed(4)}`
    : "";

  // Encuadra todos los pines en el mapa indicado.
  const fitTo = useCallback(
    (ref: RefObject<MapView | null>, padding: Padding) => {
      if (!ref.current || points.length === 0) return;
      const coords = points.map((p) => ({
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
    [points],
  );

  // Mapa pequeno: se reencuadra cuando llega un punto nuevo.
  useEffect(() => {
    if (mapReady) fitTo(mapRef, MAP_PADDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, points.length]);

  // Mapa en pantalla completa: igual, mientras este abierto.
  useEffect(() => {
    if (fullscreen && fullMapReady) fitTo(fullMapRef, FULL_MAP_PADDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen, fullMapReady, points.length]);

  const onMapReady = useCallback(() => setMapReady(true), []);
  const onFullMapReady = useCallback(() => setFullMapReady(true), []);

  const showAllPoints = useCallback(() => {
    fitTo(fullMapRef, FULL_MAP_PADDING);
  }, [fitTo]);

  // Al tocar "Estoy bien" solo se abre la ventana de verificacion.
  const openConfirmation = useCallback(() => {
    setConfirmVisible(true);
  }, []);

  // Cierra la ventana de verificacion sin cancelar la alerta.
  const closeConfirmation = useCallback(() => {
    setConfirmVisible(false);
  }, []);

  // Se ejecuta cuando el usuario confirma "Si, cancelar".
  const markImOk = useCallback(() => {
    setConfirmVisible(false);
    // Cerrar la alerta activa en el backend (estado cancelada)
    if (createdAlertIdRef.current) {
      endAlert(createdAlertIdRef.current, "cancelled").catch((err) =>
        console.error("No se pudo cerrar la alerta en el backend:", err),
      );
    }
    setCanLeave(true);
  }, []);

  // Abre el marcador con el número de emergencias que define la administración (123 en Colombia)
  const callEmergency = useCallback(() => {
    const url = Platform.OS === "android" ? `tel:${emergencyNumber}` : `telprompt:${emergencyNumber}`;
    Linking.openURL(url).catch(() => {
      // Ignorar silenciosamente si el dispositivo no puede realizar llamadas.
    });
  }, [emergencyNumber]);

  // Cuando la alerta ya terminó en el servidor: salir o activar otra
  const activateAnotherAlert = useCallback(() => {
    setEnd(null);
    newAlertRef.current = true;
    setCanLeave(true);
  }, []);
  const leaveAfterEnd = useCallback(() => {
    setEnd(null);
    setCanLeave(true);
  }, []);

  // Abre el mapa en pantalla completa (equivalente al boton "navegar" del modulo Mapa),
  // pero sin salir de AlertaActiva: es un Modal local, no una navegacion.
  const openFullMap = useCallback(() => {
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
  const closeFullMap = useCallback(() => {
    setFullscreen(false);
    setShowClose(false);
    setFullMapReady(false);
  }, []);

  return {
    alertId: alertId,
    alertEnd: alertEnd,
    maxDurationMin: maxDurationMin,
    markImOk: markImOk,
    openConfirmation: openConfirmation,
    closeConfirmation: closeConfirmation,
    confirmVisible: confirmVisible,
    callEmergency: callEmergency,
    location,
    fullscreen,
    showClose,
    closeOpacity,
    openFullMap: openFullMap,
    handleMapPress,
    closeFullMap: closeFullMap,
    alertError: alertError,
    delivery: delivery,
    end: end,
    views: views,
    activateAnotherAlert: activateAnotherAlert,
    leaveAfterEnd: leaveAfterEnd,
    emergencyNumber: emergencyNumber,
    retrySend: retrySend,
    // Mapa con el mismo diseno y datos que "Alerta de emergencia"
    mapRef,
    fullMapRef: fullMapRef,
    points: points,
    lastItem: lastItem,
    timeSinceLast: timeSinceLast,
    lastNeighborhood: lastNeighborhood,
    lastCoords: lastCoords,
    onMapReady,
    onFullMapReady: onFullMapReady,
    showAllPoints: showAllPoints,
  };
}