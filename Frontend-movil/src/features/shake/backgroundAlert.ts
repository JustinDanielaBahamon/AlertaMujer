import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { createAlertWithRetries, getAlert } from "../../services/alerts.service";
import { getOrCreateDevice } from "../../services/devices.service";
import { reportLocation } from "../../services/location-reporter.service";
import ShakeSensor from "../../../modules/shake-sensor";

/**
 * Alert activated by shaking the phone without the app on screen: it is created directly in the
 * backend (which notifies the contacts) and the location keeps being sent every 30 s until the
 * user opens the app and the active alert screen takes over. The waits are native: JS
 * setTimeout can stand still with the screen off.
 */

// Must match the AuthContext key (not imported so React is not loaded in the service)
const SESSION_KEY = "@alerta_mujer:auth";
const INTERVAL_MS = 30 * 1000;
const MAX_MS = 3 * 60 * 60 * 1000; // the backend expires the alert earlier; this only avoids an endless loop

let alertInProgress: number | null = null;

async function currentLocation(): Promise<Location.LocationObject | null> {
  try {
    return await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      ShakeSensor.wait(10000).then(() => null),
    ]);
  } catch {
    return null;
  }
}

// Precise fix requested when the countdown starts, so the GPS works during those 5 seconds
let pendingFix: Promise<Location.LocationObject | null> | null = null;

/** Starts looking for the GPS position while the countdown runs (called when it starts). */
export function prepareAlertLocation(): void {
  pendingFix ??= currentLocation();
}

// A known position this recent is good enough to send the alert right away
const RECENT_FIX_MS = 2 * 60 * 1000;
// Without any known position the alert waits this long for the GPS, at most
const MAX_FIX_WAIT_MS = 2000;

/**
 * The location the alert is created with, without making her wait: the GPS fix if it already arrived,
 * otherwise the last known position; only with no position at all it waits a moment for the GPS.
 */
async function locationForAlert(fix: Promise<Location.LocationObject | null>): Promise<Location.LocationObject | null> {
  const ready = await Promise.race([fix, Promise.resolve(undefined)]);
  if (ready) return ready;
  const last = await Location.getLastKnownPositionAsync({ maxAge: RECENT_FIX_MS }).catch(() => null);
  if (last) return last;
  return Promise.race([fix, ShakeSensor.wait(MAX_FIX_WAIT_MS).then(() => null)]);
}

const METHODS = {
  agitar: { activationMethod: "suspicious_movement", message: "Alerta SOS activada al agitar el teléfono" },
  encendido: { activationMethod: "power_button", message: "Alerta SOS activada con el botón de encendido" },
} as const;

export async function createShakeAlert(method: keyof typeof METHODS = "agitar"): Promise<number> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  const user = raw ? JSON.parse(raw).user : null;
  if (!user) throw new Error("No hay sesión iniciada");

  const fix = pendingFix ?? currentLocation();
  pendingFix = null;
  const [device, location] = await Promise.all([getOrCreateDevice(), locationForAlert(fix)]);
  // With retries: if the network fails or the server is waking up, the alert is not lost
  const alert = await createAlertWithRetries({
    userProfileId: user.id,
    deviceId: device.id,
    alertType: "main",
    activationMethod: METHODS[method].activationMethod,
    status: "active",
    message: METHODS[method].message,
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude,
  });

  alertInProgress = alert.id;
  // The precise GPS position goes to the alert as soon as it arrives (it was created with a quicker one)
  fix.then((precise) => {
    if (!precise || precise === location) return;
    reportLocation({
      latitude: precise.coords.latitude,
      longitude: precise.coords.longitude,
      accuracy: precise.coords.accuracy,
      alertaId: alert.id,
    }).catch(() => {});
  });
  followLocation(alert.id, Date.now());
  return alert.id;
}

async function followLocation(alertId: number, startTime: number) {
  while (alertInProgress === alertId && Date.now() - startTime <= MAX_MS) {
    await ShakeSensor.wait(INTERVAL_MS);
    if (alertInProgress !== alertId) return;
    // If the alert already ended (a contact or the administration closed it, or it expired), it is released: otherwise
    // the service would keep treating it as "in progress" and ignore the next shakes
    if (!(await stillActive(alertId))) break;
    const u = await currentLocation();
    if (u && alertInProgress === alertId) {
      reportLocation({
        latitude: u.coords.latitude,
        longitude: u.coords.longitude,
        accuracy: u.coords.accuracy,
        alertaId: alertId,
      }).catch(() => {});
    }
  }
  if (alertInProgress === alertId) alertInProgress = null;
}

/** Offline we cannot know: assume it is still active so the location keeps being sent. */
async function stillActive(alertId: number): Promise<boolean> {
  try {
    return (await getAlert(alertId)).status === "active";
  } catch {
    return true;
  }
}

/** The active alert screen takes over from now on (or the alert ended): stop sending the location. */
export function takeOverAlert(): void {
  alertInProgress = null;
}

export function backgroundAlert(): number | null {
  return alertInProgress;
}
