import { Platform } from "react-native";
import ShakeSensor, { type AppExit } from "../../../modules/shake-sensor";

/**
 * Has protection stopped without the user knowing? Android records every app exit
 * with its reason (ApplicationExitInfo). If the process had the importance of a foreground
 * service when it died (the "Active protection" notification), protection was running and was cut.
 * That way we do not have to trust that the user set up her phone right: it is checked.
 */

export type InterruptionCause = "recents" | "stopped" | "system" | "error";
export type Interruption = { when: number; cause: InterruptionCause };

// ActivityManager.RunningAppProcessInfo: 125 = foreground service, 100 = on screen
const FOREGROUND_SERVICE_IMPORTANCE = 125;
// ApplicationExitInfo.REASON_*
const USER_REQUESTED = 10;
const CRASH = 4;
const CRASH_NATIVE = 5;
const ANR = 6;
const EXIT_SELF = 1;
const PACKAGE_UPDATED = 16;

export function classifyExit(c: AppExit): Interruption | null {
  if (c.importance > FOREGROUND_SERVICE_IMPORTANCE) return null; // protection was not running
  if (c.reason === EXIT_SELF || c.reason === PACKAGE_UPDATED) return null; // the app exited or was updated
  if (c.reason === USER_REQUESTED) {
    // Swiping the app away in "Recents" (XOS: "remove task ... SwipeUpClean") kills it entirely
    const recent = /remove task|swipe/i.test(c.description);
    return { when: c.timestamp, cause: recent ? "recents" : "stopped" };
  }
  if (c.reason === CRASH || c.reason === CRASH_NATIVE || c.reason === ANR) return { when: c.timestamp, cause: "error" };
  // Memory, power saving, "too many processes", frozen...: the system or the brand did it
  return { when: c.timestamp, cause: "system" };
}

/** Protection interruptions in the last days (Android 11+; there is no record before). */
export function recentInterruptions(days = 7): Interruption[] {
  if (Platform.OS !== "android") return [];
  try {
    return ShakeSensor.exitReasons(Date.now() - days * 24 * 60 * 60 * 1000)
      .map(classifyExit)
      .filter((i): i is Interruption => i !== null)
      .sort((a, b) => b.when - a.when);
  } catch {
    return [];
  }
}

/** Text and fix for the most recent cause. */
export const EXPLANATION: Record<InterruptionCause, { title: string; fixItem: string }> = {
  recents: {
    title: "Se cerró la app desde «Recientes»",
    fixItem:
      "Al deslizar la app para cerrarla, el teléfono también apaga la protección. En Recientes, mantén presionada la tarjeta de AlertaMujer y toca el candado para bloquearla.",
  },
  stopped: {
    title: "Se forzó la detención de la app",
    fixItem: "Desde los ajustes del teléfono se detuvo AlertaMujer. Ábrela de nuevo para reactivar la protección.",
  },
  system: {
    title: "El teléfono detuvo la protección para ahorrar energía",
    fixItem: "Permite el inicio automático de AlertaMujer y quítale las restricciones de batería.",
  },
  error: {
    title: "La app se cerró por un error",
    fixItem: "Ábrela de nuevo. Si vuelve a pasar, avísanos.",
  },
};
