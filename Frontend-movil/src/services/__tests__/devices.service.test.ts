import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("expo-device", () => ({
  brand: "motorola",
  manufacturer: "motorola",
  modelName: "moto g84 5G",
  deviceName: "Moto de Ana",
  osVersion: "14",
}));
jest.mock("expo-application", () => ({ nativeApplicationVersion: "1.0.0" }));
jest.mock("../api", () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn() } }));

import api from "../api";
import { getOrCreateDevice, forgetDeviceSession, reportPermissions } from "../devices.service";

const mockApi = api as unknown as { get: jest.Mock; post: jest.Mock; put: jest.Mock };

describe("devices.service", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    await AsyncStorage.setItem("@alerta_mujer:auth", JSON.stringify({ user: { id: 5 } }));
    forgetDeviceSession();
    mockApi.put.mockImplementation(async (_url: string, data: object) => ({ data: { id: 1, deviceUuid: "x", ...data } }));
  });

  it("adopta el registro antiguo y le envía los datos reales del celular", async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, deviceUuid: "expo-viejo", model: "Dispositivo Expo" }] });

    await getOrCreateDevice();

    expect(mockApi.post).not.toHaveBeenCalled();
    expect(await AsyncStorage.getItem("@alerta_mujer:device_uuid:5")).toBe("expo-viejo");
    expect(mockApi.put).toHaveBeenCalledWith("/api/devices/1/info", expect.objectContaining({
      brand: "motorola", model: "moto g84 5G", deviceName: "Moto de Ana", osVersion: "14", appVersion: "1.0.0",
    }));
  });

  it("en un celular nuevo crea el dispositivo con sus datos", async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 9, deviceUuid: "otro-celular", model: "Galaxy A54" }] });
    mockApi.post.mockImplementation(async (_url: string, d: { deviceUuid: string }) => ({ data: { id: 10, ...d } }));

    const d = await getOrCreateDevice();

    expect(d.id).toBe(10);
    expect(mockApi.post).toHaveBeenCalledWith("/api/devices", expect.objectContaining({ model: "moto g84 5G" }));
    expect(mockApi.put).not.toHaveBeenCalled(); // already created with the data
  });

  it("informa los datos una sola vez por sesión", async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, deviceUuid: "expo-viejo", model: "Dispositivo Expo" }] });

    await getOrCreateDevice();
    await getOrCreateDevice();

    expect(mockApi.put).toHaveBeenCalledTimes(1);
  });

  it("informa los permisos del celular solo cuando cambian", async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, deviceUuid: "expo-viejo", model: "Dispositivo Expo" }] });

    await reportPermissions({ ubicacion: true, agitar: false });
    await reportPermissions({ ubicacion: true, agitar: false });
    await reportPermissions({ ubicacion: true, agitar: true });

    const deliveries = mockApi.put.mock.calls.filter(([, data]) => "permissions" in data);
    expect(deliveries.map(([, d]) => d.permissions)).toEqual([
      JSON.stringify({ ubicacion: true, agitar: false }),
      JSON.stringify({ ubicacion: true, agitar: true }),
    ]);
  });
});
