import { act, render, screen } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import AnimatedSplash from "../SplashAnimado";

jest.mock("expo-splash-screen", () => ({ hideAsync: jest.fn(() => Promise.resolve()) }));

describe("SplashAnimado", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("se anuncia a los lectores de pantalla con el nombre de la app", () => {
    render(<AnimatedSplash onFinish={jest.fn()} />);

    expect(screen.getByLabelText("Alerta Mujer, seguridad para todas")).toBeTruthy();
  });

  it("oculta el splash nativo cuando la animación ya está dibujada", async () => {
    render(<AnimatedSplash onFinish={jest.fn()} />);

    await act(async () => {
      screen.getByLabelText("Alerta Mujer, seguridad para todas").props.onLayout({ nativeEvent: { layout: {} } });
    });

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  it("siempre termina, aunque la animación no arranque (la app nunca queda tapada)", () => {
    const onFinish = jest.fn();
    render(<AnimatedSplash onFinish={onFinish} />);

    act(() => jest.advanceTimersByTime(6000));

    expect(onFinish).toHaveBeenCalled();
  });
});
