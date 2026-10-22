import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import { bigStyle } from "./estiloNotificacion";

/**
 * "¿Ya llegaste?": push que envía el servidor 5 minutos antes de la hora de llegada de un trayecto
 * de "Avísame si no llego". Al tocarla se abre la pantalla del trayecto para confirmar o alargar.
 */
export function isTripDueSoon(data: Record<string, unknown> | undefined): boolean {
  return !!data && data.tipo === "TRAYECTO_POR_VENCER";
}

const TRIP_CHANNEL = "avisos_trayecto";

export async function showTripDueSoon(data: Record<string, unknown> | undefined): Promise<void> {
  await notifee.createChannel({
    id: TRIP_CHANNEL,
    name: "Avísame si no llego",
    description: "Te pregunta si ya llegaste antes de avisar a tus contactos",
    importance: AndroidImportance.HIGH,
    vibration: true,
    visibility: AndroidVisibility.PUBLIC,
  });
  const destination = typeof data?.destino === "string" && data.destino ? data.destino : "tu destino";
  const minutes = Number(data?.minutos ?? 5);
  const text =
    `Si no confirmas que llegaste, en unos ${minutes + 2} minutos avisaremos a tus contactos con tu última ubicación. ` +
    "Toca para confirmar o pedir más tiempo.";
  await notifee.displayNotification({
    id: `trayecto-${data?.trayectoId ?? ""}`,
    title: `¿Ya llegaste a ${destination}?`,
    body: text,
    data: { tipo: "TRAYECTO" },
    android: {
      channelId: TRIP_CHANNEL,
      ...bigStyle(text),
      visibility: AndroidVisibility.PUBLIC,
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
}

/** true si la notificación es la de un trayecto (para abrir su pantalla al tocarla). */
export const isTripNotification = (data: Record<string, unknown> | undefined) => data?.tipo === "TRAYECTO";
