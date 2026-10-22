import type { UserApi } from "../../services/users.service";

/** Datos que pide el registro normal y que una cuenta creada con Google no trae. */
export function profileIncomplete(u: Pick<UserApi, "telephone" | "documentNumber" | "documentType" | "birthdate">): boolean {
  return !u.telephone?.trim() || !u.documentNumber?.trim() || !u.documentType?.trim() || !u.birthdate;
}

/** "05/05/1995" → "1995-05-05"; null si la fecha no existe o no es razonable (edad 5 a 110 años). */
export function dateToIso(ddMmYyyy: string, today = new Date()): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddMmYyyy.trim());
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  const age = (today.getTime() - date.getTime()) / (365.25 * 86400000);
  if (age < 5 || age > 110) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** Escribe la fecha con las barras a medida que se teclea. */
export function formatDateText(text: string): string {
  const d = text.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}
