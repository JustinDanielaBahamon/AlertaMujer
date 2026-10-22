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
jest.mock("../../../services/location-reporter.service", () => ({ reportLocation: jest.fn(async () => {}) }));
jest.mock("../../../services/alerts.service", () => ({
  createAlertWithRetries: jest.fn(async () => ({ id: 41 })),
  getAlert: jest.fn(),
}));

import { getAlert } from "../../../services/alerts.service";
import { backgroundAlert, createShakeAlert } from "../alertaEnSegundoPlano";

const waitCycles = () => new Promise((r) => setTimeout(r, 0));

describe("alertaEnSegundoPlano", () => {
  beforeEach(async () => {
    await AsyncStorage.setItem("@alerta_mujer:auth", JSON.stringify({ user: { id: 1 } }));
  });

  it("suelta la alerta cuando otra persona la cierra, para aceptar nuevas sacudidas", async () => {
    (getAlert as jest.Mock).mockResolvedValueOnce({ status: "active" }).mockResolvedValue({ status: "resolved" });

    await createShakeAlert();
    expect(backgroundAlert()).toBe(41);

    for (let i = 0; i < 10; i++) await waitCycles();
    expect(backgroundAlert()).toBeNull();
  });
});
