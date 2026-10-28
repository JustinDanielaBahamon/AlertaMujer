import AsyncStorage from "@react-native-async-storage/async-storage";

import ShakeSensor from "../../../modules/shake-sensor";
import { uploadEvidence, type RecordingType } from "../../services/evidence.service";

/**
 * Queue of recorded chunks to upload. It is stored on the phone so that, if there is no signal or the app
 * closes, the files are uploaded later instead of being lost. It uploads one at a time and retries.
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

// A single shared read: two chunks arriving together must not create two different queues
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

/** Adds a finished file and starts uploading it. */
export async function enqueueChunk(chunk: PendingChunk): Promise<void> {
  const current = await load();
  if (!current.some((t) => t.uri === chunk.uri)) {
    current.push(chunk);
    await save();
  }
  notify();
  void processQueue();
}

/** Errors that retrying does not fix (file rejected, alert of someone else or deleted). */
function isPermanent(error: any): boolean {
  const status = error?.response?.status;
  return typeof status === "number" && status >= 400 && status < 500 && ![401, 408, 429].includes(status);
}

export async function processQueue(): Promise<void> {
  // The flag goes before any await: two calls at once would upload the same file
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
      // With a bad signal the audios go first: they weigh much less than video and are the proof that
      // survives a dark video or a phone in a pocket
      const audioIndex = current.findIndex((t) => t.tipo === "audio");
      const index = audioIndex >= 0 ? audioIndex : 0;
      const chunk = current[index];
      let accepted = true;
      try {
        await uploadEvidence(chunk.alertaId, chunk.uri, chunk.tipo);
        uploaded++;
      } catch (e) {
        if (!isPermanent(e)) {
          // No signal or the server is asleep: retried in a while without losing the file
          retry = setTimeout(() => void processQueue(), RETRY_MS);
          return;
        }
        accepted = false;
        console.warn("Evidencia rechazada por el servidor, se descarta:", (e as any)?.response?.status);
      }
      current.splice(index, 1);
      await save();
      keepOrDelete(chunk, accepted);
      notify();
    }
  } finally {
    uploading = false;
    notify();
  }
}

/**
 * An uploaded chunk stays as a private copy inside the app (she downloads or shares it from the
 * history when she decides); a rejected one is deleted.
 */
function keepOrDelete(chunk: PendingChunk, accepted: boolean) {
  try {
    const kept =
      accepted && typeof ShakeSensor.keepEvidence === "function"
        ? ShakeSensor.keepEvidence(chunk.uri, chunk.alertaId)
        : null;
    if (!kept) ShakeSensor.deleteFile(chunk.uri);
  } catch {
    // If it cannot be moved or deleted, Android cleans the cache by itself
  }
}

// Audio chunks come from the native service, also after leaving the alert
// screen (the last chunk closes on stop): that is why they are listened to here and not on the screen.
let audioAlert: number | null = null;
let audioListener: { remove: () => void } | null = null;

/** The next audio chunks (and the ones left without uploading) belong to this alert. */
export function setAudioAlert(alertId: number): void {
  audioAlert = alertId;
  audioListener ??= ShakeSensor.addListener("onAudioChunk", ({ uri }) => {
    if (audioAlert !== null) void enqueueChunk({ uri, alertaId: audioAlert, tipo: "audio" });
  });
  // Audios that were recorded but did not reach the queue (the app closed in the middle of the alert)
  for (const uri of ShakeSensor.pendingAudios()) {
    void enqueueChunk({ uri, alertaId: alertId, tipo: "audio" });
  }
}

/** Tests only. */
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
