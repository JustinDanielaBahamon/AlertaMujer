import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Location from "expo-location";
import { useAuth } from "../contexts/AuthContext";
import { limpiarColaUbicaciones, reportarUbicacion } from "../services/location-reporter.service";

// Mientras la app está abierta y con sesión, envía la ubicación al backend:
// cuando la usuaria se mueve más de METROS_MINIMOS o, si está quieta, cada INTERVALO_MAX_MS.
// No pide permisos por su cuenta: solo funciona si la usuaria ya dio acceso a la ubicación.
const METROS_MINIMOS = 50;
const INTERVALO_MAX_MS = 5 * 60 * 1000;

const distanciaMetros = (a: Location.LocationObjectCoords, b: Location.LocationObjectCoords) => {
  const R = 6371000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export function useReporteUbicacion() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      limpiarColaUbicaciones().catch(() => {});
      return;
    }

    let suscripcion: Location.LocationSubscription | null = null;
    let latido: ReturnType<typeof setInterval> | null = null;
    let ultimoEnviado: { coords: Location.LocationObjectCoords; hora: number } | null = null;
    let activo = true;

    const quizasEnviar = (loc: Location.LocationObject, forzar = false) => {
      const ahora = Date.now();
      const lejos = !ultimoEnviado || distanciaMetros(ultimoEnviado.coords, loc.coords) >= METROS_MINIMOS;
      const viejo = !ultimoEnviado || ahora - ultimoEnviado.hora >= INTERVALO_MAX_MS;
      if (!forzar && !lejos && !viejo) return;
      ultimoEnviado = { coords: loc.coords, hora: ahora };
      reportarUbicacion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      });
    };

    const iniciar = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted" || !activo || suscripcion) return;

      // Punto inicial al abrir la app
      try {
        quizasEnviar(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), true);
      } catch {
        // GPS apagado: se reintenta con el latido
      }
      if (!activo) return;

      suscripcion = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 60000, distanceInterval: METROS_MINIMOS },
        (loc) => quizasEnviar(loc)
      );
      // Si está quieta, watchPosition no avisa: el latido asegura un punto cada 5 min
      latido = setInterval(async () => {
        try {
          quizasEnviar(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        } catch {
          // sin GPS en este momento
        }
      }, INTERVALO_MAX_MS);
    };

    const detener = () => {
      suscripcion?.remove();
      suscripcion = null;
      if (latido) clearInterval(latido);
      latido = null;
    };

    const alCambiarEstado = (estado: AppStateStatus) => {
      if (estado === "active") iniciar();
      else detener();
    };

    if (AppState.currentState === "active") iniciar();
    const sub = AppState.addEventListener("change", alCambiarEstado);

    return () => {
      activo = false;
      sub.remove();
      detener();
    };
  }, [token]);
}
