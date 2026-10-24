import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import type { RefObject } from "react";
import { Alert, Animated, Linking, Platform } from "react-native";
import type MapView from "../../../components/map/MapLibreMap";
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
import { locationPermission } from "../../../services/safePermissions";
import { takeOverAlert } from "../../shake/backgroundAlert";
import { clearShakeAlertNotice } from "../../shake/protectionService";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type ActiveAlertRoute = RouteProp<MainStackParamList, "ActiveAlert">;

export type Coordinate = {
  latitude: number;
  longitude: number;
};

// Location update cycle: every 30 s (10 times) and then 1 min of rest.
const UPDATE_INTERVAL_MS = 30 * 1000;
const UPDATES_PER_CYCLE = 10;
const REST_MS = 60 * 1000;
const MAX_HISTORY = 15; // points whose neighborhood is looked up (the map shows all of them)

// How long to wait before the next update, depending on how many were done in the current cycle.
const delayAfterUpdate = (done: number) =>
  done % UPDATES_PER_CYCLE === 0 ? REST_MS : UPDATE_INTERVAL_MS;

// The alert waits for the location at most this long; if the GPS does not respond (indoors, no signal) it
// is created anyway and the location is added when it arrives. Before, the alert was not sent without GPS.
const MAX_LOCATION_WAIT_MS = 8 * 1000;
// A GPS reading that takes longer than this is abandoned and the last known location is used
const MAX_READ_TIME_MS = 15 * 1000;
const MAX_LAST_KNOWN_AGE_MS = 15 * 60 * 1000;

/** Current location with a time limit; if it does not arrive, the last one the phone knows. */
async function readLocation(): Promise<Location.LocationObject | null> {
  try {
    const current = await Promise.race([
      // High accuracy uses the GPS, which works without internet (balanced relies on Wi-Fi and cell towers)
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<null>((resolver) => setTimeout(() => resolver(null), MAX_READ_TIME_MS)),
    ]);
    if (current) return current;
  } catch {
    // no GPS: try the last known location
  }
  return Location.getLastKnownPositionAsync({ maxAge: MAX_LAST_KNOWN_AGE_MS }).catch(() => null);
}

// If the settings cannot be read: maximum alert duration and the emergency number in Colombia
const DEFAULT_MAX_DURATION_MIN = 30;
const DEFAULT_EMERGENCY_NUMBER = "123";
// How often the server is checked to see whether the alert is still active (expired, attended or cancelled)
const STATUS_CHECK_MS = 30 * 1000;

/** How the alert ended, when the server closed it without the user tapping "I'm fine". */
export type AlertEnd = { status: string; minutes: number };

