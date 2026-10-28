import api from "./api";

/** A message in an alert chat. deElla: written by the person who activated the alert. */
export interface AlertMessage {
  id: number;
  deElla: boolean;
  name: string;
  text: string;
  time: Date;
}

// The backend returns LocalDateTime in UTC without 'Z' (same as in alerts.service.ts)
const toDate = (iso?: string | null): Date => {
  if (!iso) return new Date();
  const d = new Date(iso + (iso.endsWith("Z") || iso.includes("+") ? "" : "Z"));
  return isNaN(d.getTime()) ? new Date() : d;
};

export const toMessage = (m: any): AlertMessage => ({
  id: m.id,
  deElla: m.senderType === "owner",
  name: m.senderName,
  text: m.body,
  time: toDate(m.createdAt),
});

/** Who writes: the alert owner (with her session) or a contact (with the tracking code). */
export type ChatParticipant =
  | { type: "duena"; alertId: number }
  | { type: "contacto"; code: string; name: string };

const route = (p: ChatParticipant) =>
  p.type === "duena"
    ? `/api/alerts/${p.alertId}/messages`
    : `/api/public/tracking/${encodeURIComponent(p.code)}/messages`;

export async function readMessages(p: ChatParticipant, after = 0): Promise<AlertMessage[]> {
  const r = await api.get<any[]>(route(p), { params: { after: after } });
  return (r.data ?? []).map(toMessage);
}

export async function sendMessage(p: ChatParticipant, text: string): Promise<AlertMessage> {
  const body = p.type === "duena" ? { body: text } : { name: p.name, body: text };
  const r = await api.post<any>(route(p), body);
  return toMessage(r.data);
}
