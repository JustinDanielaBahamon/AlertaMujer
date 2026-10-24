import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("../../../../modules/shake-sensor", () => ({
  __esModule: true,
  default: { wait: jest.fn(() => Promise.resolve()) },
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

import * as Location from "expo-location";
import ShakeSensor from "../../../../modules/shake-sensor";
import { createAlertWithRetries, getAlert } from "../../../services/alerts.service";
import { reportLocation } from "../../../services/location-reporter.service";
import { backgroundAlert, createShakeAlert, takeOverAlert } from "../backgroundAlert";

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

  it("does not wait for the GPS: it uses the last position and sends the precise one when it arrives", async () => {
    takeOverAlert();
    // The GPS timeout does not run out during this test
    (ShakeSensor.wait as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    let deliverFix: (fix: unknown) => void = () => {};
    (Location.getCurrentPositionAsync as jest.Mock).mockReturnValueOnce(new Promise((r) => (deliverFix = r)));
    (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValueOnce({ coords: { latitude: 1, longitude: 2 } });
    (getAlert as jest.Mock).mockResolvedValue({ status: "resolved" });

    await createShakeAlert();

    expect(createAlertWithRetries).toHaveBeenLastCalledWith(expect.objectContaining({ latitude: 1, longitude: 2 }));
    deliverFix({ coords: { latitude: 2.95, longitude: -75.29, accuracy: 8 } });
    await waitCycles();
    expect(reportLocation).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 2.95, longitude: -75.29, alertaId: 41 }),
    );
  });
});
