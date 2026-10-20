import api, { fuenteConToken } from "./api";
import { aFecha } from "./alert-tracking.service";

export type TipoGrabacion = "video" | "audio";

const MIME: Record<TipoGrabacion, string> = { video: "video/mp4", audio: "audio/mp4" };
const EXTENSION: Record<TipoGrabacion, string> = { video: "mp4", audio: "m4a" };

// Un trozo de 30 s puede pesar varios MB y la red durante una emergencia suele ser mala
const TIEMPO_SUBIDA_MS = 120000;

/** Sube un archivo grabado como evidencia de la alerta (lo ven sus contactos en el seguimiento). */
export async function subirEvidencia(alertaId: number, uri: string, tipo: TipoGrabacion): Promise<void> {
  const nombre = `${tipo}_${Date.now()}.${EXTENSION[tipo]}`;
  const form = new FormData();
  // React Native sube el archivo desde su ruta con { uri, name, type }
  form.append("file", { uri, name: nombre, type: MIME[tipo] } as any);
  form.append("alertId", String(alertaId));
  await api.post("/api/evidences/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: TIEMPO_SUBIDA_MS,
  });
}

/** Evidencia guardada de una alerta de la usuaria. */
export interface EvidenciaGuardada {
  id: number;
  tipo: "photo" | "video" | "audio" | "document";
  nombre: string;
  tamanoBytes: number | null;
  fecha: Date;
  tieneArchivo: boolean;
}

/** Evidencias de una alerta propia, de la más antigua a la más reciente (el backend las da todas juntas). */
export async function getEvidenciasDeAlerta(alertaId: number): Promise<EvidenciaGuardada[]> {
  const { data } = await api.get<any[]>("/api/evidences/me");
  return (data ?? [])
    .filter((e) => Number(e.alertId) === alertaId)
    .map((e) => ({
      id: Number(e.id),
      tipo: e.mediaType,
      nombre: e.fileName ?? `evidencia-${e.id}`,
      tamanoBytes: e.sizeBytes ?? null,
      fecha: aFecha(e.createdAt),
      tieneArchivo: !!e.hasFile,
    }))
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}

/** Fuente para reproducir el archivo de una evidencia (solo la dueña puede abrirlo). */
export const fuenteEvidencia = (id: number) => fuenteConToken(`/api/evidences/${id}/file`);
