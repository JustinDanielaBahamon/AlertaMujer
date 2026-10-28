import ShakeSensor from "../../../../modules/shake-sensor";
import { checkCancelPin } from "../cancelPin";
import { AUTO_STOP_LINK, isAutoStopLink, stopWithPin } from "../autoProtectionStop";

jest.mock("../../../../modules/shake-sensor", () => ({
  __esModule: true,
  default: { stopAutoProtection: jest.fn(), duressAutoProtection: jest.fn() },
}));
jest.mock("../cancelPin", () => ({ checkCancelPin: jest.fn() }));

const pinIs = (result: "ok" | "duress" | "wrong") => (checkCancelPin as jest.Mock).mockResolvedValue(result);

describe("detener la protección automática con el PIN", () => {
  beforeEach(() => jest.clearAllMocks());

  it("only the link of the notice opens the PIN", () => {
    expect(isAutoStopLink(AUTO_STOP_LINK)).toBe(true);
    expect(isAutoStopLink("ALERTAMUJER://auto-protection/stop?x=1")).toBe(true);
    expect(isAutoStopLink("alertamujer://sos")).toBe(false);
    expect(isAutoStopLink(null)).toBe(false);
  });

  it("the normal PIN stops it", async () => {
    pinIs("ok");
    await expect(stopWithPin("1234")).resolves.toBe("ok");
    expect(ShakeSensor.stopAutoProtection).toHaveBeenCalledTimes(1);
    expect(ShakeSensor.duressAutoProtection).not.toHaveBeenCalled();
  });

  it("the duress PIN alerts silently instead of stopping", async () => {
    pinIs("duress");
    await expect(stopWithPin("9999")).resolves.toBe("duress");
    expect(ShakeSensor.duressAutoProtection).toHaveBeenCalledTimes(1);
    expect(ShakeSensor.stopAutoProtection).not.toHaveBeenCalled();
  });

  it("a wrong PIN changes nothing", async () => {
    pinIs("wrong");
    await expect(stopWithPin("0000")).resolves.toBe("wrong");
    expect(ShakeSensor.stopAutoProtection).not.toHaveBeenCalled();
    expect(ShakeSensor.duressAutoProtection).not.toHaveBeenCalled();
  });
});
