import api from "../api";
import { confirmAlertReceived, getPublicTracking } from "../alert-tracking.service";

jest.mock("../api", () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));

const mockedApi = api as jest.Mocked<typeof api>;

describe("alert-tracking.service · received and seen", () => {
  beforeEach(() => jest.clearAllMocks());

  it("confirms the push arrived with its delivery id", async () => {
    mockedApi.post.mockResolvedValueOnce({} as never);

    await confirmAlertReceived("ABC", "101");

    expect(mockedApi.post).toHaveBeenCalledWith("/api/public/tracking/ABC/received", null, { params: { c: "101" } });
  });

  it("does nothing without a valid delivery id and never fails offline", async () => {
    await confirmAlertReceived("ABC", undefined);
    await confirmAlertReceived("ABC", "x1");
    expect(mockedApi.post).not.toHaveBeenCalled();

    mockedApi.post.mockRejectedValueOnce(new Error("offline"));
    await expect(confirmAlertReceived("ABC", "7")).resolves.toBeUndefined();
  });

  it("sends the delivery id when it opens the tracking (marks it seen)", async () => {
    mockedApi.get.mockResolvedValue({ data: { route: [], evidence: [], status: "active" } } as never);

    await getPublicTracking("ABC", "101");
    await getPublicTracking("ABC");

    expect(mockedApi.get.mock.calls[0][1]).toEqual({ params: expect.objectContaining({ c: "101" }) });
    expect((mockedApi.get.mock.calls[1][1] as any).params.c).toBeUndefined();
  });
});
