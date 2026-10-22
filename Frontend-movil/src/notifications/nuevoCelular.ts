import notifee, { AndroidImportance } from "@notifee/react-native";
import { bigStyle } from "./estiloNotificacion";

/**
 * Aviso cuando se entra a la cuenta desde otro celular (push NUEVO_CELULAR del backend). La cuenta
 * puede estar en varios celulares; la ubicación del día a día se toma del usado más recientemente.
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
