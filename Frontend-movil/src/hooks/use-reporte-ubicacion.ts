import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Location from "expo-location";
import { locationWithoutNotices } from "../services/permisosSeguros";
import { useAuth } from "../contexts/AuthContext";
import { clearLocationQueue, reportLocation } from "../services/location-reporter.service";

// Mientras la app está abierta y con sesión, envía la ubicación al backend:
// cuando la usuaria se mueve más de METROS_MINIMOS o, si está quieta, cada INTERVALO_MAX_MS.
// No pide permisos por su cuenta: solo funciona si la usuaria ya dio acceso a la ubicación.
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

      // Con el GPS apagado no se hace nada: Android mostraría su aviso de "activa la ubicación"
      // al abrir la app. Se reintenta al volver a la app o con el latido.
      if (!(await Location.hasServicesEnabledAsync().catch(() => false)) || !enabled) return;

      // Punto inicial al abrir la app
      try {
        const initial = await locationWithoutNotices();
        if (initial) maybeSend(initial, true);
      } catch {
        // sin señal: se reintenta con el latido
      }
      if (!enabled) return;

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 60000, distanceInterval: MIN_METERS, mayShowUserSettingsDialog: false },
        (loc) => maybeSend(loc)
      );
      // Si está quieta, watchPosition no avisa: el latido asegura un punto cada 5 min
      heartbeat = setInterval(async () => {
        try {
          const current = await locationWithoutNotices();
          if (current) maybeSend(current);
        } catch {
          // sin GPS en este momento
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
