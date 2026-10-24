import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import { bigStyle } from "./notificationStyle";

/**
 * One general notice (not one per alert) the server sends 5 days before the evidence of her
 * alerts is deleted. Tapping it opens the history, where she can keep or download it.
 */
export function isEvidenceExpiry(data: Record<string, unknown> | undefined): boolean {
  return !!data && data.tipo === "EVIDENCIAS_POR_BORRAR";
}

const EXPIRY_CHANNEL = "avisos_evidencias";

export async function showEvidenceExpiry(data: Record<string, unknown> | undefined): Promise<void> {
  await notifee.createChannel({
    id: EXPIRY_CHANNEL,
    name: "Evidencias por borrar",
    description: "Te avisa antes de que se borren las evidencias de tus alertas",
    importance: AndroidImportance.DEFAULT,
    // Private: the lock screen does not show what it is about
    visibility: AndroidVisibility.PRIVATE,
  });
  const days = Number(data?.dias ?? 5);
  const text =
    `Tus evidencias de tus alertas se borrarán en ${days} días. ` +
    "Toca para revisarlas y guardar las que necesites.";
  await notifee.displayNotification({
    id: "evidencias-por-borrar",
    title: "Tus evidencias se borrarán pronto",
    body: text,
    data: { tipo: "HISTORIAL" },
    android: {
      channelId: EXPIRY_CHANNEL,
      ...bigStyle(text),
      visibility: AndroidVisibility.PRIVATE,
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
}

/** true if the notification leads to her alert history. */
export const isHistoryNotification = (data: Record<string, unknown> | undefined) => data?.tipo === "HISTORIAL";
