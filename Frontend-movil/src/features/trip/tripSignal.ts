import { Platform } from "react-native";
import ShakeSensor, { type TripServiceStatus } from "../../../modules/shake-sensor";
import { baseUrlFor, freshToken } from "../../services/api";
import { getRiskZones, riskZonesJson } from "../../services/riskZones";
import { activeTrip, type Trip } from "../../services/safe-trips.service";

/**
 * Signal of life during "Avísame si no llego": the native trip service sends the location to the
 * server every 2 minutes, also with the phone locked and offline (it queues them). This module starts
 * it, keeps its session token fresh and stops it when the trip ends.
 */

const TRIP_ROUTE = "/api/safe-trips";
// The longest trip (6 h) plus margin: the native service cannot renew the token on its own
const TOKEN_MIN_MS = 7 * 60 * 60 * 1000;

// Builds made before the trip service existed do not have these functions
const supported = () => Platform.OS === "android" && typeof ShakeSensor?.startTrip === "function";

let authListenerReady = false;

/** When the service gets a 401 the app (if alive) renews the session and hands it the new token. */
function listenAuthExpired() {
  if (authListenerReady || !supported()) return;
  authListenerReady = true;
  ShakeSensor.addListener("onTripAuthExpired", async () => {
    try {
      // Any authenticated request renews the token through the api interceptor
      await activeTrip();
      const token = await freshToken(TOKEN_MIN_MS);
      if (token) ShakeSensor.updateTripToken(token);
    } catch {
      // Offline: the service keeps queueing and asks again on the next 401
    }
  });
}

/**
 * running: the phone is sending its signal of life; stopped: there is no active trip; unsupported:
 * this version of the app has no trip service; failed: it could not start (location permission).
 */
export type TripSignalState = "running" | "stopped" | "unsupported" | "failed";

/**
 * Starts (or updates) the service for the active trip, or stops it if there is none. Must be called
 * with the app open.
 */
export async function syncTripSignal(trip: Trip | null): Promise<TripSignalState> {
  if (!supported()) return "unsupported";
  if (!trip || trip.status !== "active") {
    stopTripSignal();
    return "stopped";
  }
  listenAuthExpired();
  const token = await freshToken(TOKEN_MIN_MS);
  if (!token) return "failed";
  // The phone warns her when she enters or approaches one during the trip
  const zones = await getRiskZones();
  const started = ShakeSensor.startTrip({
    tripId: trip.id,
    baseUrl: baseUrlFor(TRIP_ROUTE),
    token,
    destination: trip.destination,
    destLatitude: trip.destinationLatitude,
    destLongitude: trip.destinationLongitude,
    arrivalMs: trip.arrival.getTime(),
    riskZones: riskZonesJson(zones),
  });
  return started ? "running" : "failed";
}

export function stopTripSignal(): void {
  if (supported()) ShakeSensor.stopTrip();
}

/** What the service is doing now (null on platforms without it). */
export function tripSignalStatus(): TripServiceStatus | null {
  return supported() ? ShakeSensor.tripStatus() : null;
}

/** The trip ended from the service (arrival confirmed in its notification, or ended on the server). */
export function onTripSignalEnded(listener: (status: string) => void): () => void {
  if (!supported()) return () => {};
  const sub = ShakeSensor.addListener("onTripEnded", ({ status }) => listener(status));
  return () => sub.remove();
}
