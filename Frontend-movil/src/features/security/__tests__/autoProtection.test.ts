import * as Location from "expo-location";
import ShakeSensor from "../../../../modules/shake-sensor";
import api from "../../../services/api";
import { frequentLocationsService } from "../../../services/frequent-locations.service";
import { enableAutoProtection } from "../autoProtection";

jest.mock("react-native", () => ({ Platform: { OS: "android" } }));
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getBackgroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
}));
jest.mock("../../../../modules/shake-sensor", () => ({
  __esModule: true,
  default: { configureAutoProtection: jest.fn(() => true), autoProtectionStatus: jest.fn(), disableAutoProtection: jest.fn() },
}));
jest.mock("../../../services/api", () => ({
  __esModule: true,
  default: { post: jest.fn() },
  baseUrlFor: () => "https://alert.example",
}));
jest.mock("../../../services/devices.service", () => ({ getOrCreateDevice: jest.fn(async () => ({ id: 2 })) }));
jest.mock("../../../services/frequent-locations.service", () => ({ frequentLocationsService: { getByUser: jest.fn() } }));
jest.mock("../../../services/riskZones", () => ({
  getRiskZones: jest.fn(async () => []),
  ownRiskZones: jest.requireActual("../../../services/riskZones").ownRiskZones,
  riskZonesJson: jest.requireActual("../../../services/riskZones").riskZonesJson,
}));

const place = (id: number, riskLevel: string) => ({
  id, userProfileId: 1, name: `Lugar ${id}`, latitude: 2.93, longitude: -75.28, riskLevel, isActive: true, createdAt: "",
});
const grant = (background: boolean) => {
  (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
  (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: background });
};

describe("protección automática", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sin lugares frecuentes no se activa (ni pide permisos)", async () => {
    (frequentLocationsService.getByUser as jest.Mock).mockResolvedValue([place(1, "muy_insegura")]);
    await expect(enableAutoProtection(1)).resolves.toBe("no_places");
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it("sin «Permitir todo el tiempo» no se activa ni pide llave", async () => {
    (frequentLocationsService.getByUser as jest.Mock).mockResolvedValue([place(1, "muy_segura")]);
    grant(false);
    await expect(enableAutoProtection(1)).resolves.toBe("no_permission");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("vigila sus lugares seguros y trata los inseguros como zonas de riesgo", async () => {
    (frequentLocationsService.getByUser as jest.Mock).mockResolvedValue([place(1, "muy_segura"), place(2, "muy_insegura")]);
    grant(true);
    (api.post as jest.Mock).mockResolvedValue({ data: { key: "llave" } });

    await expect(enableAutoProtection(1)).resolves.toBe("ok");

    expect(api.post).toHaveBeenCalledWith("/api/auto-protection/enable", { deviceId: 2 });
    const options = (ShakeSensor.configureAutoProtection as jest.Mock).mock.calls[0][0];
    expect(options.key).toBe("llave");
    expect(JSON.parse(options.places).map((p: { id: string }) => p.id)).toEqual(["1"]);
    expect(JSON.parse(options.riskZones)).toHaveLength(1);
  });
});
