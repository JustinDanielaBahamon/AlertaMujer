jest.mock("@notifee/react-native", () => ({
  __esModule: true,
  default: {
    registerForegroundService: jest.fn(),
    displayNotification: jest.fn(async () => "id"),
    cancelNotification: jest.fn(async () => {}),
    createChannel: jest.fn(async () => "canal"),
    requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
    getNotificationSettings: jest.fn(async () => ({ authorizationStatus: 1 })),
    stopForegroundService: jest.fn(async () => {}),
  },
  AuthorizationStatus: { DENIED: 0, AUTHORIZED: 1 },
  AndroidCategory: { ALARM: "alarm" },
  AndroidForegroundServiceType: { FOREGROUND_SERVICE_TYPE_LOCATION: 8 },
  AndroidStyle: { BIGTEXT: 1 },
  AndroidImportance: { HIGH: 4, LOW: 2 },
  AndroidVisibility: { PUBLIC: 1 },
  EventType: { PRESS: 1, ACTION_PRESS: 2 },
}));

let mockReader: ((m: { x: number; y: number; z: number }) => void) | null = null;
jest.mock("../../../../modules/shake-sensor", () => ({
  __esModule: true,
  default: {
    available: jest.fn(() => true),
    start: jest.fn(() => true),
    stop: jest.fn(),
    startPowerButton: jest.fn(),
    stopPowerButton: jest.fn(),
    wait: jest.fn((ms: number) => new Promise((r) => setTimeout(r, ms))),
    addListener: jest.fn((_event: string, l) => {
      mockReader = l;
      return { remove: () => (mockReader = null) };
    }),
  },
}));

jest.mock("expo-location", () => ({
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: true, status: "granted" })),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true, status: "granted" })),
}));

jest.mock("../backgroundAlert", () => ({
  backgroundAlert: jest.fn(() => null),
  createShakeAlert: jest.fn(async () => 77),
  prepareAlertLocation: jest.fn(),
}));

import notifee from "@notifee/react-native";
import { AppState } from "react-native";
import * as Location from "expo-location";
import { createShakeAlert } from "../backgroundAlert";
import ShakeSensor from "../../../../modules/shake-sensor";
import {
  onShakeAlertOpen,
  onShakeOnScreen,
  stopProtection,
  startProtection,
  handleProtectionEvent,
  registerProtectionService,
} from "../protectionService";

// Four strong chops with calm before and after, read every 40 ms as in the service
const CHOP = [1.3, 4.6, 5.8, 3.1, 4.2, 2.2, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
function shakePhone() {
  const still = (ms: number) => Array(ms / 40).fill(1);
  const readings = [...still(1200), ...Array(4).fill(CHOP).flat(), ...still(1000)];
  for (const g of readings) {
    jest.setSystemTime(Date.now() + 40);
    mockReader?.({ x: g, y: 0, z: 0 });
  }
}

async function turnOn() {
  registerProtectionService();
  const run = (notifee.registerForegroundService as jest.Mock).mock.calls.at(-1)[0];
  expect(await startProtection()).toBe("activa");
  run(); // Notifee runs the task when the service notification is shown
}

describe("servicioProteccion", () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    await stopProtection();
  });

  afterEach(() => jest.useRealTimers());

  it("sin permiso de ubicación no enciende el servicio", async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false, status: "denied" });
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false, status: "denied" });
    expect(await startProtection()).toBe("sin_ubicacion");
    expect(notifee.displayNotification).not.toHaveBeenCalled();
  });

  it("lee el acelerómetro nativo, que sigue con la app minimizada, y lo suelta al apagar", async () => {
    await turnOn();
    expect(ShakeSensor.start).toHaveBeenCalledWith(40);

    await stopProtection();
    expect(ShakeSensor.stop).toHaveBeenCalled();
    expect(mockReader).toBeNull();
  });

  it("con la app en pantalla abre la cuenta regresiva de la app", async () => {
    Object.defineProperty(AppState, "currentState", { value: "active", configurable: true });
    const listener = jest.fn();
    const remove = onShakeOnScreen(listener);
    await turnOn();

    shakePhone();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(createShakeAlert).not.toHaveBeenCalled();
    remove();
  });

  it("en segundo plano envía la alerta tras 5 s y permite abrirla", async () => {
    Object.defineProperty(AppState, "currentState", { value: "background", configurable: true });
    await turnOn();

    shakePhone();
    await jest.advanceTimersByTimeAsync(6000);

    expect(createShakeAlert).toHaveBeenCalledTimes(1);
    const sent = (notifee.displayNotification as jest.Mock).mock.calls.at(-1)[0];
    expect(sent.title).toContain("Alerta enviada");

    const open = jest.fn();
    handleProtectionEvent({ type: 1, detail: { notification: sent } } as never);
    onShakeAlertOpen(open);
    expect(open).toHaveBeenCalledWith(77);
  });

  it("si se toca Cancelar no se envía nada", async () => {
    Object.defineProperty(AppState, "currentState", { value: "background", configurable: true });
    await turnOn();

    shakePhone();
    await jest.advanceTimersByTimeAsync(2000);
    handleProtectionEvent({ type: 2, detail: { pressAction: { id: "cancelar_agitar" } } } as never);
    await jest.advanceTimersByTimeAsync(6000);

    expect(createShakeAlert).not.toHaveBeenCalled();
  });

  it("con el botón de encendido: 4 pulsaciones rápidas envían la alerta con ese método", async () => {
    Object.defineProperty(AppState, "currentState", { value: "background", configurable: true });
    registerProtectionService();
    const run = (notifee.registerForegroundService as jest.Mock).mock.calls.at(-1)[0];
    expect(await startProtection(false, { shake: false, powerButton: true })).toBe("activa");
    run();
    expect(ShakeSensor.startPowerButton).toHaveBeenCalled();
    expect(ShakeSensor.start).not.toHaveBeenCalled(); // no accelerometer if shake was not requested

    for (let i = 0; i < 4; i++) {
      jest.setSystemTime(Date.now() + 400);
      (mockReader as unknown as (e: { turnedOn: boolean }) => void)?.({ turnedOn: i % 2 === 0 });
    }
    await jest.advanceTimersByTimeAsync(6000);

    expect(createShakeAlert).toHaveBeenCalledWith("encendido");
  });
});
