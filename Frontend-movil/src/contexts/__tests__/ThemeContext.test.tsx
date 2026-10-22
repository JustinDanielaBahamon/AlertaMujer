import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider, useTheme } from "../ThemeContext";

let change: ReturnType<typeof useTheme>["setMode"] | null = null;
function Sample() {
  const { theme, setMode } = useTheme();
  change = setMode;
  return <Text>{theme.mode}</Text>;
}

describe("ThemeContext", () => {
  beforeEach(() => AsyncStorage.clear());

  it("recuerda el tema elegido al volver a abrir la app", async () => {
    const first = render(<ThemeProvider><Sample /></ThemeProvider>);
    await waitFor(() => screen.getByText("light"));
    act(() => change!("magenta"));
    await waitFor(() => screen.getByText("magenta"));
    first.unmount();

    render(<ThemeProvider><Sample /></ThemeProvider>);
    await waitFor(() => screen.getByText("magenta"));
  });
});
