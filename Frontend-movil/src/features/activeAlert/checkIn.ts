/**
 * Timing of an active alert (decided with the team after analysing real situations):
 *  - location every 15 s the first 5 minutes (when she moves the most), then every 30 s, and every
 *    60 s in saving mode (she did not answer the check-in);
 *  - at the configured minutes (30) she is asked "¿Sigues en peligro?", 5 minutes before the time.
 */
export const FAST_LOCATION_MS = 15 * 1000;
export const LOCATION_MS = 30 * 1000;
export const SAVING_LOCATION_MS = 60 * 1000;
export const FAST_PHASE_MS = 5 * 60 * 1000;
/** The question appears this long before the check-in time. */
export const CHECK_IN_NOTICE_MS = 5 * 60 * 1000;

/** How long until the next location, from the alert start (null = not created yet). */
export function locationIntervalMs(startMs: number | null, now: number, saving: boolean): number {
  if (saving) return SAVING_LOCATION_MS;
  if (startMs === null || now - startMs < FAST_PHASE_MS) return FAST_LOCATION_MS;
  return LOCATION_MS;
}

/** When she is asked whether she is still in danger: the extension, or start + the configured minutes. */
export function checkInDeadline(startMs: number, checkInMinutes: number, extendedUntilMs: number | null): number {
  return extendedUntilMs ?? startMs + checkInMinutes * 60000;
}

/** Time to show the question (it stays until she answers). */
export const shouldAsk = (deadlineMs: number, now: number): boolean => now >= deadlineMs - CHECK_IN_NOTICE_MS;
