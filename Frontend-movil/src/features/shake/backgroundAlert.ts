import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import * as Location from "expo-location";
import { createAlertWithRetries, getAlert } from "../../services/alerts.service";
import { getOrCreateDevice } from "../../services/devices.service";
import { reportLocation } from "../../services/location-reporter.service";
import { locationIntervalMs } from "../activeAlert/checkIn";
import { AUDIO_SECONDS, FIRST_AUDIO_SECONDS } from "../recording/recordingPlan";
import { setAudioAlert } from "../recording/uploadQueue";
import ShakeSensor from "../../../modules/shake-sensor";

/**
 * Alert activated by shaking the phone without the app on screen: it is created directly in the
 * backend (which notifies the contacts) and the location keeps being sent every 30 s until the
 * user opens the app and the active alert screen takes over. The waits are native: JS
 * setTimeout can stand still with the screen off.
 */

// Must match the AuthContext key (not imported so React is not loaded in the service)
const SESSION_KEY = "@alerta_mujer:auth";
const MAX_MS = 3 * 60 * 60 * 1000; // the backend closes the alert at 2 h; this only avoids an endless loop
// The server status (ended, unanswered) is checked once a minute, not on every location
const STATUS_CHECK_MS = 60 * 1000;
const MAX_LAST_KNOWN_AGE_MS = 15 * 60 * 1000;

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
  // Audio from the first seconds, also with the screen off (under the protection service)
  startAlertAudio(alert.id);
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

/** Starts the alert's audio; from the background it runs under the protection service. */
function startAlertAudio(alertId: number) {
  try {
    setAudioAlert(alertId);
    ShakeSensor.startAudioRecording(AUDIO_SECONDS, true, FIRST_AUDIO_SECONDS, AppState.currentState !== "active");
  } catch {
    // Old build or no microphone permission: the location goes on anyway
  }
}

/**
 * Location every 15 s the first 5 minutes, then every 30 s and every 60 s in saving mode. Without a
 * GPS fix the last known position is sent: otherwise the server would tell her contacts that her
 * phone stopped sending its location.
 */
async function followLocation(alertId: number, startMs: number) {
  let saving = false;
  // Time waited since the last status check (the waits are native, so they are counted, not read
  // from the clock); the first round checks it right away
  let sinceCheck = STATUS_CHECK_MS;
  let waited = 0;
  while (alertInProgress === alertId && waited <= MAX_MS) {
    const interval = locationIntervalMs(startMs, Date.now(), saving);
    await ShakeSensor.wait(interval);
    waited += interval;
    sinceCheck += interval;
    if (alertInProgress !== alertId) return;
    if (sinceCheck >= STATUS_CHECK_MS) {
      sinceCheck = 0;
      // If it already ended (a contact or the administration closed it, or the 2 h passed), it is
      // released: otherwise the service would keep ignoring the next shakes
      const status = await alertStatus(alertId);
      if (status === "ended") break;
      saving = status === "saving";
    }
    const u =
      (await currentLocation()) ??
      (await Location.getLastKnownPositionAsync({ maxAge: MAX_LAST_KNOWN_AGE_MS }).catch(() => null));
    if (u && alertInProgress === alertId) {
      reportLocation({
        latitude: u.coords.latitude,
        longitude: u.coords.longitude,
        accuracy: u.coords.accuracy,
        alertaId: alertId,
      }).catch(() => {});
    }
  }
  if (alertInProgress === alertId) {
    alertInProgress = null;
    try {
      ShakeSensor.stopAudioRecording();
    } catch {
      // nothing was recording
    }
  }
}

/** Offline we cannot know: assume it is still active so the location keeps being sent. */
async function alertStatus(alertId: number): Promise<"active" | "saving" | "ended"> {
  try {
    const a = await getAlert(alertId);
    if (a.status !== "active") return "ended";
    return a.unansweredAt ? "saving" : "active";
  } catch {
    return "active";
  }
}

/**
 * Duress PIN: the alert screen closes as if it were cancelled, but the location and the audio go on
 * from here until the alert really ends (her contacts were warned, or the 2 h limit).
 */
export async function continueSilently(alertId: number, startMs: number): Promise<void> {
  alertInProgress = alertId;
  // The alert screen stops its recording when it closes: the audio starts again right after
  await ShakeSensor.wait(1500);
  if (alertInProgress !== alertId) return;
  startAlertAudio(alertId);
  void followLocation(alertId, startMs);
}

/** The active alert screen takes over from now on (or the alert ended): stop sending the location. */
export function takeOverAlert(): void {
  alertInProgress = null;
}

export function backgroundAlert(): number | null {
  return alertInProgress;
}
