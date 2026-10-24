import notifee, {
  AndroidCategory,
  AndroidForegroundServiceType,
  AndroidImportance,
  AndroidVisibility,
  EventType,
  type Event,
} from "@notifee/react-native";
import { AppState, Vibration } from "react-native";
import { bigStyle } from "../../notifications/notificationStyle";
import ShakeSensor from "../../../modules/shake-sensor";
import { createShakeDetector } from "./shakeDetector";
import { createPowerButtonDetector } from "./powerButtonDetector";
import { backgroundAlert, createShakeAlert, prepareAlertLocation } from "./backgroundAlert";
import { notificationsPermission, locationPermission } from "../../services/safePermissions";

/**
 * "Shake the phone": an Android foreground service (persistent "Active protection"
 * notification) listens to the accelerometer even with the app minimized or the screen locked.
 *
 * - App on screen: the app countdown opens, same as with the SOS button.
 * - App in the background: 5 s countdown in a notification with "Cancel"; if it is not
 *   cancelled, the alert is created without unlocking the phone.
 *
 * The accelerometer is the one of the native shake-sensor module: expo-sensors stops reading as soon as the
 * app leaves the screen. For the same reason the waits are native and not setTimeout.
 *
 * The same service handles the power button (4 quick presses, also with the screen
 * off) if the user enabled that method.
 */

/** Method the alert was requested with. */
export type ProtectionMethod = "agitar" | "encendido";
export type ProtectionOptions = { shake: boolean; powerButton: boolean };

const PROTECTION_CHANNEL = "proteccion_activa";
const NOTICE_CHANNEL = "agitar_aviso";
const SERVICE_ID = "proteccion-agitar";
const ACCOUNT_ID = "agitar-cuenta";
const SENT_ID = "agitar-enviada";
const ACTION_CANCEL = "cancelar_agitar";
const ACTION_OPEN = "abrir_alerta_agitar";
const COUNTDOWN_SECONDS = 5;
// Every 40 ms: with fewer readings a chop is confused with several loose peaks
const SENSOR_INTERVAL_MS = 40;

export type ProtectionStatus = "activa" | "sin_ubicacion" | "sin_sensor";

let active = false;
let stopSensor: (() => void) | null = null;
let stopButton: (() => void) | null = null;
let options: ProtectionOptions = { shake: true, powerButton: false };
let finishTask: (() => void) | null = null;
let countdownRunning: { cancelled: boolean } | null = null;

// --- Shake with the app on screen: navigation subscribes and opens the countdown ---
const onScreenListeners = new Set<(method: ProtectionMethod) => void>();

export function onShakeOnScreen(listener: (method: ProtectionMethod) => void): () => void {
  onScreenListeners.add(listener);
  return () => {
    onScreenListeners.delete(listener);
  };
}

// --- Alert created in the background: tapping the notification opens its screen ---
let alertToOpen: number | null = null;
const openListeners = new Set<(alertId: number) => void>();

export function onShakeAlertOpen(listener: (alertId: number) => void): () => void {
  openListeners.add(listener);
  if (alertToOpen !== null) {
    const id = alertToOpen;
    alertToOpen = null;
    listener(id);
  }
  return () => {
    openListeners.delete(listener);
  };
}

function openAlert(alertId: number) {
  if (openListeners.size === 0) {
    alertToOpen = alertId;
    return;
  }
  openListeners.forEach((o) => o(alertId));
}

/** Registered only once at startup (index.ts), before mounting the app. */
export function registerProtectionService(): void {
  notifee.registerForegroundService(
    () =>
      new Promise<void>((resolver) => {
        finishTask = resolver;
        setUpDetectors();
      }),
  );
}

/** Turns on only what the user enabled: accelerometer, power button or both. */
function setUpDetectors() {
  stopSensor?.();
  stopSensor = null;
  stopButton?.();
  stopButton = null;
  if (options.shake) listenSensor();
  if (options.powerButton) listenPowerButton();
}

function listenPowerButton() {
  const detect = createPowerButtonDetector();
  const sub = ShakeSensor.addListener("onScreenChange", () => {
    if (detect(Date.now())) onActivate("encendido");
  });
  ShakeSensor.startPowerButton();
  stopButton = () => {
    ShakeSensor.stopPowerButton();
    sub.remove();
  };
}

function listenSensor() {
  const detect = createShakeDetector();
  const sub = ShakeSensor.addListener("onReading", ({ x, y, z }) => {
    if (detect(x, y, z, Date.now())) onActivate("agitar");
  });
  ShakeSensor.start(SENSOR_INTERVAL_MS);
  stopSensor = () => {
    ShakeSensor.stop();
    sub.remove();
  };
}

function onActivate(method: ProtectionMethod) {
  if (countdownRunning || backgroundAlert() !== null) return;
  if (AppState.currentState === "active" && onScreenListeners.size > 0) {
    onScreenListeners.forEach((o) => o(method));
    return;
  }
  startCountdown(method);
}

const REASON: Record<ProtectionMethod, string> = {
  agitar: "Agitaste el teléfono",
  encendido: "Presionaste 4 veces el botón de encendido",
};

async function createChannels() {
  await notifee.createChannel({
    id: PROTECTION_CHANNEL,
    name: "Protección activa",
    description: "Aviso fijo mientras la activación por sacudida está encendida",
    importance: AndroidImportance.LOW,
  });
  await notifee.createChannel({
    id: NOTICE_CHANNEL,
    name: "Alerta rápida",
    description: "Cuenta regresiva y confirmación al agitar el teléfono o presionar el botón de encendido",
    importance: AndroidImportance.HIGH,
    vibration: true,
    visibility: AndroidVisibility.PUBLIC,
  });
}

