import notifee, { AndroidImportance } from "@notifee/react-native";
import { bigStyle } from "./notificationStyle";

/**
 * Notice when the account is opened from another phone (NUEVO_CELULAR push from the backend). The account
 * can be on several phones; the daily location is taken from the most recently used one.
 */
export function isNewPhone(data: Record<string, unknown> | undefined): boolean {
  return !!data && data.tipo === "NUEVO_CELULAR";
}

const ACCOUNT_CHANNEL = "avisos_cuenta";

export async function showNewPhone(data: Record<string, unknown> | undefined): Promise<void> {
  await notifee.createChannel({
    id: ACCOUNT_CHANNEL,
    name: "Seguridad de la cuenta",
    description: "Cuando se entra a tu cuenta desde otro celular",
    importance: AndroidImportance.HIGH,
  });
  const phone = typeof data?.celular === "string" && data.celular.trim() ? data.celular.trim() : "otro celular";
  const text =
    `Se abrió tu cuenta de AlertaMujer en ${phone}. Desde ahora tu ubicación diaria se toma de ese celular. ` +
    "Si no fuiste tú, cambia tu contraseña.";
  await notifee.displayNotification({
    title: "Tu cuenta se abrió en otro celular",
    body: text,
    android: {
      channelId: ACCOUNT_CHANNEL,
      ...bigStyle(text),
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
}
