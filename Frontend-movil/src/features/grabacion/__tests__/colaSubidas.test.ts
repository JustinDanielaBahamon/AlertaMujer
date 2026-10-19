import AsyncStorage from "@react-native-async-storage/async-storage";

import SensorSacudidas from "../../../../modules/sensor-sacudidas";
import { subirEvidencia } from "../../../services/evidencias.service";
import { _reiniciarCola, asignarAlertaDelAudio, encolarTrozo, estadoSubidas, procesarCola } from "../colaSubidas";

jest.mock("@react-native-async-storage/async-storage", () => {
  let datos: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => datos[k] ?? null),
      setItem: jest.fn(async (k: string, v: string) => {
        datos[k] = v;
      }),
      _limpiar: () => {
        datos = {};
      },
    },
  };
});

let mockTrozo: ((t: { uri: string; duracionMs: number }) => void) | null = null;
jest.mock("../../../../modules/sensor-sacudidas", () => ({
  __esModule: true,
  default: {
    borrarArchivo: jest.fn(() => true),
    audiosPendientes: jest.fn(() => []),
    addListener: jest.fn((_e: string, l) => {
      mockTrozo = l;
      return { remove: () => (mockTrozo = null) };
    }),
  },
}));

jest.mock("../../../services/evidencias.service", () => ({ subirEvidencia: jest.fn() }));

const subir = subirEvidencia as jest.Mock;
const sensor = SensorSacudidas as unknown as Record<string, jest.Mock>;
const esperarCola = () => new Promise((r) => setTimeout(r, 0));

describe("colaSubidas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _reiniciarCola();
    (AsyncStorage as any)._limpiar();
  });

  it("sube cada trozo, lo borra del teléfono y cuenta los enviados", async () => {
    subir.mockResolvedValue(undefined);

    await encolarTrozo({ uri: "file:///cache/a.mp4", alertaId: 7, tipo: "video" });
    await procesarCola();
    await esperarCola();

    expect(subir).toHaveBeenCalledWith(7, "file:///cache/a.mp4", "video");
    expect(sensor.borrarArchivo).toHaveBeenCalledWith("file:///cache/a.mp4");
    expect(estadoSubidas()).toMatchObject({ subidos: 1, pendientes: 0 });
  });

  it("sin señal conserva el archivo para reintentar", async () => {
    jest.useFakeTimers();
    subir.mockRejectedValueOnce(new Error("Network Error")).mockResolvedValue(undefined);

    await encolarTrozo({ uri: "file:///cache/b.m4a", alertaId: 7, tipo: "audio" });
    await procesarCola();
    expect(estadoSubidas().pendientes).toBe(1);
    expect(sensor.borrarArchivo).not.toHaveBeenCalled();
    expect(JSON.parse((await AsyncStorage.getItem("alertamujer_evidencias_pendientes"))!)).toHaveLength(1);

    jest.advanceTimersByTime(15000);
    jest.useRealTimers();
    await esperarCola();
    await procesarCola();
    expect(estadoSubidas()).toMatchObject({ subidos: 1, pendientes: 0 });
  });

  it("descarta lo que el servidor rechaza para no trabar la cola", async () => {
    subir.mockRejectedValueOnce({ response: { status: 400 } }).mockResolvedValue(undefined);

    await encolarTrozo({ uri: "file:///cache/malo.mp4", alertaId: 7, tipo: "video" });
    await encolarTrozo({ uri: "file:///cache/bueno.mp4", alertaId: 7, tipo: "video" });
    await procesarCola();
    await esperarCola();

    expect(estadoSubidas()).toMatchObject({ subidos: 1, pendientes: 0 });
  });

  it("los audios del servicio nativo se suben con la alerta asignada, también los que quedaron", async () => {
    subir.mockResolvedValue(undefined);
    sensor.audiosPendientes.mockReturnValue(["file:///cache/evidencias/viejo.m4a"]);

    asignarAlertaDelAudio(9);
    mockTrozo?.({ uri: "file:///cache/evidencias/nuevo.m4a", duracionMs: 30000 });
    await esperarCola();
    await procesarCola();
    await esperarCola();

    expect(subir).toHaveBeenCalledWith(9, "file:///cache/evidencias/viejo.m4a", "audio");
    expect(subir).toHaveBeenCalledWith(9, "file:///cache/evidencias/nuevo.m4a", "audio");
  });
});
