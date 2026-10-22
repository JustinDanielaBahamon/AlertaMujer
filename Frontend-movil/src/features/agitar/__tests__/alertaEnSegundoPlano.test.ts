import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("../../../../modules/sensor-sacudidas", () => ({
  __esModule: true,
  default: { esperar: jest.fn(() => Promise.resolve()) },
}));
jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 2.9, longitude: -75.3, accuracy: 10 } })),
  getLastKnownPositionAsync: jest.fn(async () => null),
}));
jest.mock("../../../services/devices.service", () => ({ getOrCreateDevice: jest.fn(async () => ({ id: 3 })) }));
jest.mock("../../../services/location-reporter.service", () => ({ reportarUbicacion: jest.fn(async () => {}) }));
jest.mock("../../../services/alerts.service", () => ({
  crearAlertaConReintentos: jest.fn(async () => ({ id: 41 })),
  getAlerta: jest.fn(),
}));

import { getAlerta } from "../../../services/alerts.service";
import { alertaEnSegundoPlano, crearAlertaPorSacudida } from "../alertaEnSegundoPlano";

const esperarCiclos = () => new Promise((r) => setTimeout(r, 0));

describe("alertaEnSegundoPlano", () => {
  beforeEach(async () => {
    await AsyncStorage.setItem("@alerta_mujer:auth", JSON.stringify({ user: { id: 1 } }));
  });

  it("suelta la alerta cuando otra persona la cierra, para aceptar nuevas sacudidas", async () => {
    (getAlerta as jest.Mock).mockResolvedValueOnce({ status: "active" }).mockResolvedValue({ status: "resolved" });

    await crearAlertaPorSacudida();
    expect(alertaEnSegundoPlano()).toBe(41);

    for (let i = 0; i < 10; i++) await esperarCiclos();
    expect(alertaEnSegundoPlano()).toBeNull();
  });
});
