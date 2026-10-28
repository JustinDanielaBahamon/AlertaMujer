import { getZones, type ZoneApi } from "../zones.service";
import { getRiskZones, isRiskZone, ownRiskZones, riskZonesJson, zoneStatus } from "../riskZones";

jest.mock("../zones.service", () => ({ getZones: jest.fn() }));

const zone = (overrides: Partial<ZoneApi>): ZoneApi => ({
  id: 1,
  name: "Parque",
  zoneType: "risk",
  riskLevel: "high",
  city: "Neiva",
  latitude: 2.93,
  longitude: -75.28,
  radiusMeters: 200,
  isActive: true,
  createdAt: "",
  ...overrides,
});

// ~111 m per 0.001 degrees of latitude
const north = (meters: number) => ({ latitude: 2.93 + meters / 111_195, longitude: -75.28 });

describe("riskZones", () => {
  it("counts high zones and medium risk zones, not safe or inactive ones", () => {
    expect(isRiskZone(zone({}))).toBe(true);
    expect(isRiskZone(zone({ riskLevel: "medium" }))).toBe(true);
    expect(isRiskZone(zone({ zoneType: "safe", riskLevel: "medium" }))).toBe(false);
    expect(isRiskZone(zone({ riskLevel: "low" }))).toBe(false);
    expect(isRiskZone(zone({ isActive: false }))).toBe(false);
  });

  it("is inside within the radius, near up to 300 m from its edge and safe beyond", () => {
    const zones = [zone({})];
    expect(zoneStatus(north(150), zones).kind).toBe("inside");
    const near = zoneStatus(north(400), zones);
    expect(near.kind).toBe("near");
    expect(near.distanceM).toBeGreaterThan(190);
    expect(near.distanceM).toBeLessThan(210);
    expect(zoneStatus(north(600), zones)).toEqual({ kind: "safe", zone: null, distanceM: null });
  });

  it("reports the closest zone when several are near", () => {
    // Point 350 m north: 150 m from the edge of "Cerca" and 250 m from the edge of "Lejos" (800 m north)
    const far = zone({ id: 2, name: "Lejos", latitude: north(800).latitude });
    const status = zoneStatus(north(350), [far, zone({ name: "Cerca" })]);
    expect(status.zone?.name).toBe("Cerca");
  });

  it("caches the risk zones and keeps the last list when offline", async () => {
    (getZones as jest.Mock).mockResolvedValueOnce([zone({}), zone({ id: 2, riskLevel: "low" })]);
    expect(await getRiskZones(1_000)).toHaveLength(1);
    expect(await getRiskZones(2_000)).toHaveLength(1);
    (getZones as jest.Mock).mockRejectedValueOnce(new Error("offline"));
    expect(await getRiskZones(1_000 + 11 * 60 * 1000)).toHaveLength(1);
    expect(getZones).toHaveBeenCalledTimes(2);
  });

  it("sends the native service the name, center and radius", () => {
    expect(JSON.parse(riskZonesJson([zone({})]))).toEqual([
      { name: "Parque", latitude: 2.93, longitude: -75.28, radius: 200 },
    ]);
  });
});

describe("ownRiskZones", () => {
  const place = (riskLevel: string, id = 1) => ({
    id, userProfileId: 1, name: `Lugar ${id}`, latitude: 2.93, longitude: -75.28, riskLevel, isActive: true, createdAt: "",
  });

  it("solo los lugares que ella marcó como muy inseguros cuentan como zona de riesgo", () => {
    const zones = ownRiskZones([place("muy_insegura", 1), place("moderada", 2), place("muy_segura", 3)]);
    expect(zones).toHaveLength(1);
    expect(isRiskZone(zones[0])).toBe(true);
    expect(zones[0].id).toBe(-1);
  });

  it("estar en su lugar inseguro se ve como dentro de una zona de riesgo", () => {
    const [own] = ownRiskZones([place("muy_insegura")]);
    expect(zoneStatus({ latitude: 2.93, longitude: -75.28 }, [own]).kind).toBe("inside");
  });
});
