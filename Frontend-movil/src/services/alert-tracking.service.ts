import * as Application from "expo-application";
import api, { publicSource } from "./api";
import type { AlertApi } from "./alerts.service";

export interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  recordedAt: Date;
}

export interface AlertTracking {
  status: string; // "active" | "cancelled" | "resolved" ...
  points: LocationPoint[]; // sorted from oldest to newest
  alert?: AlertApi; // full data (only for the alert owner)
  /** Alert recordings (the contact's public tracking), from oldest to newest. */
  evidence?: TrackingEvidence[];
  /** What the contact must know while it goes on: unanswered, signal_lost or duress (null = none). */
  warning?: string | null;
}

export interface TrackingEvidence {
  id: number;
  type: "video" | "audio" | "photo" | "document";
  created: Date;
  /** Source for the player (the public endpoint needs no session). */
  source: { uri: string; headers: Record<string, string> };
}

/** Anonymous identifier of this app to count who viewed the alert (no personal data). */
function visitorId(): string {
  try {
    const id = Application.getAndroidId();
    if (id) return `app-${id}`;
  } catch {
    // no ANDROID_ID: a generic one is used
  }
  return "app-sin-identificador";
}

// The backend returns LocalDateTime in UTC without 'Z' (same as in alerts.service.ts).
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
    // Alert location history endpoint (pending in the backend).
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
    // If the endpoint does not exist yet, only the location the alert was created with is used.
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
 * Tracking for an emergency contact: uses the public endpoint with the code that arrives in
 * the push (a contact cannot read another person's alert through /api/alerts/{id}).
 */
/**
 * delivery: the push delivery that brought her here (envioId); sent only on the first query so the
 * user's history shows that this contact saw the alert.
 */
export const getPublicTracking = async (code: string, delivery?: string | null): Promise<AlertTracking> => {
  const route = `/api/public/tracking/${encodeURIComponent(code)}`;
  const params: Record<string, string> = { v: visitorId() };
  if (delivery && /^\d+$/.test(delivery)) params.c = delivery;
  const { data } = await api.get<any>(route, { params });
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
    source: publicSource(`${route}/evidence/${e.id}`),
  }));
  return { status: String(data?.status ?? "").toLowerCase(), points, evidence, warning: data?.warning ?? null };
};

/** The alert push reached this phone: the user's history shows that delivery as received. */
export async function confirmAlertReceived(code: string, delivery: string | undefined): Promise<void> {
  if (!delivery || !/^\d+$/.test(delivery)) return;
  try {
    await api.post(`/api/public/tracking/${encodeURIComponent(code)}/received`, null, { params: { c: delivery } });
  } catch {
    // Offline or server asleep: it is only a receipt, the alarm already sounded
  }
}
