import * as Location from "expo-location";

export type PointPlace = {
  neighborhood: string | null; // barrio / sector
  place: string | null; // place (store, school...) or, if none, the street (e.g. "Carrera 7")
};

const clear = (v?: string | null) => {
  const s = v?.trim();
  return s ? s : null;
};

// OpenStreetMap (Nominatim): free and without a key. Returns neighborhood, street and place name.
// Its policy asks for at most 1 query per second (the ViewModel keeps that pace).
async function fromNominatim(lat: number, lng: number): Promise<PointPlace | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`;
  const res = await fetch(url, {
    headers: { "User-Agent": "AlertaMujer/1.0 (app movil)", Accept: "application/json" },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const a = data?.address ?? {};

  const neighborhood =
    clear(a.neighbourhood) ??
    clear(a.suburb) ??
    clear(a.quarter) ??
    clear(a.city_district) ??
    clear(a.residential);

  const via = clear(a.road);
  const name = clear(data?.name);
  const streetWithNumber = via ? (a.house_number ? `${via} #${a.house_number}` : via) : null;
  // If the point falls on a named place (store, school...), that name is shown.
  const place = name && name !== via && name !== neighborhood ? name : streetWithNumber;

  return { neighborhood, place };
}

// Fallback: the phone's own geocoder.
async function fromPhone(lat: number, lng: number): Promise<PointPlace | null> {
  const [dir] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
  if (!dir) return null;
  return {
    neighborhood: clear(dir.district),
    place: clear(dir.name) ?? clear(dir.street),
  };
}

export async function getPlace(lat: number, lng: number): Promise<PointPlace | null> {
  try {
    const r = await fromNominatim(lat, lng);
    if (r && (r.neighborhood || r.place)) return r;
  } catch {
    // no internet or service down: try the fallback
  }
  try {
    return await fromPhone(lat, lng);
  } catch {
    return null;
  }
}

// Text to show: "Carrera 7 · Barrio Quebraditas" (or only what is available).
export const placeDescription = (l: PointPlace) =>
  [l.place, l.neighborhood].filter(Boolean).join(" · ");
/** A place found by its address or name. */
export type FoundPlace = { name: string; detail: string; latitude: number; longitude: number };

/**
 * Searches an address or place by text (OpenStreetMap, free, no key), preferring results near her.
 * Empty list without internet or for very short texts.
 */
export async function searchPlaces(
  text: string,
  near?: { latitude: number; longitude: number } | null,
): Promise<FoundPlace[]> {
  const q = text.trim();
  if (q.length < 3) return [];
  // ~25 km around her: results in her city first, but others are not excluded
  const box = near
    ? `&viewbox=${near.longitude - 0.25},${near.latitude + 0.25},${near.longitude + 0.25},${near.latitude - 0.25}`
    : "";
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=co` +
    `&accept-language=es&q=${encodeURIComponent(q)}${box}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AlertaMujer/1.0 (app movil)", Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data: any[] = await res.json();
    const places: FoundPlace[] = data.map((r) => {
      const a = r.address ?? {};
      const road = clear(a.road);
      const street = road ? (a.house_number ? `${road} #${a.house_number}` : road) : null;
      const name = clear(r.name) ?? street ?? clear(a.neighbourhood) ?? String(r.display_name ?? "").split(",")[0];
      const detail = [street !== name ? street : null, clear(a.neighbourhood) ?? clear(a.suburb), clear(a.city) ?? clear(a.town)]
        .filter(Boolean)
        .join(" · ");
      return { name, detail, latitude: Number(r.lat), longitude: Number(r.lon) };
    });
    // Closest first: the same name may exist in several towns
    if (!near) return places;
    const away = (p: FoundPlace) => (p.latitude - near.latitude) ** 2 + (p.longitude - near.longitude) ** 2;
    return places.sort((a, b) => away(a) - away(b));
  } catch {
    return [];
  }
}
