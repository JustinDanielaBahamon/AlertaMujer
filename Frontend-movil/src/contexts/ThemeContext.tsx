import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ImageSourcePropType } from "react-native";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AppMode = "light" | "dark" | "rosa" | "vino" | "fucsia" | "magenta";

export type AppTheme = {
  mode: AppMode;
  headerBackground: string;
  headerText: string;
  background: string;
  text: string;
  card: string;
  tabBackground: string;
  tabActiveColor: string;
  tabInactiveColor: string;
  logo: ImageSourcePropType;         // ✅ nuevo
  imagenBoton: ImageSourcePropType;  // ✅ nuevo
};

// ─── Utilidad de contraste automático ────────────────────────────────────────

function hexToRgb(color: string): { r: number; g: number; b: number } | null {
  const hex = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hex) return { r: parseInt(hex[1], 16), g: parseInt(hex[2], 16), b: parseInt(hex[3], 16) };
  const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgb) return { r: parseInt(rgb[1]), g: parseInt(rgb[2]), b: parseInt(rgb[3]) };
  return null;
}

function getContrastText(bg: string): string {
  const rgb = hexToRgb(bg);
  if (!rgb) return "#ffffff";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}

// ─── Assets temporales (reemplazar cuando tengas los logos) ──────────────────

const logoActual = require("../../assets/imagesAlertaMujer/logoAlertaMujer.png");
const botonActual = require("../../assets/imagesAlertaMujer/ScInicio/boton2.png");

// ─── Definición de los temas ──────────────────────────────────────────────────

const THEMES: Record<AppMode, AppTheme> = {
  light: {
    mode: "light",
    headerBackground: "rgb(202,171,222)",
    headerText: "#1a1a1a",
    background: "#f5f0fa",
    text: "#1a1a1a",
    card: "#ffffff",
    tabBackground: "rgb(202,171,222)",
    tabActiveColor: "#45046b",
    tabInactiveColor: "rgba(255,255,255,0.7)",
    logo: logoActual,        // → reemplazar por logo-light.png
    imagenBoton: botonActual, // → reemplazar por boton-light.png
  },
  dark: {
    mode: "dark",
    headerBackground: "#1a1525",
    headerText: "#f0e6ff",
    background: "#121018",
    text: "#f0e6ff",
    card: "#1e1a2e",
    tabBackground: "#1a1525",
    tabActiveColor: "#f0e6ff",
    tabInactiveColor: "rgba(240,230,255,0.4)",
    logo: logoActual,        // → reemplazar por logo-dark.png
    imagenBoton: botonActual, // → reemplazar por boton-dark.png
  },
  rosa: {
    mode: "rosa",
    headerBackground: "#ee108a",
    headerText: getContrastText("#ee108a"),
    background: "#fff0f8",
    text: "#3a0020",
    card: "#ffe0f2",
    tabBackground: "#ee108a",
    tabActiveColor: getContrastText("#ee108a"),
    tabInactiveColor: "rgba(255,255,255,0.5)",
    logo: logoActual,        // → reemplazar por logo-rosa.png
    imagenBoton: botonActual, // → reemplazar por boton-rosa.png
  },
  vino: {
    mode: "vino",
    headerBackground: "#680808",
    headerText: getContrastText("#680808"),
    background: "#fff5f5",
    text: "#2a0000",
    card: "#ffe8e8",
    tabBackground: "#680808",
    tabActiveColor: getContrastText("#680808"),
    tabInactiveColor: "rgba(255,255,255,0.5)",
    logo: logoActual,        // → reemplazar por logo-vino.png
    imagenBoton: botonActual, // → reemplazar por boton-vino.png
  },
  fucsia: {
    mode: "fucsia",
    headerBackground: "#0b013b",
    headerText: getContrastText("#0b013b"),
    background: "#f0f0ff",
    text: "#0b013b",
    card: "#e8e6ff",
    tabBackground: "#0b013b",
    tabActiveColor: getContrastText("#0b013b"),
    tabInactiveColor: "rgba(255,255,255,0.4)",
    logo: logoActual,        // → reemplazar por logo-fucsia.png
    imagenBoton: botonActual, // → reemplazar por boton-fucsia.png
  },
  magenta: {
    mode: "magenta",
    headerBackground: "#490449",
    headerText: getContrastText("#490449"),
    background: "#fdf0fd",
    text: "#2a002a",
    card: "#f5e0f5",
    tabBackground: "#490449",
    tabActiveColor: getContrastText("#490449"),
    tabInactiveColor: "rgba(255,255,255,0.5)",
    logo: logoActual,        // → reemplazar por logo-magenta.png
    imagenBoton: botonActual, // → reemplazar por boton-magenta.png
  },
};

// ─── Contexto ─────────────────────────────────────────────────────────────────

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
  setMode: (m: AppMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>("light");

  const theme = useMemo(() => THEMES[mode], [mode]);

  const toggleTheme = useCallback(() => {
    setMode((m) => (m === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setMode }),
    [theme, toggleTheme, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}