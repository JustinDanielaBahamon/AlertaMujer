/**
 * Activación con el botón de encendido: 4 pulsaciones rápidas (en 3 s). Cada pulsación prende o
 * apaga la pantalla, que es lo que la app puede ver.
 *
 * Mirar la hora son 1 o 2 pulsaciones y el "SOS de emergencia" de Android usa 5: con 4 no se
 * confunde con ninguno de los dos. Tras una detección hay una pausa para no disparar dos veces.
 */
export type PowerButtonOptions = {
  presses: number;
  windowMs: number;
  /** Dos cambios de pantalla más juntos que esto son el mismo evento repetido por el sistema. */
  minGapMs: number;
  pauseMs: number;
};

export const POWER_BUTTON_OPTIONS: PowerButtonOptions = {
  presses: 4,
  windowMs: 3000,
  minGapMs: 80,
  pauseMs: 8000,
};

export type PowerButtonDetector = (timeMs: number) => boolean;

export function createPowerButtonDetector(options: Partial<PowerButtonOptions> = {}): PowerButtonDetector {
  const o = { ...POWER_BUTTON_OPTIONS, ...options };
  let presses: number[] = [];
  let pausedUntil = 0;

  return (t) => {
    if (t < pausedUntil) return false;
    const latest = presses[presses.length - 1];
    if (latest !== undefined && t - latest < o.minGapMs) return false;

    presses = [...presses.filter((p) => t - p <= o.windowMs), t];
    if (presses.length < o.presses) return false;

    presses = [];
    pausedUntil = t + o.pauseMs;
    return true;
  };
}
