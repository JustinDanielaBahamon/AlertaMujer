import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  type Notification,
} from "@notifee/react-native";

/**
 * Alarma que recibe un contacto de emergencia cuando una usuaria activa una alerta. Llega como
 * mensaje FCM solo de datos y de prioridad alta; aquí se convierte en una notificación tipo
 * llamada entrante: pantalla completa sobre el bloqueo, sonido de alarma en bucle y vibración.
 */

export const CANAL_SOS = "alertas_sos";
const SONIDO = "alarma_sos"; // res/raw/alarma_sos.wav (plugins/withAlarmSound.js)

/** Datos del push que envía el backend (AlertNotificationService). */
export type DatosAlertaSos = {
  tipo: "ALERTA_SOS";
  alertaId: string;
  nombre: string;
  codigo: string; // código de seguimiento público
};

export function esAlertaSos(data: Record<string, unknown> | undefined): data is DatosAlertaSos {
  return !!data && data.tipo === "ALERTA_SOS" && typeof data.alertaId === "string" && typeof data.codigo === "string";
}

export async function crearCanalSos(): Promise<void> {
  await notifee.createChannel({
    id: CANAL_SOS,
    name: "Alertas de emergencia",
    description: "Alarma cuando una persona que te registró como contacto activa una alerta",
    importance: AndroidImportance.HIGH,
    sound: SONIDO,
    vibration: true,
    vibrationPattern: [400, 600, 400, 600],
    bypassDnd: true,
    visibility: AndroidVisibility.PUBLIC,
  });
}

export async function mostrarAlarmaSos(datos: DatosAlertaSos): Promise<void> {
  await crearCanalSos();
  const nombre = datos.nombre?.trim() || "Una persona";
  await notifee.displayNotification({
    id: idNotificacion(datos.alertaId),
    title: "🚨 Alerta de emergencia",
    body: `${nombre} activó una alerta. Toca para ver su ubicación en tiempo real.`,
    data: datos,
    android: {
      channelId: CANAL_SOS,
      category: AndroidCategory.ALARM,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: SONIDO,
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
export async function detenerAlarmaSos(alertaId: string | number): Promise<void> {
  await notifee.cancelNotification(idNotificacion(String(alertaId)));
}

export function datosDeNotificacion(n: Notification | undefined): DatosAlertaSos | null {
  const data = n?.data as Record<string, unknown> | undefined;
  return esAlertaSos(data) ? data : null;
}

const idNotificacion = (alertaId: string) => `sos-${alertaId}`;

// Alerta pendiente de abrir: llega antes de que la navegación esté lista (app recién abierta
// desde la notificación) o mientras no hay sesión iniciada.
let pendiente: DatosAlertaSos | null = null;
const oyentes = new Set<(d: DatosAlertaSos) => void>();

export function abrirAlertaSos(datos: DatosAlertaSos): void {
  if (oyentes.size === 0) {
    pendiente = datos;
    return;
  }
  oyentes.forEach((o) => o(datos));
}

/** La navegación se suscribe aquí; si había una alerta pendiente, se entrega de inmediato. */
export function alAbrirAlertaSos(oyente: (d: DatosAlertaSos) => void): () => void {
  oyentes.add(oyente);
  if (pendiente) {
    const d = pendiente;
    pendiente = null;
    oyente(d);
  }
  return () => {
    oyentes.delete(oyente);
  };
}
