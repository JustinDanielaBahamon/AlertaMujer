import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import api, { escucharSesion, setAuthToken, setRefreshToken } from "../api";

jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: {} } }));

const respuesta = (config: InternalAxiosRequestConfig, status: number, data: unknown = {}) => {
  const r = { data, status, statusText: "", headers: {}, config };
  return status >= 400
    ? Promise.reject(Object.assign(new Error(`HTTP ${status}`), { config, response: r, isAxiosError: true }))
    : Promise.resolve(r);
};

describe("api · sesión", () => {
  const renovado = jest.fn();
  const expirada = jest.fn();
  let dejar: () => void;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    renovado.mockReset();
    expirada.mockReset();
    dejar = escucharSesion({ renovado, expirada });
    setAuthToken("vencido");
  });

  afterEach(() => dejar());

  it("con el token vencido lo renueva y repite la petición", async () => {
    setRefreshToken("refresh-ok");
    jest.spyOn(axios, "post").mockResolvedValue({ data: { token: "nuevo" } });
    const adapter: AxiosAdapter = (config) =>
      respuesta(config, config.headers.Authorization === "Bearer nuevo" ? 200 : 401, { ok: true });
    api.defaults.adapter = adapter;

    const r = await api.get("/api/alerts/me");

    expect(r.data).toEqual({ ok: true });
    expect(renovado).toHaveBeenCalledWith("nuevo");
    expect(expirada).not.toHaveBeenCalled();
  });

  it("si el refresh token ya no sirve, avisa que la sesión expiró", async () => {
    setRefreshToken("refresh-vencido");
    jest.spyOn(axios, "post").mockRejectedValue({ response: { status: 401 } });
    api.defaults.adapter = (config) => respuesta(config, 401);

    await expect(api.get("/api/alerts/me")).rejects.toThrow();
    expect(expirada).toHaveBeenCalledTimes(1);
  });

  it("sin conexión al renovar no cierra la sesión", async () => {
    setRefreshToken("refresh-ok");
    jest.spyOn(axios, "post").mockRejectedValue(new Error("Network Error"));
    api.defaults.adapter = (config) => respuesta(config, 401);

    await expect(api.get("/api/alerts/me")).rejects.toThrow();
    expect(expirada).not.toHaveBeenCalled();
  });

  it("un 401 del inicio de sesión no intenta renovar", async () => {
    const post = jest.spyOn(axios, "post");
    api.defaults.adapter = (config) => respuesta(config, 401);

    await expect(api.post("/api/auth/login", {})).rejects.toThrow();
    expect(post).not.toHaveBeenCalled();
    expect(expirada).not.toHaveBeenCalled();
  });
});
