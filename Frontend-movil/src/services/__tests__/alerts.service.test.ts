import api from "../api";
import { crearAlertaConReintentos } from "../alerts.service";

jest.mock("../api", () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn() } }));

const mockedApi = api as jest.Mocked<typeof api>;
const datos = { userProfileId: 1, deviceId: 2 };
const sinEspera = async () => {};
const sinRed = Object.assign(new Error("Network Error"), { response: undefined });
const conEstado = (status: number) => Object.assign(new Error(`HTTP ${status}`), { response: { status } });
const haceSegundos = (s: number) => new Date(Date.now() - s * 1000).toISOString().replace("Z", "");

describe("crearAlertaConReintentos", () => {
  beforeEach(() => jest.resetAllMocks());

  it("crea la alerta al primer intento sin consultar nada más", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: 10 } } as never);
    await expect(crearAlertaConReintentos(datos, { esperar: sinEspera })).resolves.toMatchObject({ id: 10 });
    expect(mockedApi.post).toHaveBeenCalledTimes(1);
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it("reintenta si no hay red o el servidor está despertando, y avisa cada intento", async () => {
    mockedApi.post
      .mockRejectedValueOnce(sinRed)
      .mockRejectedValueOnce(conEstado(503))
      .mockResolvedValueOnce({ data: { id: 11 } } as never);
    mockedApi.get.mockResolvedValue({ data: [] } as never);
    const intentos: number[] = [];

    const alerta = await crearAlertaConReintentos(datos, { esperar: sinEspera, alIntentar: (i) => intentos.push(i.intento) });

    expect(alerta.id).toBe(11);
    expect(intentos).toEqual([1, 2, 3]);
  });

  it("si el intento anterior sí llegó al servidor, reutiliza esa alerta en vez de crear otra", async () => {
    mockedApi.post.mockRejectedValueOnce(sinRed);
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 12, status: "active", startedAt: haceSegundos(20) }] } as never);

    await expect(crearAlertaConReintentos(datos, { esperar: sinEspera })).resolves.toMatchObject({ id: 12 });
    expect(mockedApi.post).toHaveBeenCalledTimes(1);
  });

  it("no reutiliza una alerta activa vieja", async () => {
    mockedApi.post.mockRejectedValueOnce(sinRed).mockResolvedValueOnce({ data: { id: 14 } } as never);
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 13, status: "active", startedAt: haceSegundos(3600) }] } as never);

    await expect(crearAlertaConReintentos(datos, { esperar: sinEspera })).resolves.toMatchObject({ id: 14 });
  });

  it("no reintenta errores de datos (4xx)", async () => {
    mockedApi.post.mockRejectedValueOnce(conEstado(400));
    await expect(crearAlertaConReintentos(datos, { esperar: sinEspera })).rejects.toThrow("HTTP 400");
    expect(mockedApi.post).toHaveBeenCalledTimes(1);
  });

  it("se rinde después del último intento con el último error", async () => {
    mockedApi.post.mockRejectedValue(sinRed);
    mockedApi.get.mockResolvedValue({ data: [] } as never);
    await expect(crearAlertaConReintentos(datos, { esperar: sinEspera })).rejects.toThrow("Network Error");
    expect(mockedApi.post).toHaveBeenCalledTimes(5);
  });
});
