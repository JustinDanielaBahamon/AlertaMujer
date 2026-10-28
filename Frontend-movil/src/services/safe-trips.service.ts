import api from "./api";
import { toDate } from "./alert-tracking.service";

/** A "Let me know if I don't arrive" trip. */
export interface Trip {
  id: number;
  destination: string;
  startTime: Date;
  arrival: Date;
  status: "active" | "arrived" | "cancelled" | "alerted";
  /** Destination point, if she marked it (saved place or map). */
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  /** Last signal of life the server received from her phone. */
  lastSeenAt: Date | null;
  /** Why the server alerted: "not_confirmed" or "signal_lost". */
  alertReason: string | null;
}

const toNumber = (v: unknown): number | null => (v == null || v === "" ? null : Number(v));

const toTrip = (t: any): Trip => ({
  id: Number(t.id),
  destination: t.destination,
  startTime: toDate(t.startedAt),
  arrival: toDate(t.expectedArrival),
  status: t.status,
  destinationLatitude: toNumber(t.destinationLatitude),
  destinationLongitude: toNumber(t.destinationLongitude),
  lastSeenAt: t.lastSeenAt ? toDate(t.lastSeenAt) : null,
  alertReason: t.alertReason ?? null,
});

export async function startTrip(trip: {
  destination: string;
  minutes: number;
  deviceId: number;
  latitude?: number;
  longitude?: number;
}): Promise<Trip> {
  const { data } = await api.post("/api/safe-trips", {
    destination: trip.destination,
    minutes: trip.minutes,
    deviceId: trip.deviceId,
    latitude: trip.latitude,
    longitude: trip.longitude,
  });
  return toTrip(data);
}

/** The trip in progress or null (the backend answers 204 if there is none). */
export async function activeTrip(): Promise<Trip | null> {
  const r = await api.get("/api/safe-trips/active");
  return r.status === 204 || !r.data ? null : toTrip(r.data);
}

export const confirmArrival = async (id: number) => toTrip((await api.post(`/api/safe-trips/${id}/arrived`)).data);

export const extendTrip = async (id: number, minutes: number) =>
  toTrip((await api.post(`/api/safe-trips/${id}/extend`, { minutes: minutes })).data);

export const cancelTrip = async (id: number) => toTrip((await api.post(`/api/safe-trips/${id}/cancel`)).data);
