import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Location from "expo-location";
import { locationWithoutNotices } from "../services/safePermissions";
import { useAuth } from "../contexts/AuthContext";
import { clearLocationQueue, reportLocation } from "../services/location-reporter.service";

// While the app is open with a session, it sends the location to the backend:
// when the user moves more than MIN_METERS or, if she is still, every MAX_INTERVAL_MS.
// It does not ask for permissions on its own: it only works if the user already gave location access.
const MIN_METERS = 50;
const MAX_INTERVAL_MS = 5 * 60 * 1000;

const distanceMeters = (a: Location.LocationObjectCoords, b: Location.LocationObjectCoords) => {
  const R = 6371000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export function useLocationReporting() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      clearLocationQueue().catch(() => {});
      return;
    }

    let subscription: Location.LocationSubscription | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let lastSent: { coords: Location.LocationObjectCoords; time: number } | null = null;
    let enabled = true;

    const maybeSend = (loc: Location.LocationObject, force = false) => {
      const now = Date.now();
      const far = !lastSent || distanceMeters(lastSent.coords, loc.coords) >= MIN_METERS;
      const old = !lastSent || now - lastSent.time >= MAX_INTERVAL_MS;
      if (!force && !far && !old) return;
      lastSent = { coords: loc.coords, time: now };
      reportLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      });
    };

    const start = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted" || !enabled || subscription) return;

      // With the GPS off nothing is done: Android would show its "turn on location" prompt
      // when the app opens. Retried when coming back to the app or with the heartbeat.
      if (!(await Location.hasServicesEnabledAsync().catch(() => false)) || !enabled) return;

      // Starting point when the app opens
      try {
        const initial = await locationWithoutNotices();
        if (initial) maybeSend(initial, true);
      } catch {
        // no signal: retried with the heartbeat
      }
      if (!enabled) return;

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 60000, distanceInterval: MIN_METERS, mayShowUserSettingsDialog: false },
        (loc) => maybeSend(loc)
      );
      // If she is still, watchPosition does not report: the heartbeat ensures a point every 5 min
      heartbeat = setInterval(async () => {
        try {
          const current = await locationWithoutNotices();
          if (current) maybeSend(current);
        } catch {
          // no GPS right now
        }
      }, MAX_INTERVAL_MS);
    };

    const stop = () => {
      subscription?.remove();
      subscription = null;
      if (heartbeat) clearInterval(heartbeat);
      heartbeat = null;
    };

    const onStatusChange = (status: AppStateStatus) => {
      if (status === "active") start();
      else stop();
    };

    if (AppState.currentState === "active") start();
    const sub = AppState.addEventListener("change", onStatusChange);

    return () => {
      enabled = false;
      sub.remove();
      stop();
    };
  }, [token]);
}
