import api from "../api";
import { getAlertEvidence } from "../evidencias.service";

jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  sourceWithToken: (route: string) => ({ uri: `https://evidence.example${route}`, headers: {} }),
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("evidencias.service", () => {
  it("devuelve solo las evidencias de esa alerta, de la más antigua a la más reciente", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        { id: 3, alertId: 9, mediaType: "video", fileName: "video_b.mp4", sizeBytes: 2048, createdAt: "2026-10-20T15:01:00", hasFile: true },
        { id: 2, alertId: 8, mediaType: "audio", fileName: "otra.m4a", sizeBytes: 10, createdAt: "2026-10-20T15:00:30", hasFile: true },
        { id: 1, alertId: 9, mediaType: "audio", fileName: null, sizeBytes: null, createdAt: "2026-10-20T15:00:00", hasFile: false },
      ],
    } as never);

    const list = await getAlertEvidence(9);

    expect(mockedApi.get).toHaveBeenCalledWith("/api/evidences/me");
    expect(list.map((e) => e.id)).toEqual([1, 3]);
    expect(list[0]).toMatchObject({ type: "audio", name: "evidencia-1", hasFile: false });
    expect(list[1].date.toISOString()).toBe("2026-10-20T15:01:00.000Z");
  });
});
