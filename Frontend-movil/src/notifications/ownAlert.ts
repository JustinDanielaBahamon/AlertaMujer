import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import { DISCREET_TEXT, DISCREET_TITLE, isDiscreet } from "../features/settings/discreetMode";
import { bigStyle } from "./notificationStyle";

/**
 * The server activated an alert for her (a trip she did not confirm, a lost signal, the automatic
 * protection). Her phone is told so that opening the app shows the active alert screen right away
 * (useResumeAlert) and sends her location from there.
 */
export type OwnAlertData = { tipo: "ALERTA_PROPIA"; alertaId: string; motivo?: string };

export function isOwnAlert(data: Record<string, unknown> | undefined): data is OwnAlertData {
  return !!data && data.tipo === "ALERTA_PROPIA" && typeof data.alertaId === "string";
}

const OWN_CHANNEL = "alerta_propia";

export async function showOwnAlert(data: OwnAlertData): Promise<void> {
  await notifee.createChannel({
    id: OWN_CHANNEL,
    name: "Tu alerta",
    description: "Cuando AlertaMujer activa una alerta por ti",
    importance: AndroidImportance.HIGH,
    vibration: true,
  });
  const discreet = await isDiscreet();
  const text = discreet
    ? DISCREET_TEXT
    : `${data.motivo?.trim() || "Activamos tu alerta"}. Tus contactos ya recibieron tu ubicación. Toca para abrirla.`;
  await notifee.displayNotification({
    id: `propia-${data.alertaId}`,
    title: discreet ? DISCREET_TITLE : "Tu alerta está activa",
    body: text,
    data,
    android: {
      channelId: OWN_CHANNEL,
      ...bigStyle(text),
      visibility: discreet ? AndroidVisibility.PRIVATE : AndroidVisibility.PUBLIC,
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
}
