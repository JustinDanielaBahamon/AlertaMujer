import api from "./api";

/** Mensaje del chat de una alerta. deElla: lo escribió quien activó la alerta. */
export interface MensajeAlerta {
  id: number;
  deElla: boolean;
  nombre: string;
  texto: string;
  hora: Date;
}

// El backend devuelve LocalDateTime en UTC sin 'Z' (igual que en alerts.service.ts)
const aFecha = (iso?: string | null): Date => {
  if (!iso) return new Date();
  const d = new Date(iso + (iso.endsWith("Z") || iso.includes("+") ? "" : "Z"));
  return isNaN(d.getTime()) ? new Date() : d;
};

export const aMensaje = (m: any): MensajeAlerta => ({
  id: m.id,
  deElla: m.senderType === "owner",
  nombre: m.senderName,
  texto: m.body,
  hora: aFecha(m.createdAt),
});

/** Quién escribe: la dueña de la alerta (con su sesión) o un contacto (con el código del seguimiento). */
export type ParticipanteChat =
  | { tipo: "duena"; alertaId: number }
  | { tipo: "contacto"; codigo: string; nombre: string };

const ruta = (p: ParticipanteChat) =>
  p.tipo === "duena"
    ? `/api/alerts/${p.alertaId}/messages`
    : `/api/public/tracking/${encodeURIComponent(p.codigo)}/messages`;

export async function leerMensajes(p: ParticipanteChat, despuesDe = 0): Promise<MensajeAlerta[]> {
  const r = await api.get<any[]>(ruta(p), { params: { after: despuesDe } });
  return (r.data ?? []).map(aMensaje);
}

export async function enviarMensaje(p: ParticipanteChat, texto: string): Promise<MensajeAlerta> {
  const cuerpo = p.tipo === "duena" ? { body: texto } : { name: p.nombre, body: texto };
  const r = await api.post<any>(ruta(p), cuerpo);
  return aMensaje(r.data);
}
