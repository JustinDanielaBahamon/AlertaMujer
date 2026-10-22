import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  type Notification,
} from "@notifee/react-native";
import { bigStyle } from "./notificationStyle";

/**
 * Alarma que recibe un contacto de emergencia cuando una usuaria activa una alerta. Llega como
 * mensaje FCM solo de datos y de prioridad alta; aquí se convierte en una notificación tipo
 * llamada entrante: pantalla completa sobre el bloqueo, sonido de alarma en bucle y vibración.
 */

export const SOS_CHANNEL = "alertas_sos";
const SOUND = "alarma_sos"; // res/raw/alarma_sos.wav (plugins/withAlarmSound.js)

/** Datos del push que envía el backend (AlertNotificationService). */
export type SosAlertData = {
  tipo: "ALERTA_SOS";
  alertaId: string;
  nombre: string;
  codigo: string; // código de seguimiento público
};

export function isSosAlert(data: Record<string, unknown> | undefined): data is SosAlertData {
  return !!data && data.tipo === "ALERTA_SOS" && typeof data.alertaId === "string" && typeof data.codigo === "string";
}

/** Push que llega cuando la alerta termina (atendida, cancelada o expirada). */
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

/** Apaga la alarma de esa alerta y deja un aviso silencioso de que terminó. */
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
  await createSosChannel();
  const name = data.nombre?.trim() || "Una persona";
  const text = `${name} activó una alerta y puede estar en peligro. Toca para ver su ubicación en tiempo real y escribirle.`;
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
      timeoutAfter: 10 * 60 * 1000, // la alarma deja de sonar sola a los 10 minutos
      // Pantalla completa sobre el bloqueo (Android 14 exige permiso de pantalla completa)
      fullScreenAction: { id: "default" },
      pressAction: { id: "default", launchActivity: "default" },
      actions: [{ title: "Ver ubicación", pressAction: { id: "atender", launchActivity: "default" } }],
    },
  });
}

/** Detiene la alarma (al abrir la pantalla de la alerta). */
export async function stopSosAlarm(alertId: string | number): Promise<void> {
  await notifee.cancelNotification(notificationId(String(alertId)));
}

export function notificationData(n: Notification | undefined): SosAlertData | null {
  const data = n?.data as Record<string, unknown> | undefined;
  return isSosAlert(data) ? data : null;
}

const notificationId = (alertId: string) => `sos-${alertId}`;

// Alerta pendiente de abrir: llega antes de que la navegación esté lista (app recién abierta
// desde la notificación) o mientras no hay sesión iniciada.
let pending: SosAlertData | null = null;
const listeners = new Set<(d: SosAlertData) => void>();

export function openSosAlert(data: SosAlertData): void {
  if (listeners.size === 0) {
    pending = data;
    return;
  }
  listeners.forEach((o) => o(data));
}

/** La navegación se suscribe aquí; si había una alerta pendiente, se entrega de inmediato. */
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
