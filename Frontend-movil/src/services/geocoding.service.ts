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