import * as Location from "expo-location";
import { Platform } from "react-native";
import ShakeSensor from "../../../modules/shake-sensor";
import api, { baseUrlFor } from "../../services/api";
import { getOrCreateDevice } from "../../services/devices.service";
import { frequentLocationsService, type FrequentLocationApi } from "../../services/frequent-locations.service";
import { getRiskZones, ownRiskZones, riskZonesJson } from "../../services/riskZones";

/**
 * Automatic protection: when she leaves one of her frequent places the phone starts, by itself, a
 * watch without destination (see AutoProtectionService). Here it is turned on and off, and its places
 * and risk zones are kept up to date.
 */

const PUBLIC_ROUTE = "/api/public/auto-protection";
/** The circle around each place: smaller ones fire with the GPS drift of a phone standing still. */
const PLACE_RADIUS_M = 150;

export type AutoProtectionResult = "ok" | "no_places" | "no_permission" | "unsupported" | "error";

// Builds made before the automatic protection existed do not have these functions
export const autoProtectionSupported = () =>
  Platform.OS === "android" && typeof ShakeSensor?.configureAutoProtection === "function";

/** Her frequent places: every saved place except the ones she marked as unsafe. */
const frequentPlaces = (places: FrequentLocationApi[]) =>
  places.filter((p) => p.isActive !== false && p.riskLevel !== "muy_insegura" && p.latitude != null && p.longitude != null);

async function placesAndZones(userId: number | string) {
  const [saved, official] = await Promise.all([
    frequentLocationsService.getByUser(userId).catch(() => [] as FrequentLocationApi[]),
    getRiskZones(),
  ]);
  const places = frequentPlaces(saved).map((p) => ({
    id: String(p.id),
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
    radius: PLACE_RADIUS_M,
  }));
  return { places, zones: riskZonesJson([...official, ...ownRiskZones(saved)]) };
}

export function autoProtectionState() {
  if (!autoProtectionSupported()) return { enabled: false, permissions: false, running: false };
  return ShakeSensor.autoProtectionStatus();
}

/**
 * "Permitir todo el tiempo": Android 11+ sends her to the app's location settings to choose it.
 * true if she already has it or chose it.
 */
export async function requestBackgroundLocation(): Promise<boolean> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) return false;
  const bg = await Location.getBackgroundPermissionsAsync();
  if (bg.granted) return true;
  return (await Location.requestBackgroundPermissionsAsync()).granted;
}

export async function enableAutoProtection(userId: number | string): Promise<AutoProtectionResult> {
  if (!autoProtectionSupported()) return "unsupported";
  try {
    const { places, zones } = await placesAndZones(userId);
    if (places.length === 0) return "no_places";
    if (!(await requestBackgroundLocation())) return "no_permission";
    const device = await getOrCreateDevice();
    const { data } = await api.post<{ key: string }>("/api/auto-protection/enable", { deviceId: device.id });
    const configured = ShakeSensor.configureAutoProtection({
      baseUrl: baseUrlFor(PUBLIC_ROUTE),
      key: data.key,
      places: JSON.stringify(places),
      riskZones: zones,
    });
    return configured ? "ok" : "no_permission";
  } catch {
    return "error";
  }
}

export async function disableAutoProtection(): Promise<void> {
  if (autoProtectionSupported()) ShakeSensor.disableAutoProtection();
  try {
    const device = await getOrCreateDevice();
    await api.post("/api/auto-protection/disable", { deviceId: device.id });
  } catch {
    // Offline: the phone already stopped; the key stops working when she turns it on again
  }
}

/**
 * When the app opens: her places or the risk zones may have changed, so the geofences are refreshed
 * (with the key the phone already has).
 */
export async function syncAutoProtection(userId: number | string): Promise<void> {
  if (!autoProtectionSupported() || !ShakeSensor.autoProtectionStatus().enabled) return;
  try {
    const { places, zones } = await placesAndZones(userId);
    ShakeSensor.configureAutoProtection({
      baseUrl: baseUrlFor(PUBLIC_ROUTE),
      places: JSON.stringify(places),
      riskZones: zones,
    });
  } catch {
    // Offline: the previous places keep working
  }
}
