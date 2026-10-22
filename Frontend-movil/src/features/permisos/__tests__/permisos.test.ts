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
jest.mock("../../../services/push.service", () => ({ registrarPush: jest.fn(async () => {}) }));
jest.mock("../../../services/devices.service", () => ({ reportPermissions: jest.fn(async () => {}) }));
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
import { grantPermission, missingCritical, checkPermissions } from "../permisos";

describe("permisos", () => {
  beforeAll(() => {
    Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
  });

  it("detecta lo crítico que falta: agitar apagado, ubicación y batería", async () => {
    const statuses = await checkPermissions(false);

    expect(statuses.notificaciones.granted).toBe(true);
    expect(statuses.camara).toEqual({ granted: false, canAsk: false });
    expect(missingCritical(statuses).map((p) => p.id)).toEqual(["agitar", "ubicacion", "bateria", "pantallaCompleta"]);
    // El inicio automático no se puede leer: queda "por revisar", no como faltante
    expect(statuses.inicioAutomatico.granted).toBeNull();
  });

  it("si el teléfono ya cortó la protección, el inicio automático falta", async () => {
    const statuses = await checkPermissions(true, 2);
    expect(statuses.inicioAutomatico.granted).toBe(false);
  });

  it("pide el permiso si Android todavía deja preguntar", async () => {
    await grantPermission("ubicacion", { granted: false, canAsk: true });
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it("abre los ajustes de la app si Android ya no deja preguntar", async () => {
    const open = jest.spyOn(Linking, "openSettings").mockResolvedValue(undefined as never);
    await grantPermission("camara", { granted: false, canAsk: false });
    expect(open).toHaveBeenCalled();
  });

  it("si la usuaria rechaza las notificaciones, abre sus ajustes", async () => {
    (notifee.getNotificationSettings as jest.Mock).mockResolvedValueOnce({ authorizationStatus: 0 });
    await grantPermission("notificaciones", { granted: false, canAsk: true });
    expect(notifee.openNotificationSettings).toHaveBeenCalled();
  });
});
