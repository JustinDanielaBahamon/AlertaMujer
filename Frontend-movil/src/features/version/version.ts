/**
 * true if the installed version is older than the minimum the administration requires ("1.2.0").
 * Compares number by number; anything that is not a number is ignored. With no minimum set, never.
 */
export function isOlderVersion(installed: string | null | undefined, minima: string | null | undefined): boolean {
  if (!minima?.trim() || !installed?.trim()) return false;
  const parts = (v: string) => v.trim().split(".").map((p) => parseInt(p, 10) || 0);
  const a = parts(installed);
  const b = parts(minima);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x < y;
  }
  return false;
}
