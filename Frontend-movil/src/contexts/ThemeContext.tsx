import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark";

export type AppTheme = {
  mode: ThemeMode;
  headerBackground: string;
  headerText: string;
  background: string;
  text: string;
  card: string;
};

const lightTheme: AppTheme = {
  mode: "light",
  headerBackground: "rgb(202,171,222)",
  headerText: "#1a1a1a",
  background: "#f5f0fa",
  text: "#1a1a1a",
  card: "#ffffff",
};

const darkTheme: AppTheme = {
  mode: "dark",
  headerBackground: "#1a1525",
  headerText: "#f0e6ff",
  background: "#121018",
  text: "#f0e6ff",
  card: "#1e1a2e",
};

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
  setMode: (m: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  const theme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

  const toggleTheme = useCallback(() => {
    setMode((m) => (m === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setMode }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return ctx;
}
