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

let mockLector: ((m: { x: number; y: number; z: number }) => void) | null = null;
jest.mock("../../../../modules/sensor-sacudidas", () => ({
  __esModule: true,
  default: {
    disponible: jest.fn(() => true),
    iniciar: jest.fn(() => true),
    detener: jest.fn(),
    esperar: jest.fn((ms: number) => new Promise((r) => setTimeout(r, ms))),
    addListener: jest.fn((_evento: string, l) => {
      mockLector = l;
      return { remove: () => (mockLector = null) };
    }),
  },
}));

jest.mock("expo-location", () => ({
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: true, status: "granted" })),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true, status: "granted" })),
}));

jest.mock("../alertaEnSegundoPlano", () => ({
  alertaEnSegundoPlano: jest.fn(() => null),
  crearAlertaPorSacudida: jest.fn(async () => 77),
}));

import notifee from "@notifee/react-native";
import { AppState } from "react-native";
import * as Location from "expo-location";
import { crearAlertaPorSacudida } from "../alertaEnSegundoPlano";
import SensorSacudidas from "../../../../modules/sensor-sacudidas";
import {
  alAbrirAlertaPorSacudida,
  alSacudirEnPantalla,
  detenerProteccion,
  iniciarProteccion,
  manejarEventoProteccion,
  registrarServicioProteccion,
} from "../servicioProteccion";

// Cuatro hachazos fuertes con calma antes y después, leídos cada 40 ms como en el servicio
const HACHAZO = [1.3, 4.6, 5.8, 3.1, 4.2, 2.2, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
function sacudir() {
  const quieto = (ms: number) => Array(ms / 40).fill(1);
  const lecturas = [...quieto(1200), ...Array(4).fill(HACHAZO).flat(), ...quieto(1000)];
  for (const g of lecturas) {
    jest.setSystemTime(Date.now() + 40);
    mockLector?.({ x: g, y: 0, z: 0 });
  }
}

async function encender() {
  registrarServicioProteccion();
  const correr = (notifee.registerForegroundService as jest.Mock).mock.calls.at(-1)[0];
  expect(await iniciarProteccion()).toBe("activa");
  correr(); // Notifee ejecuta la tarea al mostrar la notificación del servicio
}

describe("servicioProteccion", () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    await detenerProteccion();
  });

  afterEach(() => jest.useRealTimers());

  it("sin permiso de ubicación no enciende el servicio", async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false, status: "denied" });
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false, status: "denied" });
    expect(await iniciarProteccion()).toBe("sin_ubicacion");
    expect(notifee.displayNotification).not.toHaveBeenCalled();
  });

  it("lee el acelerómetro nativo, que sigue con la app minimizada, y lo suelta al apagar", async () => {
    await encender();
    expect(SensorSacudidas.iniciar).toHaveBeenCalledWith(40);

    await detenerProteccion();
    expect(SensorSacudidas.detener).toHaveBeenCalled();
    expect(mockLector).toBeNull();
  });

  it("con la app en pantalla abre la cuenta regresiva de la app", async () => {
    Object.defineProperty(AppState, "currentState", { value: "active", configurable: true });
    const oyente = jest.fn();
    const quitar = alSacudirEnPantalla(oyente);
    await encender();

    sacudir();

    expect(oyente).toHaveBeenCalledTimes(1);
    expect(crearAlertaPorSacudida).not.toHaveBeenCalled();
    quitar();
  });

  it("en segundo plano envía la alerta tras 5 s y permite abrirla", async () => {
    Object.defineProperty(AppState, "currentState", { value: "background", configurable: true });
    await encender();

    sacudir();
    await jest.advanceTimersByTimeAsync(6000);

    expect(crearAlertaPorSacudida).toHaveBeenCalledTimes(1);
    const enviada = (notifee.displayNotification as jest.Mock).mock.calls.at(-1)[0];
    expect(enviada.title).toContain("Alerta enviada");

    const abrir = jest.fn();
    manejarEventoProteccion({ type: 1, detail: { notification: enviada } } as never);
    alAbrirAlertaPorSacudida(abrir);
    expect(abrir).toHaveBeenCalledWith(77);
  });

  it("si se toca Cancelar no se envía nada", async () => {
    Object.defineProperty(AppState, "currentState", { value: "background", configurable: true });
    await encender();

    sacudir();
    await jest.advanceTimersByTimeAsync(2000);
    manejarEventoProteccion({ type: 2, detail: { pressAction: { id: "cancelar_agitar" } } } as never);
    await jest.advanceTimersByTimeAsync(6000);

    expect(crearAlertaPorSacudida).not.toHaveBeenCalled();
  });
});
