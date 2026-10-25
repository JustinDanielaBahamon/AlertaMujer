import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  type Notification,
} from "@notifee/react-native";
import { bigStyle } from "./notificationStyle";
import { confirmAlertReceived } from "../services/alert-tracking.service";
import { addToInbox } from "./inbox";

/**
 * Alarm an emergency contact receives when a user activates an alert. It arrives as a
 * data-only, high-priority FCM message; here it becomes an incoming-call-like
 * notification: full screen over the lock screen, looping alarm sound and vibration.
 */

export const SOS_CHANNEL = "alertas_sos";
const SOUND = "alarma_sos"; // res/raw/alarma_sos.wav (plugins/withAlarmSound.js)

/** Push data sent by the backend (AlertNotificationService). */
export type SosAlertData = {
  tipo: "ALERTA_SOS";
  alertaId: string;
  nombre: string;
  codigo: string; // public tracking code
  envioId?: string; // this delivery (to mark it received and seen in the user's history)
  aviso?: string; // what changed while it goes on (she does not answer, lost signal, duress)
};

export function isSosAlert(data: Record<string, unknown> | undefined): data is SosAlertData {
  return !!data && data.tipo === "ALERTA_SOS" && typeof data.alertaId === "string" && typeof data.codigo === "string";
}

/** Push that arrives when the alert ends (attended, cancelled or expired). */
export type EndedAlertData = {
  tipo: "ALERTA_FINALIZADA";
  alertaId: string;
  nombre: string;
  estado: string;
};

export function isEndedAlert(data: Record<string, unknown> | undefined): data is EndedAlertData {
  return !!data && data.tipo === "ALERTA_FINALIZADA" && typeof data.alertaId === "string";
}

const NOTICES_CHANNEL = "avisos_alertas";

/** Turns off that alert's alarm and leaves a silent notice that it ended. */
export async function showEndedAlert(data: EndedAlertData): Promise<void> {
  await stopSosAlarm(data.alertaId);
  await notifee.createChannel({
    id: NOTICES_CHANNEL,
    name: "Avisos de alertas",
    description: "Cuando termina una alerta de un contacto",
    importance: AndroidImportance.DEFAULT,
  });
  const name = data.nombre?.trim() || "tu contacto";
  const what =
    data.estado === "resolved" ? "fue marcada como atendida"
    : data.estado === "cancelled" ? "fue cancelada"
    : "terminó";
  const text = `La alerta de ${name} ${what}. Si aún no sabes de ella, comunícate para confirmar que está bien.`;
  await addToInbox({ id: `alert-${data.alertaId}`, kind: "alert_ended", title: "Alerta terminada", body: text });
  await notifee.displayNotification({
    id: `fin-${data.alertaId}`,
    title: "Alerta terminada",
    body: text,
    android: {
      channelId: NOTICES_CHANNEL,
      ...bigStyle(text),
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
}

export async function createSosChannel(): Promise<void> {
  await notifee.createChannel({
    id: SOS_CHANNEL,
    name: "Alertas de emergencia",
    description: "Alarma cuando una persona que te registró como contacto activa una alerta",
    importance: AndroidImportance.HIGH,
    sound: SOUND,
    vibration: true,
    vibrationPattern: [400, 600, 400, 600],
    bypassDnd: true,
    visibility: AndroidVisibility.PUBLIC,
  });
}

export async function showSosAlarm(data: SosAlertData): Promise<void> {
  // The user sees in her history that the notice reached this phone
  void confirmAlertReceived(data.codigo, data.envioId);
  await createSosChannel();
  const name = data.nombre?.trim() || "Una persona";
  const text = data.aviso?.trim()
    ? data.aviso.trim()
    : `${name} activó una alerta y puede estar en peligro. Toca para ver su ubicación en tiempo real y escribirle.`;
  await addToInbox({
    id: `alert-${data.alertaId}`,
    kind: data.aviso?.trim() ? "warning" : "alert",
    title: `${name} necesita ayuda`,
    body: text,
    target: { screen: "ContactAlert", alertId: Number(data.alertaId), userName: data.nombre, code: data.codigo, delivery: data.envioId },
  });
  await notifee.displayNotification({
    id: notificationId(data.alertaId),
    title: `🚨 ${name} necesita ayuda`,
    body: text,
    data: data,
    android: {
      channelId: SOS_CHANNEL,
      ...bigStyle(text),
      category: AndroidCategory.ALARM,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: SOUND,
      loopSound: true,
      ongoing: true,
      autoCancel: false,
      timeoutAfter: 10 * 60 * 1000, // the alarm stops by itself after 10 minutes
      // Full screen over the lock screen (Android 14 requires the full-screen permission)
      fullScreenAction: { id: "default" },
      pressAction: { id: "default", launchActivity: "default" },
      actions: [{ title: "Ver ubicación", pressAction: { id: "atender", launchActivity: "default" } }],
    },
  });
}

/** Stops the alarm (when the alert screen opens). */
export async function stopSosAlarm(alertId: string | number): Promise<void> {
  await notifee.cancelNotification(notificationId(String(alertId)));
}

export function notificationData(n: Notification | undefined): SosAlertData | null {
  const data = n?.data as Record<string, unknown> | undefined;
  return isSosAlert(data) ? data : null;
}

const notificationId = (alertId: string) => `sos-${alertId}`;

// Alert waiting to be opened: it arrives before navigation is ready (app just opened
// from the notification) or while there is no session.
let pending: SosAlertData | null = null;
const listeners = new Set<(d: SosAlertData) => void>();

export function openSosAlert(data: SosAlertData): void {
  if (listeners.size === 0) {
    pending = data;
    return;
  }
  listeners.forEach((o) => o(data));
}

/** Navigation subscribes here; if there was a pending alert, it is delivered right away. */
export function onSosAlertOpen(listener: (d: SosAlertData) => void): () => void {
  listeners.add(listener);
  if (pending) {
    const d = pending;
    pending = null;
    listener(d);
  }
  return () => {
    listeners.delete(listener);
  };
}
