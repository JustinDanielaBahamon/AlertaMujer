import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ImageSourcePropType } from "react-native";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AppMode = "light" | "dark" | "rosa" | "vino" | "Azul" | "magenta";

export type AppTheme = {
  mode: AppMode;
  headerBackground: string;
  headerText: string;
  background: string;
  containerBackground: string;
  text: string;
  card: string;
  tabBackground: string;
  tabActiveColor: string;
  tabInactiveColor: string;
  logo: ImageSourcePropType;         // ✅ nuevo
  imagenBoton: ImageSourcePropType; 
  icono:string; // ✅ nuevo
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

const logoActual = require("../../assets/imagesAlertaMujer/logos/logoAlertaMujer.png");
const logoMorado= require("../../assets/imagesAlertaMujer/logos/logo-morado.png");
const logoAzul = require("../../assets/imagesAlertaMujer/logos/logo-Azul.png");
const logorosa = require("../../assets/imagesAlertaMujer/logos/logo-rosa.png");
const logovino = require("../../assets/imagesAlertaMujer/logos/logo-vino.png");
const logonegro = require("../../assets/imagesAlertaMujer/logos/logo-negro.png");

const botonmorado = require("../../assets/imagesAlertaMujer/ScInicio/boton-morado.png");
const botonAzul = require("../../assets/imagesAlertaMujer/ScInicio/boton-azul.png");
const botonrosa = require("../../assets/imagesAlertaMujer/ScInicio/boton-rosa.png");
const botonvino = require("../../assets/imagesAlertaMujer/ScInicio/boton-vino.png");
const botondorado = require("../../assets/imagesAlertaMujer/ScInicio/boton-dorado.png");


// ─── Definición de los temas ──────────────────────────────────────────────────

const THEMES: Record<AppMode, AppTheme> = {
  light: {
    mode: "light",
    headerBackground: "rgb(202,171,222)",
    headerText: "#1a1a1a",
    background: "#f5f0fa",
    containerBackground: "#ffffff",  
    text: "#1a1a1a",
    card: "#ffffff",
    tabBackground: "rgb(202,171,222)",
    tabActiveColor: "#45046b",
    tabInactiveColor: "rgba(255, 241, 241, 0.7)",
    logo: logoActual,        // → reemplazar por logo-light.png
    imagenBoton: botonmorado, // → reemplazar por boton-light.
    icono: "#9b009b",
  },
  dark: {
    mode: "dark",
    headerBackground: "#000000",
    headerText: "#fefeff",
    background: "#2e2e31",
    containerBackground: "#665d5d",  
    text: "#f0e6ff",
    card: "#605f64",
    tabBackground: "#000000",
    tabActiveColor: "#fcfcfc",
    tabInactiveColor: "rgba(133, 128, 139, 0.4)",
    logo: logonegro,        // → reemplazar por logo-dark.png
    imagenBoton: botondorado, // → reemplazar por boton-dark.
    icono: "#f0e2ea",
  },
  rosa: {
    mode: "rosa",
    headerBackground: "#cf3389",
    headerText: getContrastText("#ee108a"),
    background: "#dfc2d1",
    containerBackground: "#fffbfe",  
    text: "#3a0020",
    card: "#d69dbf",
    tabBackground: "#cf3389",
    tabActiveColor: getContrastText("#ee108a"),
    tabInactiveColor: "rgba(255, 255, 255, 0.95)",
    logo: logonegro,        // → reemplazar por logo-rosa.png
    imagenBoton: botonrosa, // → reemplazar por boton-rosa.png
    icono: "#eb0a86",
  },
  vino: {
    mode: "vino",
    headerBackground: "#770736",
    headerText: getContrastText("#920505"),
    background: "#fff5f5",
    containerBackground: "#ffffff",  
    text: "#2a0000",
    card: "#ffe8e8",
    tabBackground: "#770736",
    tabActiveColor: getContrastText("#920505"),
    tabInactiveColor: "rgb(255, 247, 247)",
    logo: logovino,        // → reemplazar por logo-vino.png
    imagenBoton: botonvino, // → reemplazar por boton-vino.png
    icono: "#3a0020",
  },
  Azul: {
    mode: "Azul",
    headerBackground: "#0b013b",
    headerText: getContrastText("#0b013b"),
    background: "#f0f0ff",
    containerBackground: "#ffffff",  
    text: "#0b013b",
    card: "#e8e6ff",
    tabBackground: "#0b013b",
    tabActiveColor: getContrastText("#0b013b"),
    tabInactiveColor: "rgba(255,255,255,0.4)",
    logo: logoAzul,        // → reemplazar por logo-fucsia.png
    imagenBoton: botonAzul, // → reemplazar por boton-fucsia.png
    icono: "#3a0020",
  },
  magenta: {
    mode: "magenta",
    headerBackground: "#490449",
    headerText: getContrastText("#490449"),
    background: "#fdf0fd",
    containerBackground: "#ffffff",  
    text: "#2a002a",
    card: "#f5e0f5",
    tabBackground: "#490449",
    tabActiveColor: getContrastText("#490449"),
    tabInactiveColor: "rgba(255,255,255,0.5)",
    logo: logoMorado,        // → reemplazar por logo-magenta.png
    imagenBoton: botonmorado, // → reemplazar por boton-magenta.png
    icono: "#3a0020",
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