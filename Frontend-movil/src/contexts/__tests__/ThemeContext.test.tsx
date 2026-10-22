import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider, useTheme } from "../ThemeContext";

let cambiar: ReturnType<typeof useTheme>["setMode"] | null = null;
function Muestra() {
  const { theme, setMode } = useTheme();
  cambiar = setMode;
  return <Text>{theme.mode}</Text>;
}

describe("ThemeContext", () => {
  beforeEach(() => AsyncStorage.clear());

  it("recuerda el tema elegido al volver a abrir la app", async () => {
    const primera = render(<ThemeProvider><Muestra /></ThemeProvider>);
    await waitFor(() => screen.getByText("light"));
    act(() => cambiar!("magenta"));
    await waitFor(() => screen.getByText("magenta"));
    primera.unmount();

    render(<ThemeProvider><Muestra /></ThemeProvider>);
    await waitFor(() => screen.getByText("magenta"));
  });
});
