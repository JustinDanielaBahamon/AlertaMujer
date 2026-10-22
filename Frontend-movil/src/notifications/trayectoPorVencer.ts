import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import { estiloGrande } from "./estiloNotificacion";

/**
 * "¿Ya llegaste?": push que envía el servidor 5 minutos antes de la hora de llegada de un trayecto
 * de "Avísame si no llego". Al tocarla se abre la pantalla del trayecto para confirmar o alargar.
 */
export function esTrayectoPorVencer(data: Record<string, unknown> | undefined): boolean {
  return !!data && data.tipo === "TRAYECTO_POR_VENCER";
}

const CANAL_TRAYECTO = "avisos_trayecto";

export async function mostrarTrayectoPorVencer(data: Record<string, unknown> | undefined): Promise<void> {
  await notifee.createChannel({
    id: CANAL_TRAYECTO,
    name: "Avísame si no llego",
    description: "Te pregunta si ya llegaste antes de avisar a tus contactos",
    importance: AndroidImportance.HIGH,
    vibration: true,
    visibility: AndroidVisibility.PUBLIC,
  });
  const destino = typeof data?.destino === "string" && data.destino ? data.destino : "tu destino";
  const minutos = Number(data?.minutos ?? 5);
  const texto =
    `Si no confirmas que llegaste, en unos ${minutos + 2} minutos avisaremos a tus contactos con tu última ubicación. ` +
    "Toca para confirmar o pedir más tiempo.";
  await notifee.displayNotification({
    id: `trayecto-${data?.trayectoId ?? ""}`,
    title: `¿Ya llegaste a ${destino}?`,
    body: texto,
    data: { tipo: "TRAYECTO" },
    android: {
      channelId: CANAL_TRAYECTO,
      ...estiloGrande(texto),
      visibility: AndroidVisibility.PUBLIC,
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
}

/** true si la notificación es la de un trayecto (para abrir su pantalla al tocarla). */
export const esNotificacionDeTrayecto = (datos: Record<string, unknown> | undefined) => datos?.tipo === "TRAYECTO";
