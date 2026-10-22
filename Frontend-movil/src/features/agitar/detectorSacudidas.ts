/**
 * Detecta la activación por movimiento: 4 o más hachazos rápidos y fuertes, a partir de las lecturas
 * del acelerómetro (en g, incluida la gravedad; en reposo el teléfono marca ~1 g).
 *
 * Medido en un celular real (Infinix X678B): unos hachazos fuertes no se detienen entre golpe y golpe.
 * La fuerza se queda en 6-8 g con picos de 11-13 g cada 0,3-0,4 s durante 1-5 s. Por eso se cuentan
 * PICOS (máximos locales por encima de `umbralG`), no golpes separados por reposo.
 *
 * Para no confundirlo con trotar o correr (pasos de ~3-4 g, a veces más):
 *   1) antes del primer pico tiene que haber un rato sin picos (corriendo, los pasos no paran) y
 *   2) después del último también, con el teléfono ya quieto: quien corre sigue moviéndose; quien
 *      pide ayuda se detiene.
 * Dar más de 4 hachazos también cuenta. Tras una detección hay una pausa para no disparar dos veces.
 */

export type DetectorOptions = {
  /** Fuerza mínima de un pico (hachazo), en g. */
  thresholdG: number;
  /** Por debajo de esta fuerza el teléfono se considera quieto. */
  restG: number;
  /** Tiempo quieto (bajo `reposoG`) para dar por terminada la secuencia (ms). */
  minRestMs: number;
  /** Picos necesarios. */
  requiredHits: number;
  /** Duración máxima de la secuencia de picos, contada desde el primero (ms). */
  windowMs: number;
  /** Separación mínima entre dos picos: lo que llega antes es el rebote del mismo hachazo (ms). */
  minGapMs: number;
  /** Separación máxima entre dos picos seguidos de la misma secuencia (ms). */
  maxGapMs: number;
  /** Tiempo sin picos antes del primero (ms). */
  calmBeforeMs: number;
  /** Tiempo sin picos después del último para confirmar (ms). */
  calmAfterMs: number;
  /** Pausa después de una detección (ms). */
  pauseMs: number;
};

export const DEFAULT_OPTIONS: DetectorOptions = {
  thresholdG: 4.5,
  restG: 2.0,
  minRestMs: 200,
  requiredHits: 4,
  windowMs: 8000,
  minGapMs: 200,
  maxGapMs: 1000,
  calmBeforeMs: 400,
  calmAfterMs: 600,
  pauseMs: 8000,
};

export type ShakeDetector = (x: number, y: number, z: number, timeMs: number) => boolean;

export function createShakeDetector(options: Partial<DetectorOptions> = {}): ShakeDetector {
  const o = { ...DEFAULT_OPTIONS, ...options };

  // Las dos lecturas anteriores: un pico se confirma cuando la siguiente lectura ya es menor
  let previous: { g: number; t: number } | null = null;
  let thirdToLast = 0;
  let lastPeak = Number.NEGATIVE_INFINITY;
  let peaks: number[] = [];
  let stillSince: number | null = null;
  let pausedUntil = 0;

  const registerPeak = (t: number) => {
    if (t - lastPeak < o.minGapMs) return; // rebote del mismo hachazo
    const hadCalm = t - lastPeak >= o.calmBeforeMs;
    const continues = peaks.length > 0 && t - lastPeak <= o.maxGapMs && t - peaks[0] <= o.windowMs;
    if (continues) peaks.push(t);
    else peaks = hadCalm ? [t] : []; // sin calma previa es actividad continua (p. ej. correr)
    lastPeak = t;
  };

  return (x, y, z, t) => {
    const strength = Math.sqrt(x * x + y * y + z * z);
    if (t < pausedUntil) {
      previous = null;
      return false;
    }

    // ¿La lectura anterior fue un máximo local fuerte?
    if (previous && previous.g >= o.thresholdG && previous.g >= thirdToLast && previous.g > strength) {
      registerPeak(previous.t);
    }
    thirdToLast = previous?.g ?? strength;
    previous = { g: strength, t };

    stillSince = strength < o.restG ? (stillSince ?? t) : null;

    // Secuencia completa: sin picos nuevos durante la calma posterior y el teléfono ya quieto
    const still = stillSince !== null && t - stillSince >= o.minRestMs;
    if (peaks.length >= o.requiredHits && t - lastPeak >= o.calmAfterMs && still) {
      peaks = [];
      pausedUntil = t + o.pauseMs;
      return true;
    }
    // Pasó demasiado tiempo sin completar la secuencia: se descarta
    if (peaks.length > 0 && t - lastPeak > o.maxGapMs && peaks.length < o.requiredHits) {
      peaks = [];
    }
    return false;
  };
}
