import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Linking, Platform } from "react-native";
import * as Location from "expo-location";
import type MapView from "../../../components/map/MapLibreMap";
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
import { stopSosAlarm } from "../../../notifications/sosAlarm";
import { placeDescription, getPlace } from "../../../services/geocoding.service";

// Update cycle: the location is updated every 30 s; after 10 updates
// it rests for 5 minutes (saves battery) and then the cycle repeats.
// Refresh of the tracking the contact sees
const CONTACT_REFRESH_MS = 10 * 1000;
const CONTACT_SLOW_REFRESH_MS = 30 * 1000;
const UPDATE_INTERVAL_MS = 30 * 1000;
const UPDATES_PER_CYCLE = 10;
const REST_MS = 5 * 60 * 1000;
const MAX_HISTORY = 15; // records shown in the list (the map shows all of them)
const TIME_ZONE = "America/Bogota";
const FINAL_STATUSES = ["cancelled", "cancelada", "resolved", "atendida", "finalizada"];

// TEMPORARY (demo mode): fallback coordinates for the simulated points.
const DEMO_COORDS = { latitude: 2.9273, longitude: -75.2895 };

type Padding = { top: number; right: number; bottom: number; left: number };
const MAP_PADDING: Padding = { top: 80, right: 60, bottom: 80, left: 60 };
const FULL_MAP_PADDING: Padding = { top: 130, right: 60, bottom: 120, left: 60 };

// How long to wait before the next update, depending on how many were done in the current cycle.
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
  const { params } = useRoute<RouteProp<MainStackParamList, "ContactAlert">>();

  // TEMPORARY: in demo mode the backend is not queried, the points are simulated.
  const DEMO = params.demo === true;

  // Small map on the screen and map of the popup.
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const fullMapRef = useRef<MapView>(null);
  const [fullMapReady, setFullMapReady] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  // If the notification brings coordinates, they are shown right away while the first fetch arrives.
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
  // Emergency number set by the administration (123 in Colombia)
  const [emergencyNumber, setEmergencyNumber] = useState("123");
  useEffect(() => {
    getPublicSettings()
      .then((a) => a.emergencyPhoneNumber && setEmergencyNumber(a.emergencyPhoneNumber))
      .catch(() => {});
  }, []);
  // Alert recordings (video and audio in parts): the contact sees them to help locate her
  const [evidence, setEvidence] = useState<TrackingEvidence[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Neighborhood and place of each point (point id -> "Carrera 7 · Barrio X"), by reverse geocoding.
  const [barrios, setBarrios] = useState<Record<string, string>>({});
  const queriedNeighborhoods = useRef<Set<string>>(new Set());
  const alive = useRef(true);
  const demoCounter = useRef(0); // unique ids for the simulated points (never reset)
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Looks up the neighborhood/place only for new points (those in the history), one by one starting
  // with the most recent. Waits 1.1 s between queries to respect the service limit.
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

  // Fetches the alert when the screen opens and then in cycles: every 30 s (10 times) and 5 min of rest;
  // it stops when the user cancels or ends it.
  useEffect(() => {
    if (DEMO) return undefined; // TEMPORAL

    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let done = 0; // updates done (all are counted, also the failed ones)

    const load = async () => {
      done += 1;
      try {
        // Emergency contact (arrives by push): public endpoint with the tracking code
        // The first query tells the user that this contact saw the alert
        const tracking = params.code
          ? await getPublicTracking(params.code, done === 1 ? params.delivery : null)
          : await getAlertTracking(params.alertId);
        if (!mounted) return;

        setConnectionError(false);
        if (tracking.points.length > 0) setPoints(tracking.points);
        if (tracking.evidence) setEvidence(tracking.evidence);
        setWarning(tracking.warning ?? null);
        setLoading(false);

        const stillActive = !FINAL_STATUSES.includes(tracking.status);
        setActive(stillActive);
        if (!stillActive) return; // last query done, not rescheduled
      } catch {
        if (!mounted) return;
        setConnectionError(true);
        setLoading(false);
      }
      // The helper needs to see the movement almost live: every 10 s for the first 10 minutes and
      // then every 30 s (not the battery saving cycle the user's phone uses)
      if (mounted) timer = setTimeout(load, done <= 60 ? CONTACT_REFRESH_MS : CONTACT_SLOW_REFRESH_MS);
    };

    load();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [params.alertId, params.code, DEMO]);

  // Opening the alert screen turns the alarm off
  useEffect(() => {
    if (!DEMO) stopSosAlarm(params.alertId).catch(() => undefined);
  }, [params.alertId, DEMO]);

  // ===== TEMPORARY (demo mode): adds a new point with the phone's real location =====
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

      // First point: the location the screen was opened with. The next ones: the real GPS,
      // so if you do not move the point stays in the same place (if it fails, the base is used).
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
          // No GPS: keeps the base location.
        }
      }
      if (!mounted) return;

      demoCounter.current += 1;
      const id = `demo-${demoCounter.current}`;
      setPoints((prev) => [...prev, { id, ...coords, recordedAt: new Date() }]);
      setLoading(false);
      // Same cycle as the real one: 30 s between points and 5 min of rest every 10.
      timer = setTimeout(addPoint, delayAfterUpdate(done));
    };

    addPoint();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DEMO]);
  // ===== END TEMPORARY =====

  // Clock for "X ago". Every 5 s: a tick per second redrew the whole screen with the map.
  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, [active]);

  const lastItem = points.length > 0 ? points[points.length - 1] : null;

  // Relative text: "5s", "3 min"... (the view adds "hace" / "ago" depending on the language).
  const timeSinceLast = lastItem
    ? formatDuration((now - lastItem.recordedAt.getTime()) / 1000)
    : "";

  // History: most recent on top, with the same numbering as the pins (1 = first point sent).
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

  // Fits every pin on the given map.
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

  // Small map: refit when a new point arrives (not on every query).
  useEffect(() => {
    if (mapReady) fitTo(mapRef, MAP_PADDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, points.length]);

  // Popup map: the same, while it is open.
  useEffect(() => {
    if (mapVisible && fullMapReady) fitTo(fullMapRef, FULL_MAP_PADDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapVisible, fullMapReady, points.length]);

  const onMapReady = useCallback(() => setMapReady(true), []);
  const onFullMapReady = useCallback(() => setFullMapReady(true), []);

  // Opens the popup with the map (the app is not left and Google Maps is not opened).
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
    code: params.code,
    // She does not answer, her phone stopped sending its location, or she cancelled under duress
    warning: active ? warning : null,
    videos,
    audios,
    userName: params.userName,
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