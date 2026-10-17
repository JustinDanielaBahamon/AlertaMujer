import { Platform } from "react-native";
import SensorSacudidas, { type CierreApp } from "../../../modules/sensor-sacudidas";

/**
 * ¿La protección se ha detenido sin que la usuaria lo sepa? Android registra cada cierre de la app
 * con su motivo (ApplicationExitInfo). Si al morir el proceso tenía la importancia de un servicio en
 * primer plano (la notificación "Protección activa"), la protección estaba corriendo y se cortó.
 * Así no hay que confiar en que la usuaria configuró bien su teléfono: se comprueba.
 */

export type CausaInterrupcion = "recientes" | "detenida" | "sistema" | "error";
export type Interrupcion = { cuando: number; causa: CausaInterrupcion };

// ActivityManager.RunningAppProcessInfo: 125 = servicio en primer plano, 100 = en pantalla
const IMPORTANCIA_SERVICIO_PRIMER_PLANO = 125;
// ApplicationExitInfo.REASON_*
const USER_REQUESTED = 10;
const CRASH = 4;
const CRASH_NATIVE = 5;
const ANR = 6;
const EXIT_SELF = 1;
const PACKAGE_UPDATED = 16;

export function clasificarCierre(c: CierreApp): Interrupcion | null {
  if (c.importancia > IMPORTANCIA_SERVICIO_PRIMER_PLANO) return null; // la protección no corría
  if (c.motivo === EXIT_SELF || c.motivo === PACKAGE_UPDATED) return null; // la app terminó o se actualizó
  if (c.motivo === USER_REQUESTED) {
    // Deslizar la app en "Recientes" (XOS: "remove task ... SwipeUpClean") la mata entera
    const recientes = /remove task|swipe/i.test(c.descripcion);
    return { cuando: c.timestamp, causa: recientes ? "recientes" : "detenida" };
  }
  if (c.motivo === CRASH || c.motivo === CRASH_NATIVE || c.motivo === ANR) return { cuando: c.timestamp, causa: "error" };
  // Memoria, ahorro de energía, "demasiados procesos", congelado...: lo hizo el sistema o la marca
  return { cuando: c.timestamp, causa: "sistema" };
}

/** Interrupciones de la protección en los últimos días (Android 11+; antes no hay registro). */
export function interrupcionesRecientes(dias = 7): Interrupcion[] {
  if (Platform.OS !== "android") return [];
  try {
    return SensorSacudidas.motivosDeCierre(Date.now() - dias * 24 * 60 * 60 * 1000)
      .map(clasificarCierre)
      .filter((i): i is Interrupcion => i !== null)
      .sort((a, b) => b.cuando - a.cuando);
  } catch {
    return [];
  }
}

/** Texto y arreglo para la causa más reciente. */
export const EXPLICACION: Record<CausaInterrupcion, { titulo: string; arreglo: string }> = {
  recientes: {
    titulo: "Se cerró la app desde «Recientes»",
    arreglo:
      "Al deslizar la app para cerrarla, el teléfono también apaga la protección. En Recientes, mantén presionada la tarjeta de AlertaMujer y toca el candado para bloquearla.",
  },
  detenida: {
    titulo: "Se forzó la detención de la app",
    arreglo: "Desde los ajustes del teléfono se detuvo AlertaMujer. Ábrela de nuevo para reactivar la protección.",
  },
  sistema: {
    titulo: "El teléfono detuvo la protección para ahorrar energía",
    arreglo: "Permite el inicio automático de AlertaMujer y quítale las restricciones de batería.",
  },
  error: {
    titulo: "La app se cerró por un error",
    arreglo: "Ábrela de nuevo. Si vuelve a pasar, avísanos.",
  },
};
