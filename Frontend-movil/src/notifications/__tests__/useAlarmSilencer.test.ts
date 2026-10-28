import { act, renderHook, waitFor } from "@testing-library/react-native";
import ShakeSensor from "../../../modules/shake-sensor";
import { isSosAlarmRinging, stopSosAlarm } from "../sosAlarm";
import { useAlarmSilencer } from "../useAlarmSilencer";

const mockListeners: Record<string, () => void> = {};
const mockRemove = jest.fn();
jest.mock("../../../modules/shake-sensor", () => ({
  __esModule: true,
  default: {
    startAlarmSilencer: jest.fn(),
    stopAlarmSilencer: jest.fn(),
    addListener: jest.fn((event: string, listener: () => void) => {
      mockListeners[event] = listener;
      return { remove: mockRemove };
    }),
  },
}));
jest.mock("../sosAlarm", () => ({
  isSosAlarmRinging: jest.fn(),
  stopSosAlarm: jest.fn(async () => undefined),
}));

const ringing = (value: boolean) => (isSosAlarmRinging as jest.Mock).mockResolvedValue(value);

describe("alarma de la alerta de un contacto", () => {
  beforeEach(() => jest.clearAllMocks());

  it("opening the screen no longer turns it off: a volume key silences it", async () => {
    ringing(true);
    const { result } = renderHook(() => useAlarmSilencer(7, true));

    await waitFor(() => expect(result.current.ringing).toBe(true));
    expect(stopSosAlarm).not.toHaveBeenCalled();
    expect(ShakeSensor.startAlarmSilencer).toHaveBeenCalled();

    ringing(false);
    act(() => mockListeners.onAlarmSilence());

    expect(stopSosAlarm).toHaveBeenCalledWith(7);
    await waitFor(() => expect(result.current.ringing).toBe(false));
    expect(ShakeSensor.stopAlarmSilencer).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
  });

  it("without an alarm on screen the volume keys are not taken", async () => {
    ringing(false);
    const { result } = renderHook(() => useAlarmSilencer(7, true));

    await waitFor(() => expect(isSosAlarmRinging).toHaveBeenCalled());
    expect(result.current.ringing).toBe(false);
    expect(ShakeSensor.startAlarmSilencer).not.toHaveBeenCalled();
  });

  it("leaving the screen stops listening to the keys but the alarm goes on", async () => {
    ringing(true);
    const { result, unmount } = renderHook(() => useAlarmSilencer(7, true));
    await waitFor(() => expect(result.current.ringing).toBe(true));

    unmount();

    expect(ShakeSensor.stopAlarmSilencer).toHaveBeenCalled();
    expect(stopSosAlarm).not.toHaveBeenCalled();
  });
});
