import notifee, { AndroidImportance } from "@notifee/react-native";
import { estiloGrande } from "./estiloNotificacion";

/**
 * Aviso cuando se entra a la cuenta desde otro celular (push NUEVO_CELULAR del backend). La cuenta
 * puede estar en varios celulares; la ubicación del día a día se toma del usado más recientemente.
 */
export function esNuevoCelular(data: Record<string, unknown> | undefined): boolean {
  return !!data && data.tipo === "NUEVO_CELULAR";
}

const CANAL_CUENTA = "avisos_cuenta";

export async function mostrarNuevoCelular(data: Record<string, unknown> | undefined): Promise<void> {
  await notifee.createChannel({
    id: CANAL_CUENTA,
    name: "Seguridad de la cuenta",
    description: "Cuando se entra a tu cuenta desde otro celular",
    importance: AndroidImportance.HIGH,
  });
  const celular = typeof data?.celular === "string" && data.celular.trim() ? data.celular.trim() : "otro celular";
  const texto =
    `Se abrió tu cuenta de AlertaMujer en ${celular}. Desde ahora tu ubicación diaria se toma de ese celular. ` +
    "Si no fuiste tú, cambia tu contraseña.";
  await notifee.displayNotification({
    title: "Tu cuenta se abrió en otro celular",
    body: texto,
    android: {
      channelId: CANAL_CUENTA,
      ...estiloGrande(texto),
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
}
