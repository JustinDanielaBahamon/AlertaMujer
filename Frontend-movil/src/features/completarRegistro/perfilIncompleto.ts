import type { UserApi } from "../../services/users.service";

/** Datos que pide el registro normal y que una cuenta creada con Google no trae. */
export function perfilIncompleto(u: Pick<UserApi, "telephone" | "documentNumber" | "documentType" | "birthdate">): boolean {
  return !u.telephone?.trim() || !u.documentNumber?.trim() || !u.documentType?.trim() || !u.birthdate;
}

/** "05/05/1995" → "1995-05-05"; null si la fecha no existe o no es razonable (edad 5 a 110 años). */
export function fechaAIso(ddMmAaaa: string, hoy = new Date()): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddMmAaaa.trim());
  if (!m) return null;
  const [dia, mes, anio] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const fecha = new Date(anio, mes - 1, dia);
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return null;
  const edad = (hoy.getTime() - fecha.getTime()) / (365.25 * 86400000);
  if (edad < 5 || edad > 110) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** Escribe la fecha con las barras a medida que se teclea. */
export function formatearFecha(texto: string): string {
  const d = texto.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}
