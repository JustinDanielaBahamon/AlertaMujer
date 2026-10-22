import AsyncStorage from "@react-native-async-storage/async-storage";

import SensorSacudidas from "../../../../modules/sensor-sacudidas";
import { uploadEvidence } from "../../../services/evidencias.service";
import { _resetQueue, setAudioAlert, enqueueChunk, uploadStatus, processQueue } from "../colaSubidas";

jest.mock("@react-native-async-storage/async-storage", () => {
  let data: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => data[k] ?? null),
      setItem: jest.fn(async (k: string, v: string) => {
        data[k] = v;
      }),
      _clear: () => {
        data = {};
      },
    },
  };
});

let mockChunk: ((t: { uri: string; durationMs: number }) => void) | null = null;
jest.mock("../../../../modules/sensor-sacudidas", () => ({
  __esModule: true,
  default: {
    borrarArchivo: jest.fn(() => true),
    audiosPendientes: jest.fn(() => []),
    addListener: jest.fn((_e: string, l) => {
      mockChunk = l;
      return { remove: () => (mockChunk = null) };
    }),
  },
}));

jest.mock("../../../services/evidencias.service", () => ({ uploadEvidence: jest.fn() }));

const upload = uploadEvidence as jest.Mock;
const sensor = SensorSacudidas as unknown as Record<string, jest.Mock>;
const waitQueue = () => new Promise((r) => setTimeout(r, 0));

describe("colaSubidas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetQueue();
    (AsyncStorage as any)._clear();
  });

  it("sube cada trozo, lo borra del teléfono y cuenta los enviados", async () => {
    upload.mockResolvedValue(undefined);

    await enqueueChunk({ uri: "file:///cache/a.mp4", alertaId: 7, tipo: "video" });
    await processQueue();
    await waitQueue();

    expect(upload).toHaveBeenCalledWith(7, "file:///cache/a.mp4", "video");
    expect(sensor.borrarArchivo).toHaveBeenCalledWith("file:///cache/a.mp4");
    expect(uploadStatus()).toMatchObject({ uploaded: 1, pendingItems: 0 });
  });

  it("sin señal conserva el archivo para reintentar", async () => {
    jest.useFakeTimers();
    upload.mockRejectedValueOnce(new Error("Network Error")).mockResolvedValue(undefined);

    await enqueueChunk({ uri: "file:///cache/b.m4a", alertaId: 7, tipo: "audio" });
    await processQueue();
    expect(uploadStatus().pendingItems).toBe(1);
    expect(sensor.borrarArchivo).not.toHaveBeenCalled();
    expect(JSON.parse((await AsyncStorage.getItem("alertamujer_evidencias_pendientes"))!)).toHaveLength(1);

    jest.advanceTimersByTime(15000);
    jest.useRealTimers();
    await waitQueue();
    await processQueue();
    expect(uploadStatus()).toMatchObject({ uploaded: 1, pendingItems: 0 });
  });

  it("descarta lo que el servidor rechaza para no trabar la cola", async () => {
    upload.mockRejectedValueOnce({ response: { status: 400 } }).mockResolvedValue(undefined);

    await enqueueChunk({ uri: "file:///cache/malo.mp4", alertaId: 7, tipo: "video" });
    await enqueueChunk({ uri: "file:///cache/bueno.mp4", alertaId: 7, tipo: "video" });
    await processQueue();
    await waitQueue();

    expect(uploadStatus()).toMatchObject({ uploaded: 1, pendingItems: 0 });
  });

  it("los audios del servicio nativo se suben con la alerta asignada, también los que quedaron", async () => {
    upload.mockResolvedValue(undefined);
    sensor.audiosPendientes.mockReturnValue(["file:///cache/evidencias/viejo.m4a"]);

    setAudioAlert(9);
    mockChunk?.({ uri: "file:///cache/evidencias/nuevo.m4a", durationMs: 30000 });
    await waitQueue();
    await processQueue();
    await waitQueue();

    expect(upload).toHaveBeenCalledWith(9, "file:///cache/evidencias/viejo.m4a", "audio");
    expect(upload).toHaveBeenCalledWith(9, "file:///cache/evidencias/nuevo.m4a", "audio");
  });
});