// Same relative time format as the "Emergency alert" module: "5s", "3 min", "2 h".
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

  // If a contact comes in, the alert is only for that person (not for everyone).
  const targetContact = route.params?.contact;
  const method = route.params?.method;
  // Alert already created in the background when the phone was shaken
  const existingAlert = route.params?.alertId;

  // Ref to the id of the alert created in the backend (to be able to close it).
  const createdAlertIdRef = useRef<number | null>(null);
  // Same id as state: the alert chat appears once it exists
  const [alertId, setAlertId] = useState<number | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  // Delivery status to the server, so the user knows whether her contacts were notified
  const [delivery, setDelivery] = useState<{ status: "enviando" | "enviada" | "fallida"; attempt: number; total: number }>({
    status: "enviando",
    attempt: 1,
    total: 1,
  });
  const [manualRetries, setManualRetries] = useState(0);
  // Creating with retries may take longer than a location change: the screen mount is used
  const screenMountedRef = useRef(true);
  useEffect(() => {
    screenMountedRef.current = true;
    return () => {
      screenMountedRef.current = false;
    };
  }, []);

  // Until when the alert stays active on the server (start + panel maximum duration)
  const [alertStart, setAlertStart] = useState<Date | null>(null);
  const [maxDurationMin, setMaxDurationMin] = useState(DEFAULT_MAX_DURATION_MIN);
  const [emergencyNumber, setEmergencyNumber] = useState(DEFAULT_EMERGENCY_NUMBER);
  // The alert ended on the server: stop sending the location and ask what to do
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

  // Current location, for the header mini map and for the full-screen map.
  const [location, setLocation] = useState<Coordinate | null>(null);

  // Alert route: each location obtained is stored as a point (same as
  // "Emergency alert": id, coordinates and record time). 1 = first point.
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const counterDot = useRef(0);
  const [now, setNow] = useState(Date.now());

  // Neighborhood and place of each point (point id -> "Carrera 7 · Barrio X"), by reverse geocoding.
  const [barrios, setBarrios] = useState<Record<string, string>>({});
  const queriedNeighborhoods = useRef<Set<string>>(new Set());
  const alive = useRef(true);

  // Small map and full-screen map (refs to fit all the pins).
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const fullMapRef = useRef<MapView>(null);
  const [fullMapReady, setFullMapReady] = useState(false);

  // Full-screen map state (same mechanism as useMapViewModel: fullscreen + "close map" button).
  const [fullscreen, setFullscreen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const closeOpacity = useRef(new Animated.Value(0)).current;

  // Confirmation modal to cancel the alert ("I'm fine" -> "Yes, cancel").
  const [confirmVisible, setConfirmVisible] = useState(false);

  // While the alert is active she cannot leave with "back" or the gesture: only with
  // "I'm fine" -> "Yes, cancel". Before, leaving left the alert running without sending the
  // location and other alerts could be activated on top.
  const [canLeave, setCanLeave] = useState(false);
  const newAlertRef = useRef(false);
  usePreventRemove(!canLeave, () => {
    Alert.alert(t.alertaActiva.salirBloqueadoTitulo, t.alertaActiva.salirBloqueadoDescripcion);
  });
  useEffect(() => {
    if (!canLeave) return;
    // The alert is over for this screen: the "Alerta enviada" notice must not open it again
    void clearShakeAlertNotice();
    // "I'm still in danger": a new alert opens (the server already closed the previous one)
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
  // Last location obtained (to send it if the alert was created before having it)
  const lastLocationRef = useRef<{ latitude: number; longitude: number; accuracy?: number | null } | null>(null);
  const [locationWaitExpired, setLocationWaitExpired] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLocationWaitExpired(true), MAX_LOCATION_WAIT_MS);
    return () => clearTimeout(t);
  }, []);

  // If the alert already exists, this screen takes over the tracking the background service was doing
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

  // Creates the alert in the backend when SOS is activated (only once, including the location).
  // If it fails, it is retried with the next location or when "Retry" is tapped.
  useEffect(() => {
    (async () => {
      if (!user?.id || alertCreationStartedRef.current) return;
      if (!location && !locationWaitExpired) return; // wait a little for the location, no more
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
          // Normal alert; if it is individual, the message names the target contact.
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
          // Individual alert: the backend only notifies this contact
          contactIds: targetContact ? [Number(targetContact.id)] : undefined,
        }, {
          onAttempt: ({ attempt, total }) => screenMountedRef.current && setDelivery({ status: "enviando", attempt, total }),
        });
        createdAlertIdRef.current = alert.id;
        setAlertId(alert.id);
        setAlertStart(alert.startedAt ? toDate(alert.startedAt) : new Date());
        if (screenMountedRef.current) setDelivery((e) => ({ ...e, status: "enviada" }));
        // The first route point goes out right away: the contact sees where she is from the first moment
        // (before it waited for the next GPS reading and showed "no locations")
        if (lastLocationRef.current) {
          reportLocation({ ...lastLocationRef.current, alertaId: alert.id });
        }
      } catch (err) {
        console.error("No se pudo crear la alerta en el backend:", err);
        // She can try again from the screen
        alertCreationStartedRef.current = false;
        if (screenMountedRef.current) {
          setAlertError("No se pudo registrar la alerta en el servidor");
          setDelivery((e) => ({ ...e, status: "fallida" }));
        }
      }
    })();
    // manualRetries: tapping "Retry" runs the creation again
  }, [user?.id, location, locationWaitExpired, targetContact, method, manualRetries]);

  const retrySend = useCallback(() => {
    if (createdAlertIdRef.current || alertCreationStartedRef.current) return;
    setManualRetries((n) => n + 1);
  }, []);

  // Updates the location in cycles to save battery: every 30 s (10 times) and then
  // 1 min of rest, when the GPS is not queried. Then the cycle repeats.
  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let done = 0;

    (async () => {
      if (!(await locationPermission()) || !mounted) return;

      // The last known location is immediate: the map appears without waiting for the GPS
      const latest = await Location.getLastKnownPositionAsync({ maxAge: MAX_LAST_KNOWN_AGE_MS }).catch(() => null);
      if (latest && mounted) {
        const coords = { latitude: latest.coords.latitude, longitude: latest.coords.longitude };
        lastLocationRef.current = { ...coords, accuracy: latest.coords.accuracy };
        setLocation((current) => current ?? coords);
      }

      const update = async () => {
        if (endedRef.current) return; // the alert ended on the server: nothing more is sent
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
          // During the alert each point is sent to the backend linked to the alert
          reportLocation({ ...coords, accuracy: current.coords.accuracy, alertaId: createdAlertIdRef.current });

          // Each location obtained is also recorded as a route point.
          counterDot.current += 1;
          const id = `activa-${counterDot.current}`;
          setPoints((prev) => [...prev, { id, ...coords, recordedAt: new Date() }]);
        } catch {
          // Silent: if it fails, the header shows the fallback icon or the last location.
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

  // Looks up the neighborhood/place only for new points, one by one starting with the most
  // recent. Waits 1.1 s between queries to respect the service limit.
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

  // Clock for the map label "X ago". Every 10 s and not every second: a tick per second
  // redrew the whole screen (map, camera and chat) and made the phone slow.
  // The countdown has its own clock in <Countdown>.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, []);

  // Moment the alert expires on the server
  const alertEndMs = alertStart ? alertStart.getTime() + maxDurationMin * 60000 : null;
  const alertEnd = useMemo(() => (alertEndMs === null ? null : new Date(alertEndMs)), [alertEndMs]);

  // Still active? Checked every 30 s and when the counter reaches 0. If the server closed it
  // (expired, marked attended or cancelled elsewhere) the location stops being sent
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
      // Offline: checked on the next round
    }
  }, [maxDurationMin]);

  useEffect(() => {
    if (!alertId) return;
    const t = setInterval(checkStatus, STATUS_CHECK_MS);
    return () => clearInterval(t);
  }, [alertId, checkStatus]);

  // Who opened the tracking: knowing her contacts are watching gives her peace of mind
  const [views, setViews] = useState({ total: 0, watchingNow: 0 });
  useEffect(() => {
    if (!alertId) return;
    const leer = () => getViews(alertId).then(setViews).catch(() => {});
    leer();
    const t = setInterval(leer, 15000);
    return () => clearInterval(t);
  }, [alertId]);

  // When it reaches zero the server is asked whether the alert already ended
  useEffect(() => {
    if (alertId === null || alertEndMs === null) return;
    const t = setTimeout(checkStatus, Math.max(0, alertEndMs - Date.now()) + 1000);
    return () => clearTimeout(t);
  }, [alertId, alertEndMs, checkStatus]);

  // Data derived from the last point (the same "Emergency alert" shows).
  const lastItem = points.length > 0 ? points[points.length - 1] : null;
  const timeSinceLast = lastItem
    ? formatDuration((now - lastItem.recordedAt.getTime()) / 1000)
    : "";
  const lastNeighborhood = lastItem ? (barrios[lastItem.id] ?? null) : null;
  const lastCoords = lastItem
    ? `${lastItem.latitude.toFixed(4)}, ${lastItem.longitude.toFixed(4)}`
    : "";

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

  // Small map: refit when a new point arrives.
  useEffect(() => {
    if (mapReady) fitTo(mapRef, MAP_PADDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, points.length]);

  // Full-screen map: the same, while it is open.
  useEffect(() => {
    if (fullscreen && fullMapReady) fitTo(fullMapRef, FULL_MAP_PADDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen, fullMapReady, points.length]);

  const onMapReady = useCallback(() => setMapReady(true), []);
  const onFullMapReady = useCallback(() => setFullMapReady(true), []);

  const showAllPoints = useCallback(() => {
    fitTo(fullMapRef, FULL_MAP_PADDING);
  }, [fitTo]);

  // Tapping "I'm fine" only opens the confirmation dialog.
  const openConfirmation = useCallback(() => {
    setConfirmVisible(true);
  }, []);

  // Closes the confirmation dialog without cancelling the alert.
  const closeConfirmation = useCallback(() => {
    setConfirmVisible(false);
  }, []);

  // Runs when the user confirms "Yes, cancel".
  const markImOk = useCallback(() => {
    setConfirmVisible(false);
    // Close the active alert in the backend (cancelled status)
    if (createdAlertIdRef.current) {
      endAlert(createdAlertIdRef.current, "cancelled").catch((err) =>
        console.error("No se pudo cerrar la alerta en el backend:", err),
      );
    }
    setCanLeave(true);
  }, []);

  // Opens the dialer with the emergency number set by the administration (123 in Colombia)
  const callEmergency = useCallback(() => {
    const url = Platform.OS === "android" ? `tel:${emergencyNumber}` : `telprompt:${emergencyNumber}`;
    Linking.openURL(url).catch(() => {
      // Silently ignore it if the device cannot make calls.
    });
  }, [emergencyNumber]);

  // When the alert already ended on the server: leave or activate another
  const activateAnotherAlert = useCallback(() => {
    setEnd(null);
    newAlertRef.current = true;
    setCanLeave(true);
  }, []);
  const leaveAfterEnd = useCallback(() => {
    setEnd(null);
    setCanLeave(true);
  }, []);

  // Opens the full-screen map (equivalent to the "navigate" button of the Map module),
  // but without leaving ActiveAlert: it is a local Modal, not a navigation.
  const openFullMap = useCallback(() => {
    if (location) setFullscreen(true);
  }, [location]);

  // Tapping the full-screen map shows the "close map" button for 15 s (same as in Map).
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

  // Closes the full-screen map and stays on ActiveAlert (does not navigate anywhere).
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
    // Map with the same design and data as "Emergency alert"
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