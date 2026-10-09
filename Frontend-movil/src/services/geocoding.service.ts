import * as Location from "expo-location";

export type LugarPunto = {
  barrio: string | null; // barrio / sector
  lugar: string | null; // sitio (almacén, colegio...) o, si no hay, la vía (ej. "Carrera 7")
};

const limpiar = (v?: string | null) => {
  const s = v?.trim();
  return s ? s : null;
};

// OpenStreetMap (Nominatim): gratis y sin clave. Devuelve barrio, vía y nombre del sitio.
// Su política pide máximo 1 consulta por segundo (el ViewModel respeta ese ritmo).
async function desdeNominatim(lat: number, lng: number): Promise<LugarPunto | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`;
  const res = await fetch(url, {
    headers: { "User-Agent": "AlertaMujer/1.0 (app movil)", Accept: "application/json" },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const a = data?.address ?? {};

  const barrio =
    limpiar(a.neighbourhood) ??
    limpiar(a.suburb) ??
    limpiar(a.quarter) ??
    limpiar(a.city_district) ??
    limpiar(a.residential);

  const via = limpiar(a.road);
  const nombre = limpiar(data?.name);
  const viaConNumero = via ? (a.house_number ? `${via} #${a.house_number}` : via) : null;
  // Si el punto cae sobre un sitio con nombre (almacén, colegio...), se muestra ese nombre.
  const lugar = nombre && nombre !== via && nombre !== barrio ? nombre : viaConNumero;

  return { barrio, lugar };
}

// Respaldo: geocodificador del propio teléfono.
async function desdeTelefono(lat: number, lng: number): Promise<LugarPunto | null> {
  const [dir] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
  if (!dir) return null;
  return {
    barrio: limpiar(dir.district),
    lugar: limpiar(dir.name) ?? limpiar(dir.street),
  };
}

export async function obtenerLugar(lat: number, lng: number): Promise<LugarPunto | null> {
  try {
    const r = await desdeNominatim(lat, lng);
    if (r && (r.barrio || r.lugar)) return r;
  } catch {
    // sin internet o servicio caído: se prueba el respaldo
  }
  try {
    return await desdeTelefono(lat, lng);
  } catch {
    return null;
  }
}

// Texto para mostrar: "Carrera 7 · Barrio Quebraditas" (o solo lo que haya).
export const descripcionLugar = (l: LugarPunto) =>
  [l.lugar, l.barrio].filter(Boolean).join(" · ");