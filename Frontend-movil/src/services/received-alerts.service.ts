import api from "./api";
import { toDate } from "./alert-tracking.service";

/** Alert of another person who has the user as an emergency contact. */
export interface ReceivedAlert {
  id: number;
  name: string;
  active: boolean;
  status: string; // "active" | "resolved" | "cancelled" ...
  startTime: Date | null;
  end: Date | null;
  trackingAvailable: boolean;
}

export async function getReceivedAlerts(): Promise<ReceivedAlert[]> {
  const { data } = await api.get<any[]>("/api/received-alerts");
  return (data ?? []).map((a) => ({
    id: Number(a.alertId),
    name: a.firstName || "",
    active: !!a.active,
    status: a.status ?? "",
    startTime: a.startedAt ? toDate(a.startedAt) : null,
    end: a.endedAt ? toDate(a.endedAt) : null,
    trackingAvailable: !!a.trackingAvailable,
  }));
}

/** Public tracking code to open the alert (only while the tracking is still valid). */
export async function getTrackingCode(alertId: number): Promise<string> {
  const { data } = await api.post<{ code: string }>(`/api/received-alerts/${alertId}/tracking`, {});
  return data.code;
}
