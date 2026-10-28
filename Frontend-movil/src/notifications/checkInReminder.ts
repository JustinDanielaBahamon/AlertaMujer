import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import { isDiscreet } from "../features/settings/discreetMode";
import { bigStyle } from "./notificationStyle";

/**
 * "¿Sigues en peligro?" when the app is not on screen: tapping it opens the alert to answer. In
 * discreet mode it does not say what it is about.
 */
const CHANNEL = "alerta_pregunta";
const ID = "alerta-sigues-en-peligro";

export async function showCheckInReminder(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL,
    name: "Pregunta durante la alerta",
    description: "Te pregunta si sigues en peligro mientras tu alerta está activa",
    importance: AndroidImportance.HIGH,
    vibration: true,
    visibility: AndroidVisibility.PRIVATE,
  });
  const discreet = await isDiscreet();
  const text = discreet ? "Toca para responder." : "Tu alerta sigue activa. Toca para responder si sigues en peligro o ya estás bien.";
  await notifee.displayNotification({
    id: ID,
    title: discreet ? "Recordatorio" : "¿Sigues en peligro?",
    body: text,
    android: {
      channelId: CHANNEL,
      ...bigStyle(text),
      importance: AndroidImportance.HIGH,
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
}

export async function clearCheckInReminder(): Promise<void> {
  await notifee.cancelNotification(ID).catch(() => {});
}