async function startCountdown(method: ProtectionMethod) {
  const countdown = { cancelled: false };
  countdownRunning = countdown;
  // The GPS works during the 5 seconds: the alert goes out without waiting for it afterwards
  prepareAlertLocation();
  try {
    for (let s = COUNTDOWN_SECONDS; s > 0; s--) {
      if (countdown.cancelled) return;
      Vibration.vibrate(300);
      await notifee.displayNotification({
        id: ACCOUNT_ID,
        title: `🚨 Se enviará una alerta en ${s} s`,
        body: `${REASON[method]}. Toca Cancelar si fue un error.`,
        android: {
          channelId: NOTICE_CHANNEL,
          ...bigStyle(`${REASON[method]}. Toca Cancelar si fue un error.`),
          category: AndroidCategory.ALARM,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
          onlyAlertOnce: true,
          ongoing: true,
          autoCancel: false,
          actions: [{ title: "Cancelar", pressAction: { id: ACTION_CANCEL } }],
        },
      });
      await ShakeSensor.wait(1000);
    }
    if (countdown.cancelled) return;
    await notifee.cancelNotification(ACCOUNT_ID);

    try {
      const alertId = await createShakeAlert(method);
      Vibration.vibrate([0, 600, 200, 600]);
      await notifee.displayNotification({
        id: SENT_ID,
        title: "🚨 Alerta enviada",
        body: "Tus contactos recibieron tu ubicación. Toca para ver la alerta.",
        data: { alertaId: String(alertId) },
        android: {
          channelId: NOTICE_CHANNEL,
          ...bigStyle("Tus contactos recibieron tu ubicación. Toca para ver la alerta, escribirles y ver lo que se graba."),
          visibility: AndroidVisibility.PUBLIC,
          pressAction: { id: ACTION_OPEN, launchActivity: "default" },
        },
      });
    } catch {
      await notifee.displayNotification({
        id: SENT_ID,
        title: "No se pudo enviar la alerta",
        body: "Abre la app y usa el botón SOS, o llama a la línea de emergencias.",
        android: {
          channelId: NOTICE_CHANNEL,
          ...bigStyle("Abre la app y usa el botón SOS, o llama a la línea de emergencias."),
          pressAction: { id: "default", launchActivity: "default" },
        },
      });
    }
  } finally {
    if (countdownRunning === countdown) countdownRunning = null;
  }
}

/**
 * Handles taps on this service's notifications (Cancel and "Alert sent").
 * Returns true if the event was its own. Called from the Notifee foreground and
 * background handlers.
 */
export function handleProtectionEvent({ type, detail }: Event): boolean {
  if (type !== EventType.ACTION_PRESS && type !== EventType.PRESS) return false;
  const action = detail.pressAction?.id;
  if (action === ACTION_CANCEL) {
    if (countdownRunning) countdownRunning.cancelled = true;
    notifee.cancelNotification(ACCOUNT_ID);
    return true;
  }
  if (action === ACTION_OPEN || detail.notification?.id === SENT_ID) {
    const id = Number(detail.notification?.data?.alertaId);
    if (id) openAlert(id);
    notifee.cancelNotification(SENT_ID);
    return true;
  }
  return false;
}

function protectionText(): string {
  if (options.shake && options.powerButton) {
    return "Agita el teléfono con fuerza o presiona 4 veces el botón de encendido para enviar una alerta a tus contactos.";
  }
  if (options.powerButton) return "Presiona 4 veces rápido el botón de encendido para enviar una alerta a tus contactos.";
  return "Agita el teléfono con fuerza para enviar una alerta a tus contactos.";
}

/**
 * requestPermissions = true only when the user turns on a method (not when the app opens). If it was
 * already running with other methods, only what is listened to changes.
 */
export async function startProtection(
  requestPermissions = false,
  newItems: ProtectionOptions = { shake: true, powerButton: false },
): Promise<ProtectionStatus> {
  if (newItems.shake && !ShakeSensor.available()) return "sin_sensor";
  // The service is a location service (so it can send it with the screen locked) and Android
  // requires the permission before starting it
  if (!(await locationPermission(requestPermissions))) return "sin_ubicacion";
  const changed = options.shake !== newItems.shake || options.powerButton !== newItems.powerButton;
  options = newItems;
  if (active && !changed) return "activa";
  if (active) setUpDetectors();

  await notificationsPermission(requestPermissions);
  await createChannels();
  // Showing the service notification again updates it (and the first time starts it)
  await notifee.displayNotification({
    id: SERVICE_ID,
    title: "Protección activa",
    body: protectionText(),
    android: {
      channelId: PROTECTION_CHANNEL,
      ...bigStyle(protectionText()),
      asForegroundService: true,
      foregroundServiceTypes: [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_LOCATION],
      ongoing: true,
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
  active = true;
  return "activa";
}

export async function stopProtection(): Promise<void> {
  if (!active) return;
  active = false;
  stopSensor?.();
  stopSensor = null;
  stopButton?.();
  stopButton = null;
  if (countdownRunning) countdownRunning.cancelled = true;
  await notifee.cancelNotification(ACCOUNT_ID);
  await notifee.stopForegroundService();
  finishTask?.();
  finishTask = null;
}
