import { checkInDeadline, locationIntervalMs, shouldAsk } from "../checkIn";

const MIN = 60000;

describe("alert timing", () => {
  it("sends the location every 15 s for 5 minutes, then every 30 s and every 60 s in saving mode", () => {
    expect(locationIntervalMs(null, 0, false)).toBe(15000);
    expect(locationIntervalMs(0, 4 * MIN, false)).toBe(15000);
    expect(locationIntervalMs(0, 6 * MIN, false)).toBe(30000);
    expect(locationIntervalMs(0, 1 * MIN, true)).toBe(60000);
  });

  it("asks 5 minutes before the check-in time, or before the extension", () => {
    const deadline = checkInDeadline(0, 30, null);
    expect(deadline).toBe(30 * MIN);
    expect(shouldAsk(deadline, 24 * MIN)).toBe(false);
    expect(shouldAsk(deadline, 25 * MIN)).toBe(true);
    expect(checkInDeadline(0, 30, 60 * MIN)).toBe(60 * MIN);
  });
});
