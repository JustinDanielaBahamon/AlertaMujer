import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api";
import { limpiarColaUbicaciones, reportarUbicacion } from "../location-reporter.service";

jest.mock("../api", () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock("../devices.service", () => ({ idDispositivoActual: () => 4 }));

const post = api.post as jest.Mock;
const COLA_KEY = "@alerta-mujer:location-queue";
const leerCola = async () => JSON.parse((await AsyncStorage.getItem(COLA_KEY)) ?? "[]");
const sinConexion = () => Object.assign(new Error("Network Error"), { response: undefined });
const rechazo = (status: number) => Object.assign(new Error("HTTP"), { response: { status } });

describe("location-reporter.service", () => {
  beforeEach(async () => {
    post.mockReset();
    await AsyncStorage.clear();
  });

  it("envía la ubicación al backend con coordenadas redondeadas", async () => {
    post.mockResolvedValue({ data: {} });

    await reportarUbicacion({ latitude: 2.93012345678, longitude: -75.28111111, accuracy: 12.3456, alertId: 7 });

    expect(post).toHaveBeenCalledTimes(1);
    const [url, body] = post.mock.calls[0];
    expect(url).toBe("/api/location-logs");
    expect(body).toMatchObject({ latitude: 2.930123, longitude: -75.281111, accuracy: 12.35, alertId: 7, deviceId: 4 });
    expect(body.recordedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/); // UTC sin zona
  });

  it("guarda el punto en cola si no hay conexión", async () => {
    post.mockRejectedValue(sinConexion());

    await reportarUbicacion({ latitude: 1, longitude: 2 });

    const cola = await leerCola();
    expect(cola).toHaveLength(1);
    expect(cola[0]).toMatchObject({ latitude: 1, longitude: 2 });
  });

  it("no encola los puntos que el servidor rechaza (4xx)", async () => {
    post.mockRejectedValue(rechazo(400));

    await reportarUbicacion({ latitude: 1, longitude: 2 });

    expect(await leerCola()).toHaveLength(0);
  });

  it("al volver la conexión reenvía la cola con la hora original y la vacía", async () => {
    post.mockRejectedValueOnce(sinConexion());
    await reportarUbicacion({ latitude: 1, longitude: 1 });
    const horaOriginal = (await leerCola())[0].recordedAt;

    post.mockResolvedValue({ data: {} });
    await reportarUbicacion({ latitude: 2, longitude: 2 });

    // Llamadas: 1) punto 1 falla, 2) punto 2 se envía, 3) se reenvía el punto 1 de la cola
    const enviosPunto1 = post.mock.calls.filter(([, body]) => body.latitude === 1);
    expect(enviosPunto1).toHaveLength(2);
    expect(post.mock.calls.at(-1)?.[1]).toMatchObject({ latitude: 1, recordedAt: horaOriginal });
    expect(await leerCola()).toHaveLength(0);
  });

  it("limita la cola a los 100 puntos más recientes", async () => {
    post.mockRejectedValue(sinConexion());

    for (let i = 0; i < 105; i++) await reportarUbicacion({ latitude: i, longitude: 0 });

    const cola = await leerCola();
    expect(cola).toHaveLength(100);
    expect(cola[0].latitude).toBe(5);
    expect(cola.at(-1).latitude).toBe(104);
  });

  it("limpiarColaUbicaciones borra la cola (cierre de sesión)", async () => {
    post.mockRejectedValue(sinConexion());
    await reportarUbicacion({ latitude: 1, longitude: 1 });

    await limpiarColaUbicaciones();

    expect(await leerCola()).toHaveLength(0);
  });
});
