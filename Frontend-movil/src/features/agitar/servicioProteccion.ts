import notifee, {
  AndroidCategory,
  AndroidForegroundServiceType,
  AndroidImportance,
  AndroidVisibility,
  EventType,
  type Event,
} from "@notifee/react-native";
import { AppState, Vibration } from "react-native";
import { bigStyle } from "../../notifications/estiloNotificacion";
import ShakeSensor from "../../../modules/shake-sensor";
import { createShakeDetector } from "./detectorSacudidas";
import { createPowerButtonDetector } from "./detectorBotonEncendido";
import { backgroundAlert, createShakeAlert } from "./alertaEnSegundoPlano";
import { notificationsPermission, locationPermission } from "../../services/permisosSeguros";

/**
 * "Agitar el teléfono": un servicio en primer plano de Android (notificación fija "Protección
 * activa") escucha el acelerómetro aunque la app esté minimizada o la pantalla bloqueada.
 *
 * - App en pantalla: se abre la cuenta regresiva de la app, igual que con el botón SOS.
 * - App en segundo plano: cuenta regresiva de 5 s en una notificación con "Cancelar"; si no se
 *   cancela, la alerta se crea sin desbloquear el teléfono.
 *
 * El acelerómetro es el del módulo nativo sensor-sacudidas: expo-sensors deja de leer en cuanto la
 * app sale de la pantalla. Por lo mismo las esperas son nativas y no setTimeout.
 *
 * El mismo servicio atiende el botón de encendido (4 pulsaciones rápidas, también con la pantalla
 * apagada) si la usuaria activó ese método.
 */

/** Método con el que se pidió la alerta. */
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
// Cada 40 ms: con menos lecturas un hachazo se confunde con varios picos sueltos
const SENSOR_INTERVAL_MS = 40;

export type ProtectionStatus = "activa" | "sin_ubicacion" | "sin_sensor";

let active = false;
let stopSensor: (() => void) | null = null;
let stopButton: (() => void) | null = null;
let options: ProtectionOptions = { shake: true, powerButton: false };
let finishTask: (() => void) | null = null;
let countdownRunning: { cancelled: boolean } | null = null;

// --- Sacudida con la app en pantalla: la navegación se suscribe y abre la cuenta regresiva ---
const onScreenListeners = new Set<(method: ProtectionMethod) => void>();

export function onShakeOnScreen(listener: (method: ProtectionMethod) => void): () => void {
  onScreenListeners.add(listener);
  return () => {
    onScreenListeners.delete(listener);
  };
}

// --- Alerta creada en segundo plano: al tocar la notificación se abre su pantalla ---
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

/** Se registra una sola vez al arrancar (index.ts), antes de montar la app. */
export function registerProtectionService(): void {
  notifee.registerForegroundService(
    () =>
      new Promise<void>((resolver) => {
        finishTask = resolver;
        setUpDetectors();
      }),
  );
}

/** Enciende solo lo que la usuaria activó: acelerómetro, botón de encendido o ambos. */
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
 * Atiende los toques en las notificaciones de este servicio (Cancelar y "Alerta enviada").
 * Devuelve true si el evento era suyo. Se llama desde los manejadores de Notifee de primer y
 * segundo plano.
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
 * pedirPermisos = true solo cuando la usuaria enciende un método (no al abrir la app). Si ya
 * estaba activa con otros métodos, solo cambia lo que se escucha.
 */
export async function startProtection(
  requestPermissions = false,
  newItems: ProtectionOptions = { shake: true, powerButton: false },
): Promise<ProtectionStatus> {
  if (newItems.shake && !ShakeSensor.available()) return "sin_sensor";
  // El servicio es de tipo ubicación (para poder enviarla con la pantalla bloqueada) y Android
  // exige el permiso antes de iniciarlo
  if (!(await locationPermission(requestPermissions))) return "sin_ubicacion";
  const changed = options.shake !== newItems.shake || options.powerButton !== newItems.powerButton;
  options = newItems;
  if (active && !changed) return "activa";
  if (active) setUpDetectors();

  await notificationsPermission(requestPermissions);
  await createChannels();
  // Mostrar la notificación del servicio otra vez la actualiza (y la primera vez lo arranca)
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
