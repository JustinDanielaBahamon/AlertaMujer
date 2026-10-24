import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import api, { listenSession, publicSource, setAuthToken, setRefreshToken, sourceWithToken, tokenTimeLeftMs } from "../api";

jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: {} } }));

const response = (config: InternalAxiosRequestConfig, status: number, data: unknown = {}) => {
  const r = { data, status, statusText: "", headers: {}, config };
  return status >= 400
    ? Promise.reject(Object.assign(new Error(`HTTP ${status}`), { config, response: r, isAxiosError: true }))
    : Promise.resolve(r);
};

describe("api · sesión", () => {
  const renewed = jest.fn();
  const expired = jest.fn();
  let leave: () => void;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    renewed.mockReset();
    expired.mockReset();
    leave = listenSession({ renewed, expired });
    setAuthToken("vencido");
  });

  afterEach(() => leave());

  it("con el token vencido lo renueva y repite la petición", async () => {
    setRefreshToken("refresh-ok");
    jest.spyOn(axios, "post").mockResolvedValue({ data: { token: "nuevo" } });
    const adapter: AxiosAdapter = (config) =>
      response(config, config.headers.Authorization === "Bearer nuevo" ? 200 : 401, { ok: true });
    api.defaults.adapter = adapter;

    const r = await api.get("/api/alerts/me");

    expect(r.data).toEqual({ ok: true });
    expect(renewed).toHaveBeenCalledWith("nuevo");
    expect(expired).not.toHaveBeenCalled();
  });

  it("si el refresh token ya no sirve, avisa que la sesión expiró", async () => {
    setRefreshToken("refresh-vencido");
    jest.spyOn(axios, "post").mockRejectedValue({ response: { status: 401 } });
    api.defaults.adapter = (config) => response(config, 401);

    await expect(api.get("/api/alerts/me")).rejects.toThrow();
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it("sin conexión al renovar no cierra la sesión", async () => {
    setRefreshToken("refresh-ok");
    jest.spyOn(axios, "post").mockRejectedValue(new Error("Network Error"));
    api.defaults.adapter = (config) => response(config, 401);

    await expect(api.get("/api/alerts/me")).rejects.toThrow();
    expect(expired).not.toHaveBeenCalled();
  });

  it("un 401 del inicio de sesión no intenta renovar", async () => {
    const post = jest.spyOn(axios, "post");
    api.defaults.adapter = (config) => response(config, 401);

    await expect(api.post("/api/auth/login", {})).rejects.toThrow();
    expect(post).not.toHaveBeenCalled();
    expect(expired).not.toHaveBeenCalled();
  });
});

describe("api · fuentes para el reproductor", () => {
  it("la evidencia pública del contacto va sin cabecera de sesión (el enlace firmado la rechaza)", () => {
    setAuthToken("con-sesion");
    const route = "/api/public/tracking/abc/evidence/5";
    expect(publicSource(route)).toEqual({ uri: expect.stringMatching(/\/api\/public\/tracking\/abc\/evidence\/5$/) });
    expect(publicSource(route)).not.toHaveProperty("headers");
    expect(sourceWithToken("/api/evidences/5/file").headers).toEqual({ Authorization: "Bearer con-sesion" });
  });
});

describe("api · tokenTimeLeftMs", () => {
  const jwt = (payload: object) => `x.${btoa(JSON.stringify(payload)).replace(/=+$/, "")}.y`;

  it("reads the expiry of the session token", () => {
    expect(tokenTimeLeftMs(jwt({ exp: 1_000 }), 400_000)).toBe(600_000);
  });

  it("is 0 when expired or unreadable", () => {
    expect(tokenTimeLeftMs(jwt({ exp: 1 }), 400_000)).toBe(0);
    expect(tokenTimeLeftMs("no-es-jwt")).toBe(0);
    expect(tokenTimeLeftMs(null)).toBe(0);
  });
});
