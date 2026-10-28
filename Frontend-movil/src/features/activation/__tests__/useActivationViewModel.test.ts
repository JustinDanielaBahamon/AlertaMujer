const mockReplace = jest.fn();
const mockGoBack = jest.fn();
let mockFocused = true;

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ replace: mockReplace, goBack: mockGoBack }),
  useRoute: () => ({ params: undefined }),
  useIsFocused: () => mockFocused,
}));
jest.mock("../../../contexts/NotificationsContext", () => ({ useNotifications: () => ({ config: { vibracion: false } }) }));
const mockVolume: { listener: (() => void) | null } = { listener: null };
jest.mock("../../../../modules/shake-sensor", () => ({
  __esModule: true,
  default: {
    startVolumeCancel: jest.fn(),
    stopVolumeCancel: jest.fn(),
    addListener: jest.fn((_e: string, l: () => void) => {
      mockVolume.listener = l;
      return { remove: () => (mockVolume.listener = null) };
    }),
  },
}));
jest.mock("../../../contexts/EvidenceContext", () => ({ useEvidence: () => ({ recordVideo: true, recordAudio: true }) }));

import { act, renderHook } from "@testing-library/react-native";
import { useActivationViewModel } from "../viewModel/useActivationViewModel";

describe("useActivationViewModel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  it("activates the alert when the countdown on screen ends", () => {
    mockFocused = true;
    renderHook(() => useActivationViewModel());

    for (let i = 0; i < 5; i++) act(() => jest.advanceTimersByTime(1000));

    expect(mockReplace).toHaveBeenCalledWith("ActiveAlert", undefined);
  });

  it("a countdown left under another screen does not advance nor activate an alert", () => {
    mockFocused = false;
    const { result } = renderHook(() => useActivationViewModel());

    for (let i = 0; i < 10; i++) act(() => jest.advanceTimersByTime(1000));

    expect(result.current.counter).toBe(5);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("four presses of volume down cancel the countdown without sending anything", () => {
    mockFocused = true;
    renderHook(() => useActivationViewModel());

    act(() => mockVolume.listener?.());
    for (let i = 0; i < 6; i++) act(() => jest.advanceTimersByTime(1000));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
