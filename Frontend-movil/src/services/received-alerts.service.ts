import api from "./api";
import { aFecha } from "./alert-tracking.service";

/** Alerta de otra persona que tiene a la usuaria como contacto de emergencia. */
export interface AlertaRecibida {
  id: number;
  nombre: string;
  activa: boolean;
  estado: string; // "active" | "resolved" | "cancelled" ...
  inicio: Date | null;
  fin: Date | null;
  seguimientoDisponible: boolean;
}

export async function getAlertasRecibidas(): Promise<AlertaRecibida[]> {
  const { data } = await api.get<any[]>("/api/received-alerts");
  return (data ?? []).map((a) => ({
    id: Number(a.alertId),
    nombre: a.firstName || "",
    activa: !!a.active,
    estado: a.status ?? "",
    inicio: a.startedAt ? aFecha(a.startedAt) : null,
    fin: a.endedAt ? aFecha(a.endedAt) : null,
    seguimientoDisponible: !!a.trackingAvailable,
  }));
}

/** Código de seguimiento público para abrir la alerta (solo si el seguimiento sigue vigente). */
export async function getCodigoSeguimiento(alertaId: number): Promise<string> {
  const { data } = await api.post<{ code: string }>(`/api/received-alerts/${alertaId}/tracking`, {});
  return data.code;
}
