import { Platform } from "react-native";
import SensorSacudidas, { type CierreApp } from "../../../modules/sensor-sacudidas";

/**
 * ¿La protección se ha detenido sin que la usuaria lo sepa? Android registra cada cierre de la app
 * con su motivo (ApplicationExitInfo). Si al morir el proceso tenía la importancia de un servicio en
 * primer plano (la notificación "Protección activa"), la protección estaba corriendo y se cortó.
 * Así no hay que confiar en que la usuaria configuró bien su teléfono: se comprueba.
 */

export type InterruptionCause = "recientes" | "detenida" | "sistema" | "error";
export type Interruption = { when: number; cause: InterruptionCause };

// ActivityManager.RunningAppProcessInfo: 125 = servicio en primer plano, 100 = en pantalla
const FOREGROUND_SERVICE_IMPORTANCE = 125;
// ApplicationExitInfo.REASON_*
const USER_REQUESTED = 10;
const CRASH = 4;
const CRASH_NATIVE = 5;
const ANR = 6;
const EXIT_SELF = 1;
const PACKAGE_UPDATED = 16;

export function classifyExit(c: CierreApp): Interruption | null {
  if (c.importancia > FOREGROUND_SERVICE_IMPORTANCE) return null; // la protección no corría
  if (c.motivo === EXIT_SELF || c.motivo === PACKAGE_UPDATED) return null; // la app terminó o se actualizó
  if (c.motivo === USER_REQUESTED) {
    // Deslizar la app en "Recientes" (XOS: "remove task ... SwipeUpClean") la mata entera
    const recent = /remove task|swipe/i.test(c.descripcion);
    return { when: c.timestamp, cause: recent ? "recientes" : "detenida" };
  }
  if (c.motivo === CRASH || c.motivo === CRASH_NATIVE || c.motivo === ANR) return { when: c.timestamp, cause: "error" };
  // Memoria, ahorro de energía, "demasiados procesos", congelado...: lo hizo el sistema o la marca
  return { when: c.timestamp, cause: "sistema" };
}

/** Interrupciones de la protección en los últimos días (Android 11+; antes no hay registro). */
export function recentInterruptions(days = 7): Interruption[] {
  if (Platform.OS !== "android") return [];
  try {
    return SensorSacudidas.motivosDeCierre(Date.now() - days * 24 * 60 * 60 * 1000)
      .map(classifyExit)
      .filter((i): i is Interruption => i !== null)
      .sort((a, b) => b.when - a.when);
  } catch {
    return [];
  }
}

/** Texto y arreglo para la causa más reciente. */
export const EXPLANATION: Record<InterruptionCause, { title: string; fixItem: string }> = {
  recientes: {
    title: "Se cerró la app desde «Recientes»",
    fixItem:
      "Al deslizar la app para cerrarla, el teléfono también apaga la protección. En Recientes, mantén presionada la tarjeta de AlertaMujer y toca el candado para bloquearla.",
  },
  detenida: {
    title: "Se forzó la detención de la app",
    fixItem: "Desde los ajustes del teléfono se detuvo AlertaMujer. Ábrela de nuevo para reactivar la protección.",
  },
  sistema: {
    title: "El teléfono detuvo la protección para ahorrar energía",
    fixItem: "Permite el inicio automático de AlertaMujer y quítale las restricciones de batería.",
  },
  error: {
    title: "La app se cerró por un error",
    fixItem: "Ábrela de nuevo. Si vuelve a pasar, avísanos.",
  },
};
