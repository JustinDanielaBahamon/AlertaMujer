/**
 * Power button activation: 4 quick presses (within 3 s). Each press turns the screen on or
 * off, which is what the app can see.
 *
 * Checking the time is 1 or 2 presses and Android "Emergency SOS" uses 5: with 4 it is not
 * confused with either. After a detection there is a pause so it does not fire twice.
 */
export type PowerButtonOptions = {
  presses: number;
  windowMs: number;
  /** Two screen changes closer together than this are the same event repeated by the system. */
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
