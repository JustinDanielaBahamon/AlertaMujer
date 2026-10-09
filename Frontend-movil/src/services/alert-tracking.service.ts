import api from "./api";
import type { AlertaApi } from "./alerts.service";

export interface PuntoUbicacion {
  id: string;
  latitude: number;
  longitude: number;
  recordedAt: Date;
}

export interface SeguimientoAlerta {
  estado: string; // "active" | "cancelled" | "resolved" ...
  puntos: PuntoUbicacion[]; // ordenados del más antiguo al más reciente
}

// El backend devuelve LocalDateTime en UTC sin 'Z' (igual que en alerts.service.ts).
const aFecha = (iso?: string | null): Date => {
  if (!iso) return new Date();
  const d = new Date(iso + (iso.endsWith("Z") || iso.includes("+") ? "" : "Z"));
  return isNaN(d.getTime()) ? new Date() : d;
};

export const getSeguimientoAlerta = async (
  alertaId: number,
): Promise<SeguimientoAlerta> => {
  const { data: alerta } = await api.get<AlertaApi>(`/api/alerts/${alertaId}`);

  let puntos: PuntoUbicacion[] = [];

  try {
    // Endpoint de historial de ubicaciones de la alerta (pendiente en el backend).
    const { data } = await api.get<any[]>(`/api/alerts/${alertaId}/locations`);
    puntos = (data ?? [])
      .filter((p) => p?.latitude != null && p?.longitude != null)
      .map((p, i) => ({
        id: String(p.id ?? `p-${i}`),
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        recordedAt: aFecha(p.recordedAt ?? p.createdAt ?? p.timestamp),
      }));
  } catch {
    // Si el endpoint aún no existe, se usa solo la ubicación con la que se creó la alerta.
  }

  if (puntos.length === 0 && alerta.latitude != null && alerta.longitude != null) {
    puntos = [
      {
        id: `inicio-${alerta.id}`,
        latitude: Number(alerta.latitude),
        longitude: Number(alerta.longitude),
        recordedAt: aFecha(alerta.startedAt || alerta.createdAt),
      },
    ];
  }

  puntos.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());

  return { estado: (alerta.status || "").toLowerCase(), puntos };
};