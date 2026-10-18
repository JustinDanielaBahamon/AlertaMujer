import api from "../api";
import { aMensaje, enviarMensaje, leerMensajes } from "../alert-chat.service";

jest.mock("../api", () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));

const mockedApi = api as jest.Mocked<typeof api>;

describe("alert-chat.service", () => {
  beforeEach(() => jest.clearAllMocks());

  it("marca como de ella los mensajes de la dueña y lee la hora en UTC", () => {
    const m = aMensaje({
      id: 3,
      senderType: "owner",
      senderName: "Ella",
      body: "No puedo hablar",
      createdAt: "2026-10-18T15:00:00",
    });
    expect(m).toMatchObject({ id: 3, deElla: true, nombre: "Ella", texto: "No puedo hablar" });
    expect(m.hora.toISOString()).toBe("2026-10-18T15:00:00.000Z");
    expect(aMensaje({ id: 4, senderType: "contact" }).deElla).toBe(false);
  });

  it("la dueña lee y escribe con su alerta", async () => {
    mockedApi.get.mockResolvedValue({ data: [] } as any);
    mockedApi.post.mockResolvedValue({ data: { id: 1, senderType: "owner", body: "hola" } } as any);
    const p = { tipo: "duena" as const, alertaId: 37 };

    await leerMensajes(p, 5);
    await enviarMensaje(p, "hola");

    expect(mockedApi.get).toHaveBeenCalledWith("/api/alerts/37/messages", { params: { after: 5 } });
    expect(mockedApi.post).toHaveBeenCalledWith("/api/alerts/37/messages", { body: "hola" });
  });

  it("el contacto usa el código del seguimiento y manda su nombre", async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 2, senderType: "contact", body: "Voy en camino" } } as any);

    const m = await enviarMensaje({ tipo: "contacto", codigo: "abc", nombre: "Sofía" }, "Voy en camino");

    expect(mockedApi.post).toHaveBeenCalledWith("/api/public/tracking/abc/messages", {
      name: "Sofía",
      body: "Voy en camino",
    });
    expect(m.deElla).toBe(false);
  });
});
