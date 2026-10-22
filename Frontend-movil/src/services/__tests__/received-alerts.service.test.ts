import api from "../api";
import { getReceivedAlerts, getTrackingCode } from "../received-alerts.service";

jest.mock("../api", () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));

const mockedApi = api as jest.Mocked<typeof api>;

describe("received-alerts.service", () => {
  beforeEach(() => jest.clearAllMocks());

  it("traduce la respuesta del backend y lee las horas en UTC", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        { alertId: 7, firstName: "Ana", status: "active", active: true, startedAt: "2026-10-20T14:00:00", endedAt: null, trackingAvailable: true },
        { alertId: 5, firstName: "", status: "cancelled", active: false, startedAt: "2026-10-19T10:00:00", endedAt: "2026-10-19T10:12:00", trackingAvailable: false },
      ],
    } as never);

    const [active, previous] = await getReceivedAlerts();

    expect(mockedApi.get).toHaveBeenCalledWith("/api/received-alerts");
    expect(active).toMatchObject({ id: 7, name: "Ana", active: true, status: "active", end: null, trackingAvailable: true });
    expect(active.startTime?.toISOString()).toBe("2026-10-20T14:00:00.000Z");
    expect(previous).toMatchObject({ id: 5, name: "", active: false, status: "cancelled", trackingAvailable: false });
    expect(previous.end?.toISOString()).toBe("2026-10-19T10:12:00.000Z");
  });

  it("pide el código de seguimiento de una alerta recibida", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { code: "abc123" } } as never);
    await expect(getTrackingCode(7)).resolves.toBe("abc123");
    expect(mockedApi.post).toHaveBeenCalledWith("/api/received-alerts/7/tracking", {});
  });
});
