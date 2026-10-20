/**
 * true si la versión instalada es anterior a la mínima que pide la administración ("1.2.0").
 * Compara número por número; lo que no es número se ignora. Sin mínima configurada, nunca.
 */
export function esVersionAnterior(instalada: string | null | undefined, minima: string | null | undefined): boolean {
  if (!minima?.trim() || !instalada?.trim()) return false;
  const partes = (v: string) => v.trim().split(".").map((p) => parseInt(p, 10) || 0);
  const a = partes(instalada);
  const b = partes(minima);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x < y;
  }
  return false;
}
