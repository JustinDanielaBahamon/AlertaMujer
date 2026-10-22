import AsyncStorage from "@react-native-async-storage/async-storage";

import SensorSacudidas from "../../../modules/sensor-sacudidas";
import { uploadEvidence, type RecordingType } from "../../services/evidencias.service";

/**
 * Cola de trozos grabados por subir. Se guarda en el teléfono para que, si no hay señal o la app
 * se cierra, los archivos se suban después en vez de perderse. Sube de a uno y reintenta.
 */
export type PendingChunk = {
  uri: string;
  alertaId: number;
  tipo: RecordingType;
};
export type UploadStatus = {
  uploaded: number;
  pendingItems: number;
  uploading: boolean;
};

const KEY = "alertamujer_evidencias_pendientes";
const RETRY_MS = 15000;

let cola: PendingChunk[] | null = null;
let uploaded = 0;
let uploading = false;
let retry: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<(e: UploadStatus) => void>();

let loading: Promise<PendingChunk[]> | null = null;

// Una sola lectura compartida: dos trozos que llegan juntos no deben crear dos colas distintas
function load(): Promise<PendingChunk[]> {
  if (cola) return Promise.resolve(cola);
  loading ??= AsyncStorage.getItem(KEY)
    .then((raw) => (raw ? (JSON.parse(raw) as PendingChunk[]) : []))
    .catch(() => [] as PendingChunk[])
    .then((read) => (cola ??= read));
  return loading;
}

async function save() {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(cola ?? []));
  } catch (e) {
    console.warn("No se pudo guardar la cola de evidencias:", e);
  }
}

function notify() {
  const status = uploadStatus();
  listeners.forEach((o) => o(status));
}

export function uploadStatus(): UploadStatus {
  return { uploaded, pendingItems: cola?.length ?? 0, uploading };
}

export function listenUploads(listener: (e: UploadStatus) => void): () => void {
  listeners.add(listener);
  listener(uploadStatus());
  return () => {
    listeners.delete(listener);
  };
}

/** Agrega un archivo terminado y empieza a subirlo. */
export async function enqueueChunk(chunk: PendingChunk): Promise<void> {
  const current = await load();
  if (!current.some((t) => t.uri === chunk.uri)) {
    current.push(chunk);
    await save();
  }
  notify();
  void processQueue();
}

/** Errores que no se arreglan reintentando (archivo rechazado, alerta ajena o borrada). */
function isPermanent(error: any): boolean {
  const status = error?.response?.status;
  return typeof status === "number" && status >= 400 && status < 500 && ![401, 408, 429].includes(status);
}

export async function processQueue(): Promise<void> {
  // La marca va antes de cualquier await: dos llamadas a la vez subirían el mismo archivo
  if (uploading) return;
  uploading = true;
  try {
    const current = await load();
    if (current.length === 0) return;
    if (retry) {
      clearTimeout(retry);
      retry = null;
    }
    notify();
    while (current.length > 0) {
      const chunk = current[0];
      try {
        await uploadEvidence(chunk.alertaId, chunk.uri, chunk.tipo);
        uploaded++;
      } catch (e) {
        if (!isPermanent(e)) {
          // Sin señal o servidor dormido: se reintenta en un rato sin perder el archivo
          retry = setTimeout(() => void processQueue(), RETRY_MS);
          return;
        }
        console.warn("Evidencia rechazada por el servidor, se descarta:", (e as any)?.response?.status);
      }
      current.shift();
      await save();
      try {
        SensorSacudidas.borrarArchivo(chunk.uri);
      } catch {
        // Si no se puede borrar, Android limpia el caché por su cuenta
      }
      notify();
    }
  } finally {
    uploading = false;
    notify();
  }
}

// Los trozos de audio llegan del servicio nativo, también después de salir de la pantalla de la
// alerta (el último trozo se cierra al detener): por eso se escuchan aquí y no en la pantalla.
let audioAlert: number | null = null;
let audioListener: { remove: () => void } | null = null;

/** Los próximos trozos de audio (y los que quedaron sin subir) son de esta alerta. */
export function setAudioAlert(alertId: number): void {
  audioAlert = alertId;
  audioListener ??= SensorSacudidas.addListener("onTrozoAudio", ({ uri }) => {
    if (audioAlert !== null) void enqueueChunk({ uri, alertaId: audioAlert, tipo: "audio" });
  });
  // Audios que se grabaron pero no llegaron a la cola (la app se cerró a mitad de la alerta)
  for (const uri of SensorSacudidas.audiosPendientes()) {
    void enqueueChunk({ uri, alertaId: alertId, tipo: "audio" });
  }
}

/** Solo para pruebas. */
export function _resetQueue() {
  cola = null;
  loading = null;
  uploaded = 0;
  uploading = false;
  if (retry) clearTimeout(retry);
  retry = null;
  listeners.clear();
  audioListener?.remove();
  audioListener = null;
  audioAlert = null;
}
