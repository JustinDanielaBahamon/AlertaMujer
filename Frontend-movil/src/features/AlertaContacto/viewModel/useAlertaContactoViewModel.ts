import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Linking, Platform } from "react-native";
import * as Location from "expo-location";
import type MapView from "../../../components/mapa/MapaLibre";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { MainStackParamList } from "../../../navigation/types";
import {
  getAlertTracking,
  getPublicTracking,
  type TrackingEvidence,
  type LocationPoint,
} from "../../../services/alert-tracking.service";
import { getPublicSettings } from "../../../services/settings.service";
import { stopSosAlarm } from "../../../notifications/alarmaSos";
import { placeDescription, getPlace } from "../../../services/geocoding.service";

// Ciclo de actualización: cada 30 s se actualiza la ubicación; tras 10 actualizaciones
// se entra en reposo 5 minutos (ahorra batería) y luego se repite el ciclo.
// Refresco del seguimiento que ve el contacto
const CONTACT_REFRESH_MS = 10 * 1000;
const CONTACT_SLOW_REFRESH_MS = 30 * 1000;
const UPDATE_INTERVAL_MS = 30 * 1000;
const UPDATES_PER_CYCLE = 10;
const REST_MS = 5 * 60 * 1000;
const MAX_HISTORY = 15; // registros que se muestran en la lista (el mapa muestra todos)
const TIME_ZONE = "America/Bogota";
const FINAL_STATUSES = ["cancelled", "cancelada", "resolved", "atendida", "finalizada"];

// TEMPORAL (modo demo): coordenadas de respaldo para los puntos simulados.
const DEMO_COORDS = { latitude: 2.9273, longitude: -75.2895 };

type Padding = { top: number; right: number; bottom: number; left: number };
const MAP_PADDING: Padding = { top: 80, right: 60, bottom: 80, left: 60 };
const FULL_MAP_PADDING: Padding = { top: 130, right: 60, bottom: 120, left: 60 };

// Cuánto esperar antes de la siguiente actualización, según cuántas van en el ciclo actual.
const delayAfterUpdate = (done: number) =>
  done % UPDATES_PER_CYCLE === 0 ? REST_MS : UPDATE_INTERVAL_MS;

