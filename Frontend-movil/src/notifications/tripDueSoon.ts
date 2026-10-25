import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import { bigStyle } from "./notificationStyle";
import { addToInbox } from "./inbox";

/**
 * "Did you arrive?": push the server sends 5 minutes before the arrival time of a
 * "Let me know if I don't arrive" trip. Tapping it opens the trip screen to confirm or extend.
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
  await addToInbox({
    id: `trip-${data?.trayectoId ?? ""}`,
    kind: "trip",
    title: `¿Ya llegaste a ${destination}?`,
    body: text,
    target: { screen: "Trip" },
  });
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

/** true if the notification is a trip one (to open its screen when tapped). */
export const isTripNotification = (data: Record<string, unknown> | undefined) => data?.tipo === "TRAYECTO";
