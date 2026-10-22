import api, { sourceWithToken } from "./api";
import { toDate } from "./alert-tracking.service";

export type RecordingType = "video" | "audio";

const MIME: Record<RecordingType, string> = { video: "video/mp4", audio: "audio/mp4" };
const EXTENSION: Record<RecordingType, string> = { video: "mp4", audio: "m4a" };

// Un trozo de 30 s puede pesar varios MB y la red durante una emergencia suele ser mala
const UPLOAD_TIME_MS = 120000;

/** Sube un archivo grabado como evidencia de la alerta (lo ven sus contactos en el seguimiento). */
export async function uploadEvidence(alertId: number, uri: string, type: RecordingType): Promise<void> {
  const name = `${type}_${Date.now()}.${EXTENSION[type]}`;
  const form = new FormData();
  // React Native sube el archivo desde su ruta con { uri, name, type }
  form.append("file", { uri, name: name, type: MIME[type] } as any);
  form.append("alertId", String(alertId));
  await api.post("/api/evidences/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: UPLOAD_TIME_MS,
  });
}

/** Evidencia guardada de una alerta de la usuaria. */
export interface SavedEvidence {
  id: number;
  type: "photo" | "video" | "audio" | "document";
  name: string;
  sizeBytes: number | null;
  date: Date;
  hasFile: boolean;
}

/** Evidencias de una alerta propia, de la más antigua a la más reciente (el backend las da todas juntas). */
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

/** Fuente para reproducir el archivo de una evidencia (solo la dueña puede abrirlo). */
export const evidenceSource = (id: number) => sourceWithToken(`/api/evidences/${id}/file`);
