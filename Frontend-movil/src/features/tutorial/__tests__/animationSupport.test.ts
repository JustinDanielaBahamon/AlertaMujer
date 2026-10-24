jest.mock("expo-device", () => ({ totalMemory: null, deviceYearClass: null }));

import { deviceCanAnimate } from "../component/animationSupport";

const GB = 1024 ** 3;

describe("tutorial animations", () => {
  it("play on phones with enough memory and recent hardware", () => {
    expect(deviceCanAnimate(6 * GB, 2021)).toBe(true);
  });

  it("are skipped on phones with little memory or old hardware", () => {
    expect(deviceCanAnimate(2 * GB, 2021)).toBe(false);
    expect(deviceCanAnimate(6 * GB, 2015)).toBe(false);
  });

  it("play when the phone does not report its data", () => {
    expect(deviceCanAnimate(null, null)).toBe(true);
  });
});
