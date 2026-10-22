import api from "./api";
import { aFecha } from "./alert-tracking.service";

/** Trayecto de "Avísame si no llego". */
export interface Trayecto {
  id: number;
  destino: string;
  inicio: Date;
  llegada: Date;
  estado: "active" | "arrived" | "cancelled" | "alerted";
}

const aTrayecto = (t: any): Trayecto => ({
  id: Number(t.id),
  destino: t.destination,
  inicio: aFecha(t.startedAt),
  llegada: aFecha(t.expectedArrival),
  estado: t.status,
});

export async function iniciarTrayecto(datos: {
  destino: string;
  minutos: number;
  deviceId: number;
  latitude?: number;
  longitude?: number;
}): Promise<Trayecto> {
  const { data } = await api.post("/api/safe-trips", {
    destination: datos.destino,
    minutes: datos.minutos,
    deviceId: datos.deviceId,
    latitude: datos.latitude,
    longitude: datos.longitude,
  });
  return aTrayecto(data);
}

/** El trayecto en curso o null (el backend responde 204 si no hay). */
export async function trayectoActivo(): Promise<Trayecto | null> {
  const r = await api.get("/api/safe-trips/active");
  return r.status === 204 || !r.data ? null : aTrayecto(r.data);
}

export const confirmarLlegada = async (id: number) => aTrayecto((await api.post(`/api/safe-trips/${id}/arrived`)).data);

export const alargarTrayecto = async (id: number, minutos: number) =>
  aTrayecto((await api.post(`/api/safe-trips/${id}/extend`, { minutes: minutos })).data);

export const cancelarTrayecto = async (id: number) => aTrayecto((await api.post(`/api/safe-trips/${id}/cancel`)).data);
