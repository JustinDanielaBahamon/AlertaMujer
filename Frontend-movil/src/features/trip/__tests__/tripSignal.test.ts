jest.mock("react-native", () => ({ Platform: { OS: "android" } }));

const mockListeners: Record<string, (event: any) => void> = {};
jest.mock("../../../../modules/shake-sensor", () => ({
  __esModule: true,
  default: {
    startTrip: jest.fn(() => true),
    stopTrip: jest.fn(),
    updateTripToken: jest.fn(),
    tripStatus: jest.fn(() => ({ running: true, tripId: 4, lastSentAt: 0, lastFixAt: 0, queued: 2, error: null })),
    addListener: jest.fn((event: string, listener: (e: any) => void) => {
      mockListeners[event] = listener;
      return { remove: () => delete mockListeners[event] };
    }),
  },
}));

jest.mock("../../../services/api", () => ({
  baseUrlFor: jest.fn(() => "https://alert.example"),
  freshToken: jest.fn(async () => "token-1"),
}));

jest.mock("../../../services/safe-trips.service", () => ({ activeTrip: jest.fn(async () => null) }));

import ShakeSensor from "../../../../modules/shake-sensor";
import { freshToken } from "../../../services/api";
import type { Trip } from "../../../services/safe-trips.service";
import { onTripSignalEnded, syncTripSignal, tripSignalStatus } from "../tripSignal";

const trip = (overrides: Partial<Trip> = {}): Trip => ({
  id: 4,
  destination: "Casa",
  startTime: new Date("2026-10-23T20:00:00Z"),
  arrival: new Date("2026-10-23T20:30:00Z"),
  status: "active",
  destinationLatitude: 2.93,
  destinationLongitude: -75.28,
  lastSeenAt: null,
  alertReason: null,
  ...overrides,
});

describe("tripSignal", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts the native service with the trip, the service URL and a fresh token", async () => {
    await expect(syncTripSignal(trip())).resolves.toBe(true);

    expect(ShakeSensor.startTrip).toHaveBeenCalledWith({
      tripId: 4,
      baseUrl: "https://alert.example",
      token: "token-1",
      destination: "Casa",
      destLatitude: 2.93,
      destLongitude: -75.28,
      arrivalMs: Date.parse("2026-10-23T20:30:00Z"),
    });
  });

  it("stops the service when there is no active trip", async () => {
    await syncTripSignal(null);
    await syncTripSignal(trip({ status: "arrived" }));

    expect(ShakeSensor.stopTrip).toHaveBeenCalledTimes(2);
    expect(ShakeSensor.startTrip).not.toHaveBeenCalled();
  });

  it("does not start without a session", async () => {
    (freshToken as jest.Mock).mockResolvedValueOnce(null);

    await expect(syncTripSignal(trip())).resolves.toBe(false);
    expect(ShakeSensor.startTrip).not.toHaveBeenCalled();
  });

  it("hands the service a renewed token after a 401", async () => {
    await syncTripSignal(trip());
    (freshToken as jest.Mock).mockResolvedValueOnce("token-2");

    await mockListeners.onTripAuthExpired({});

    expect(ShakeSensor.updateTripToken).toHaveBeenCalledWith("token-2");
  });

  it("reports the service state and when the trip ends from it", () => {
    const ended = jest.fn();
    const leave = onTripSignalEnded(ended);
    mockListeners.onTripEnded({ status: "arrived" });
    leave();

    expect(ended).toHaveBeenCalledWith("arrived");
    expect(tripSignalStatus()?.queued).toBe(2);
  });
});
