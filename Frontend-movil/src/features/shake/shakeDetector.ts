/**
 * Detects motion activation: 4 or more quick strong chops, from the accelerometer
 * readings (in g, including gravity; at rest the phone reads ~1 g).
 *
 * Measured on a real phone (Infinix X678B): strong chops do not stop between hits.
 * The strength stays at 6-8 g with peaks of 11-13 g every 0.3-0.4 s for 1-5 s. That is why
 * PEAKS are counted (local maxima above `thresholdG`), not hits separated by rest.
 *
 * So it is not confused with jogging or running (steps of ~3-4 g, sometimes more):
 *   1) before the first peak there must be a while without peaks (when running, the steps do not stop) and
 *   2) after the last one too, with the phone already still: someone running keeps moving; someone
 *      asking for help stops.
 * More than 4 chops also counts. After a detection there is a pause so it does not fire twice.
 */

export type DetectorOptions = {
  /** Minimum strength of a peak (chop), in g. */
  thresholdG: number;
  /** Below this strength the phone is considered still. */
  restG: number;
  /** Still time (below `restG`) to consider the sequence finished (ms). */
  minRestMs: number;
  /** Required peaks. */
  requiredHits: number;
  /** Maximum duration of the peak sequence, counted from the first one (ms). */
  windowMs: number;
  /** Minimum gap between two peaks: anything sooner is the rebound of the same chop (ms). */
  minGapMs: number;
  /** Maximum gap between two consecutive peaks of the same sequence (ms). */
  maxGapMs: number;
  /** Time without peaks before the first one (ms). */
  calmBeforeMs: number;
  /** Time without peaks after the last one to confirm (ms). */
  calmAfterMs: number;
  /** Pause after a detection (ms). */
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

  // The two previous readings: a peak is confirmed when the next reading is already lower
  let previous: { g: number; t: number } | null = null;
  let thirdToLast = 0;
  let lastPeak = Number.NEGATIVE_INFINITY;
  let peaks: number[] = [];
  let stillSince: number | null = null;
  let pausedUntil = 0;

  const registerPeak = (t: number) => {
    if (t - lastPeak < o.minGapMs) return; // rebound of the same chop
    const hadCalm = t - lastPeak >= o.calmBeforeMs;
    const continues = peaks.length > 0 && t - lastPeak <= o.maxGapMs && t - peaks[0] <= o.windowMs;
    if (continues) peaks.push(t);
    else peaks = hadCalm ? [t] : []; // without calm before it is continuous activity (e.g. running)
    lastPeak = t;
  };

  return (x, y, z, t) => {
    const strength = Math.sqrt(x * x + y * y + z * z);
    if (t < pausedUntil) {
      previous = null;
      return false;
    }

    // Was the previous reading a strong local maximum?
    if (previous && previous.g >= o.thresholdG && previous.g >= thirdToLast && previous.g > strength) {
      registerPeak(previous.t);
    }
    thirdToLast = previous?.g ?? strength;
    previous = { g: strength, t };

    stillSince = strength < o.restG ? (stillSince ?? t) : null;

    // Complete sequence: no new peaks during the calm afterwards and the phone already still
    const still = stillSince !== null && t - stillSince >= o.minRestMs;
    if (peaks.length >= o.requiredHits && t - lastPeak >= o.calmAfterMs && still) {
      peaks = [];
      pausedUntil = t + o.pauseMs;
      return true;
    }
    // Too much time passed without completing the sequence: discarded
    if (peaks.length > 0 && t - lastPeak > o.maxGapMs && peaks.length < o.requiredHits) {
      peaks = [];
    }
    return false;
  };
}
