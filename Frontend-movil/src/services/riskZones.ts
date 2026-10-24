import { getZones, type ZoneApi } from "./zones.service";

/**
 * Risk zones published by the administration, and where she stands with respect to them. The same
 * rule as the server: a high-risk zone (or a "risk" zone of medium level) counts.
 */

export type ZoneStatusKind = "safe" | "near" | "inside";
export type ZoneStatus = { kind: ZoneStatusKind; zone: ZoneApi | null; distanceM: number | null };
type Point = { latitude: number; longitude: number };

/** Up to this far outside the zone's circle she is "near" it. */
export const NEAR_ZONE_M = 300;
const CACHE_MS = 10 * 60 * 1000;

export const isRiskZone = (z: ZoneApi): boolean =>
  z.isActive !== false &&
  z.latitude != null &&
  z.longitude != null &&
  Number(z.radiusMeters) > 0 &&
  (z.riskLevel === "high" || (z.zoneType === "risk" && z.riskLevel === "medium"));

export function distanceM(a: Point, b: Point): number {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Inside a risk zone, near one (the closest) or safe. */
export function zoneStatus(point: Point, zones: ZoneApi[]): ZoneStatus {
  let near: ZoneStatus | null = null;
  for (const z of zones) {
    if (!isRiskZone(z)) continue;
    const d = distanceM(point, { latitude: Number(z.latitude), longitude: Number(z.longitude) });
    const edge = Math.max(0, d - Number(z.radiusMeters));
    if (edge === 0) return { kind: "inside", zone: z, distanceM: 0 };
    if (edge <= NEAR_ZONE_M && (!near || edge < (near.distanceM ?? Infinity))) {
      near = { kind: "near", zone: z, distanceM: Math.round(edge) };
    }
  }
  return near ?? { kind: "safe", zone: null, distanceM: null };
}

let cache: { at: number; zones: ZoneApi[] } | null = null;

/** Risk zones (cached for a few minutes); an empty list if they could not be loaded. */
export async function getRiskZones(now = Date.now()): Promise<ZoneApi[]> {
  if (cache && now - cache.at < CACHE_MS) return cache.zones;
  try {
    const zones = (await getZones()).filter(isRiskZone);
    cache = { at: now, zones };
    return zones;
  } catch {
    return cache?.zones ?? [];
  }
}

/** For the native trip service: name, center and radius of each risk zone. */
export const riskZonesJson = (zones: ZoneApi[]): string =>
  JSON.stringify(
    zones.map((z) => ({
      name: z.name,
      latitude: Number(z.latitude),
      longitude: Number(z.longitude),
      radius: Number(z.radiusMeters),
    })),
  );
