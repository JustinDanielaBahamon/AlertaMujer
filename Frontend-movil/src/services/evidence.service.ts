import api, { sourceWithToken } from "./api";
import { toDate } from "./alert-tracking.service";

export type RecordingType = "video" | "audio";

const MIME: Record<RecordingType, string> = { video: "video/mp4", audio: "audio/mp4" };
const EXTENSION: Record<RecordingType, string> = { video: "mp4", audio: "m4a" };

// A 30 s chunk can weigh several MB and the network during an emergency is usually bad
const UPLOAD_TIME_MS = 120000;

/** Uploads a file recorded as alert evidence (her contacts see it in the tracking). */
export async function uploadEvidence(alertId: number, uri: string, type: RecordingType): Promise<void> {
  const name = `${type}_${Date.now()}.${EXTENSION[type]}`;
  const form = new FormData();
  // React Native uploads the file from its path with { uri, name, type }
  form.append("file", { uri, name: name, type: MIME[type] } as any);
  form.append("alertId", String(alertId));
  await api.post("/api/evidences/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: UPLOAD_TIME_MS,
  });
}

/** Saved evidence of one of the user's alerts. */
export interface SavedEvidence {
  id: number;
  type: "photo" | "video" | "audio" | "document";
  name: string;
  sizeBytes: number | null;
  date: Date;
  hasFile: boolean;
}

/** Evidence of one of her own alerts, from oldest to newest (the backend returns them all together). */
export async function getAlertEvidence(alertId: number): Promise<SavedEvidence[]> {
  const { data } = await api.get<any[]>("/api/evidences/me");
  return (data ?? [])
    .filter((e) => Number(e.alertId) === alertId)
    .map((e) => ({
      id: Number(e.id),
      type: e.mediaType,
      name: e.fileName ?? `evidencia-${e.id}`,
      sizeBytes: e.sizeBytes ?? null,
      date: toDate(e.createdAt),
      hasFile: !!e.hasFile,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Source to play an evidence file (only the owner can open it). */
export const evidenceSource = (id: number) => sourceWithToken(`/api/evidences/${id}/file`);