const formatTime = (d: Date) =>
  d.toLocaleTimeString("es-CO", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

const formatDate = (d: Date) =>
  d.toLocaleDateString("es-CO", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  return `${Math.floor(s / 3600)} h`;
};

export type HistoryItem = {
  id: string;
  number: string;
  time: string;
  lat: string;
  lng: string;
  offset: string | null;
  neighborhood: string | null;
  isCurrent: boolean;
};

export function useContactAlertViewModel() {
  const { params } = useRoute<RouteProp<MainStackParamList, "AlertaContacto">>();

  // TEMPORAL: en modo demo no se consulta el backend, se simulan los puntos.
  const DEMO = params.demo === true;

  // Mapa pequeño de la pantalla y mapa de la ventana emergente.
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const fullMapRef = useRef<MapView>(null);
  const [fullMapReady, setFullMapReady] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  // Si la notificación trae coordenadas, se muestran de inmediato mientras llega el primer fetch.
  const [points, setPoints] = useState<LocationPoint[]>(() =>
    !DEMO && params.latitude != null && params.longitude != null
      ? [
          {
            id: "inicial",
            latitude: params.latitude,
            longitude: params.longitude,
            recordedAt: new Date(),
          },
        ]
      : [],
  );
  const [active, setActive] = useState(true);
  // Número de emergencias que define la administración (123 en Colombia)
  const [emergencyNumber, setEmergencyNumber] = useState("123");
  useEffect(() => {
    getPublicSettings()
      .then((a) => a.emergencyPhoneNumber && setEmergencyNumber(a.emergencyPhoneNumber))
      .catch(() => {});
  }, []);
  // Grabaciones de la alerta (video y audio por partes): el contacto las ve para ayudar a ubicarla
  const [evidence, setEvidence] = useState<TrackingEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Barrio y lugar de cada punto (id del punto -> "Carrera 7 · Barrio X"), por geocodificación inversa.
  const [barrios, setBarrios] = useState<Record<string, string>>({});
  const queriedNeighborhoods = useRef<Set<string>>(new Set());
  const alive = useRef(true);
  const demoCounter = useRef(0); // ids únicos para los puntos simulados (no se reinicia)
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Consulta el barrio/lugar solo de los puntos nuevos (los del historial), uno por uno y empezando
  // por el más reciente. Se espera 1,1 s entre consultas para respetar el límite del servicio.
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

  // Consulta la alerta al abrir la pantalla y luego en ciclos: cada 30 s (10 veces) y 5 min de reposo;
  // se detiene cuando la usuaria la cancela o finaliza.
  useEffect(() => {
    if (DEMO) return undefined; // TEMPORAL

    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let done = 0; // actualizaciones hechas (se cuentan todas, también las fallidas)

    const load = async () => {
      done += 1;
      try {
        // Contacto de emergencia (llega por push): endpoint público con el código de seguimiento
        const tracking = params.codigo
          ? await getPublicTracking(params.codigo)
          : await getAlertTracking(params.alertaId);
        if (!mounted) return;

        setConnectionError(false);
        if (tracking.points.length > 0) setPoints(tracking.points);
        if (tracking.evidence) setEvidence(tracking.evidence);
        setLoading(false);

        const stillActive = !FINAL_STATUSES.includes(tracking.status);
        setActive(stillActive);
        if (!stillActive) return; // última consulta hecha, no se reprograma
      } catch {
        if (!mounted) return;
        setConnectionError(true);
        setLoading(false);
      }
      // Quien ayuda necesita ver el movimiento casi en vivo: cada 10 s los primeros 10 minutos y
      // luego cada 30 s (no el ciclo de ahorro de batería que usa el celular de la usuaria)
      if (mounted) timer = setTimeout(load, done <= 60 ? CONTACT_REFRESH_MS : CONTACT_SLOW_REFRESH_MS);
    };

    load();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [params.alertaId, params.codigo, DEMO]);

  // Al abrir la pantalla de la alerta se apaga la alarma
  useEffect(() => {
    if (!DEMO) stopSosAlarm(params.alertaId).catch(() => undefined);
  }, [params.alertaId, DEMO]);

  // ===== TEMPORAL (modo demo): agrega un punto nuevo con la ubicación real del teléfono =====
  useEffect(() => {
    if (!DEMO) return undefined;

    const base = {
      latitude: params.latitude ?? DEMO_COORDS.latitude,
      longitude: params.longitude ?? DEMO_COORDS.longitude,
    };
    let mounted = true;
    let done = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const addPoint = async () => {
      done += 1;

      // Primer punto: la ubicación con la que se abrió la pantalla. Los siguientes: el GPS real,
      // así que si no te mueves el punto se queda en el mismo lugar (si falla, se usa la base).
      let coords = base;
      if (done > 1) {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status === "granted") {
            const current = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            coords = {
              latitude: current.coords.latitude,
              longitude: current.coords.longitude,
            };
          }
        } catch {
          // Sin GPS: se queda con la ubicación base.
        }
      }
      if (!mounted) return;

      demoCounter.current += 1;
      const id = `demo-${demoCounter.current}`;
      setPoints((prev) => [...prev, { id, ...coords, recordedAt: new Date() }]);
      setLoading(false);
      // Mismo ciclo que el real: 30 s entre puntos y reposo de 5 min cada 10.
      timer = setTimeout(addPoint, delayAfterUpdate(done));
    };

    addPoint();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DEMO]);
  // ===== FIN TEMPORAL =====

  // Reloj para el "hace X". Cada 5 s: un tic por segundo volvía a dibujar toda la pantalla con el mapa.
  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, [active]);

  const lastItem = points.length > 0 ? points[points.length - 1] : null;

  // Texto relativo: "5s", "3 min"... (la vista le agrega "hace" / "ago" según el idioma).
  const timeSinceLast = lastItem
    ? formatDuration((now - lastItem.recordedAt.getTime()) / 1000)
    : "";

  // Historial: más reciente arriba, con la misma numeración de los pines (1 = primer punto enviado).
  const history: HistoryItem[] = useMemo(() => {
    if (points.length === 0) return [];
    const last = points[points.length - 1];
    return points
      .map((p, i) => {
        const isCurrent = i === points.length - 1;
        return {
          id: p.id,
          number: String(i + 1).padStart(2, "0"),
          time: formatTime(p.recordedAt),
          lat: p.latitude.toFixed(4),
          lng: p.longitude.toFixed(4),
          offset: isCurrent
            ? null
            : `-${formatDuration((last.recordedAt.getTime() - p.recordedAt.getTime()) / 1000)}`,
          neighborhood: barrios[p.id] ?? null,
          isCurrent: isCurrent,
        };
      })
      .reverse()
      .slice(0, MAX_HISTORY);
  }, [points, barrios]);

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

  // Mapa pequeño: se reencuadra cuando llega un punto nuevo (no en cada consulta).
  useEffect(() => {
    if (mapReady) fitTo(mapRef, MAP_PADDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, points.length]);

  // Mapa de la ventana emergente: igual, mientras esté abierta.
  useEffect(() => {
    if (mapVisible && fullMapReady) fitTo(fullMapRef, FULL_MAP_PADDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapVisible, fullMapReady, points.length]);

  const onMapReady = useCallback(() => setMapReady(true), []);
  const onFullMapReady = useCallback(() => setFullMapReady(true), []);

  // Abre la ventana emergente con el mapa (no se sale de la app ni se abre Google Maps).
  const openMap = useCallback(() => {
    if (lastItem) setMapVisible(true);
  }, [lastItem]);

  const closeMap = useCallback(() => {
    setMapVisible(false);
    setFullMapReady(false);
  }, []);

  const showAllPoints = useCallback(() => {
    fitTo(fullMapRef, FULL_MAP_PADDING);
  }, [fitTo]);

  const callEmergency = useCallback(() => {
    const url = Platform.OS === "android" ? `tel:${emergencyNumber}` : `telprompt:${emergencyNumber}`;
    Linking.openURL(url).catch(() => {});
  }, [emergencyNumber]);

  const videos = evidence.filter((e) => e.type === "video");
  const audios = evidence.filter((e) => e.type === "audio");

  return {
    code: params.codigo,
    videos,
    audios,
    userName: params.nombreUsuaria,
    mapRef,
    fullMapRef: fullMapRef,
    points: points,
    lastItem: lastItem,
    active: active,
    loading: loading,
    connectionError: connectionError,
    timeSinceLast: timeSinceLast,
    history: history,
    lastNeighborhood: lastItem ? (barrios[lastItem.id] ?? null) : null,
    lastDate: lastItem ? formatDate(lastItem.recordedAt) : "",
    lastTime: lastItem ? formatTime(lastItem.recordedAt) : "",
    lastCoords: lastItem
      ? `${lastItem.latitude.toFixed(4)}, ${lastItem.longitude.toFixed(4)}`
      : "",
    mapVisible: mapVisible,
    onMapReady,
    onFullMapReady: onFullMapReady,
    openMap: openMap,
    closeMap: closeMap,
    showAllPoints: showAllPoints,
    callEmergency: callEmergency,
    emergencyNumber: emergencyNumber,
  };
}