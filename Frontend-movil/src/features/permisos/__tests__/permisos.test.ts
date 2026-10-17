jest.mock("@notifee/react-native", () => ({
  __esModule: true,
  default: {
    getNotificationSettings: jest.fn(async () => ({ authorizationStatus: 1 })),
    requestPermission: jest.fn(async () => ({ authorizationStatus: 0 })),
    openNotificationSettings: jest.fn(async () => {}),
  },
  AuthorizationStatus: { DENIED: 0, AUTHORIZED: 1 },
}));
jest.mock("expo-camera", () => ({
  Camera: {
    getMicrophonePermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
    getCameraPermissionsAsync: jest.fn(async () => ({ granted: false, canAskAgain: false })),
    requestMicrophonePermissionsAsync: jest.fn(async () => ({})),
    requestCameraPermissionsAsync: jest.fn(async () => ({})),
  },
}));
jest.mock("expo-contacts", () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({})),
}));
jest.mock("expo-location", () => ({
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: false, canAskAgain: true })),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true })),
}));
jest.mock("../../../../modules/sensor-sacudidas", () => ({
  __esModule: true,
  default: {
    ignoraOptimizacionBateria: jest.fn(() => false),
    pedirIgnorarOptimizacionBateria: jest.fn(),
    puedePantallaCompleta: jest.fn(() => false),
    pedirPantallaCompleta: jest.fn(),
    tieneAjusteInicioAutomatico: jest.fn(() => true),
    abrirInicioAutomatico: jest.fn(() => true),
  },
}));

import notifee from "@notifee/react-native";
import * as Location from "expo-location";
import { Linking, Platform } from "react-native";
import { activarPermiso, faltantesCriticos, revisarPermisos } from "../permisos";

describe("permisos", () => {
  beforeAll(() => {
    Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
  });

  it("detecta lo crítico que falta: agitar apagado, ubicación y batería", async () => {
    const estados = await revisarPermisos(false);

    expect(estados.notificaciones.concedido).toBe(true);
    expect(estados.camara).toEqual({ concedido: false, puedePreguntar: false });
    expect(faltantesCriticos(estados).map((p) => p.id)).toEqual(["agitar", "ubicacion", "bateria", "pantallaCompleta"]);
    // El inicio automático no se puede leer: queda "por revisar", no como faltante
    expect(estados.inicioAutomatico.concedido).toBeNull();
  });

  it("si el teléfono ya cortó la protección, el inicio automático falta", async () => {
    const estados = await revisarPermisos(true, 2);
    expect(estados.inicioAutomatico.concedido).toBe(false);
  });

  it("pide el permiso si Android todavía deja preguntar", async () => {
    await activarPermiso("ubicacion", { concedido: false, puedePreguntar: true });
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it("abre los ajustes de la app si Android ya no deja preguntar", async () => {
    const abrir = jest.spyOn(Linking, "openSettings").mockResolvedValue(undefined as never);
    await activarPermiso("camara", { concedido: false, puedePreguntar: false });
    expect(abrir).toHaveBeenCalled();
  });

  it("si la usuaria rechaza las notificaciones, abre sus ajustes", async () => {
    (notifee.getNotificationSettings as jest.Mock).mockResolvedValueOnce({ authorizationStatus: 0 });
    await activarPermiso("notificaciones", { concedido: false, puedePreguntar: true });
    expect(notifee.openNotificationSettings).toHaveBeenCalled();
  });
});
