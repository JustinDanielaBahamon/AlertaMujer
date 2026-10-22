import api from "../api";
import { iniciarTrayecto, trayectoActivo } from "../safe-trips.service";

jest.mock("../api", () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));

const mockedApi = api as jest.Mocked<typeof api>;

describe("safe-trips.service", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sin trayecto en curso (204) devuelve null", async () => {
    mockedApi.get.mockResolvedValueOnce({ status: 204, data: "" } as never);
    await expect(trayectoActivo()).resolves.toBeNull();
  });

  it("envía destino, minutos y celular, y lee las horas en UTC", async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { id: 3, destination: "Casa", startedAt: "2026-10-21T20:00:00", expectedArrival: "2026-10-21T20:30:00", status: "active" },
    } as never);

    const t = await iniciarTrayecto({ destino: "Casa", minutos: 30, deviceId: 9 });

    expect(mockedApi.post).toHaveBeenCalledWith("/api/safe-trips", {
      destination: "Casa", minutes: 30, deviceId: 9, latitude: undefined, longitude: undefined,
    });
    expect(t).toMatchObject({ id: 3, destino: "Casa", estado: "active" });
    expect(t.llegada.toISOString()).toBe("2026-10-21T20:30:00.000Z");
  });
});
