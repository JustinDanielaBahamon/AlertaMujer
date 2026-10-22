import * as Location from "expo-location";
import { reportLocation } from "./location-reporter.service";

/**
 * La web pidió "Actualizar ubicación del celular": el backend manda un push silencioso
 * (tipo PEDIR_UBICACION) y la app responde enviando la ubicación actual.
 * Con la app cerrada Android solo la entrega si la usuaria permitió la ubicación "todo el tiempo"
 * o si la protección por sacudida está activa; si no, la web sigue mostrando el último punto.
 */
export function isLocationRequest(data: Record<string, unknown> | undefined): boolean {
  return !!data && data.tipo === "PEDIR_UBICACION";
}

export async function answerLocationRequest(): Promise<void> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") return;
    const u = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    await reportLocation({
      latitude: u.coords.latitude,
      longitude: u.coords.longitude,
      accuracy: u.coords.accuracy,
    });
  } catch {
    // GPS apagado o sin permiso en segundo plano: no hay nada que enviar
  }
}
