import * as Location from "expo-location";
import { reportLocation } from "./location-reporter.service";

/**
 * The website asked to "Update the phone location": the backend sends a silent push
 * (PEDIR_UBICACION type) and the app responds by sending the current location.
 * With the app closed Android only delivers it if the user allowed location "all the time"
 * or if shake protection is on; otherwise the website keeps showing the last point.
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
    // GPS off or no background permission: there is nothing to send
  }
}
