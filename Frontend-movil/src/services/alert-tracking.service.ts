import * as Application from "expo-application";
import api, { sourceWithToken } from "./api";
import type { AlertApi } from "./alerts.service";

export interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  recordedAt: Date;
}

export interface AlertTracking {
  status: string; // "active" | "cancelled" | "resolved" ...
  points: LocationPoint[]; // ordenados del más antiguo al más reciente
  alert?: AlertApi; // datos completos (solo para la dueña de la alerta)
  /** Grabaciones de la alerta (seguimiento público del contacto), de la más antigua a la más reciente. */
  evidence?: TrackingEvidence[];
}

export interface TrackingEvidence {
  id: number;
  type: "video" | "audio" | "photo" | "document";
  created: Date;
  /** Fuente para el reproductor (el endpoint público no necesita sesión). */
  source: { uri: string; headers: Record<string, string> };
}

/** Identificador anónimo de esta app para contar quién vio la alerta (sin datos personales). */
function visitorId(): string {
  try {
    const id = Application.getAndroidId();
    if (id) return `app-${id}`;
  } catch {
    // sin ANDROID_ID: se usa uno genérico
  }
  return "app-sin-identificador";
}

// El backend devuelve LocalDateTime en UTC sin 'Z' (igual que en alerts.service.ts).
export const toDate = (iso?: string | null): Date => {
  if (!iso) return new Date();
  const d = new Date(iso + (iso.endsWith("Z") || iso.includes("+") ? "" : "Z"));
  return isNaN(d.getTime()) ? new Date() : d;
};

export const getAlertTracking = async (
  alertId: number,
): Promise<AlertTracking> => {
  const { data: alert } = await api.get<AlertApi>(`/api/alerts/${alertId}`);

  let points: LocationPoint[] = [];

  try {
    // Endpoint de historial de ubicaciones de la alerta (pendiente en el backend).
    const { data } = await api.get<any[]>(`/api/alerts/${alertId}/locations`);
    points = (data ?? [])
      .filter((p) => p?.latitude != null && p?.longitude != null)
      .map((p, i) => ({
        id: String(p.id ?? `p-${i}`),
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        recordedAt: toDate(p.recordedAt ?? p.createdAt ?? p.timestamp),
      }));
  } catch {
    // Si el endpoint aún no existe, se usa solo la ubicación con la que se creó la alerta.
  }

  if (points.length === 0 && alert.latitude != null && alert.longitude != null) {
    points = [
      {
        id: `inicio-${alert.id}`,
        latitude: Number(alert.latitude),
        longitude: Number(alert.longitude),
        recordedAt: toDate(alert.startedAt || alert.createdAt),
      },
    ];
  }

  points.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());

  return { status: (alert.status || "").toLowerCase(), points, alert };
};

/**
 * Seguimiento para un contacto de emergencia: usa el endpoint público con el código que llega en
 * el push (un contacto no puede leer la alerta de otra persona por /api/alerts/{id}).
 */
export const getPublicTracking = async (code: string): Promise<AlertTracking> => {
  const route = `/api/public/tracking/${encodeURIComponent(code)}`;
  const { data } = await api.get<any>(route, { params: { v: visitorId() } });
  const points: LocationPoint[] = (data?.route ?? [])
    .filter((p: any) => p?.latitude != null && p?.longitude != null)
    .map((p: any, i: number) => ({
      id: `t-${i}-${p.recordedAt}`,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      recordedAt: toDate(p.recordedAt),
    }));
  const evidence: TrackingEvidence[] = (data?.evidence ?? []).map((e: any) => ({
    id: Number(e.id),
    type: e.mediaType,
    created: toDate(e.createdAt),
    source: sourceWithToken(`${route}/evidence/${e.id}`),
  }));
  return { status: String(data?.status ?? "").toLowerCase(), points, evidence };
};
