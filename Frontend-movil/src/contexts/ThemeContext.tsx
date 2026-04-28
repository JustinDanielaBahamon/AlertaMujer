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
  logo: ImageSourcePropType;
  imagenBoton: ImageSourcePropType;
  icono: string;
  headercolor1: string;
  headercolor2: string;

  // ─── Contactos ───────────────────────────────────────────────
  contactCardBg: string;          // fondo de la tarjeta
  contactCardBorder: string;      // borde de la tarjeta
  contactNombre: string;          // texto nombre
  contactSubtext: string;         // teléfono, textos secundarios
  contactAccent: string;          // color principal de acento (iconos, bordes foto)
  contactBadgeBg: string;         // fondo del badge parentesco
  contactBadgeText: string;       // texto del badge
  contactBadgeBorder: string;     // borde del badge
  contactAvatarBorder: string;    // aro de la foto de perfil
  contactDivider: string;         // línea divisora acciones
  contactIconCallBg: string;      // fondo círculo Llamar
  contactIconWaBg: string;        // fondo círculo WhatsApp
  contactIconLocBg: string;       // fondo círculo Ubicación
  contactIconCallColor: string;   // color icono Llamar
  contactIconLocColor: string;    // color icono Ubicación
  contactBotonEditar: string;     // fondo boton editar
  contactBotonEditarIcon: string; // color icono editar
  contactSugerenciaBg: string;    // fondo tarjeta "agregar más"
  contactSugerenciaBorder: string;// borde tarjeta "agregar más"
  contactSugerenciaIcon: string;  // color icono user-plus
  contactBotonAgregarBg: string;  // fondo botón "+ Agregar"
  contactFlotanteBg: string;      // fondo botón flotante
  contactCousserBg: string;       // fondo ícono de conteo
  contactCousserIcon: string;     // color ícono de conteo
  contactBuscadorBg: string;      // fondo barra de búsqueda
  contactBuscadorText: string;    // texto dentro del buscador
};

// ─── Contraste automático ─────────────────────────────────────────────────────

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

// ─── Assets ──────────────────────────────────────────────────────────────────

const logoActual = require("../../assets/imagesAlertaMujer/logos/logoAlertaMujer.png");
const logoMorado = require("../../assets/imagesAlertaMujer/logos/logo-morado.png");
const logoAzul   = require("../../assets/imagesAlertaMujer/logos/logo-Azul.png");
const logorosa   = require("../../assets/imagesAlertaMujer/logos/logo-rosa.png");
const logovino   = require("../../assets/imagesAlertaMujer/logos/logo-vino.png");
const logonegro  = require("../../assets/imagesAlertaMujer/logos/logo-negro.png");

const botonmorado = require("../../assets/imagesAlertaMujer/ScInicio/boton-morado.png");
const botonAzul   = require("../../assets/imagesAlertaMujer/ScInicio/boton-azul.png");
const botonrosa   = require("../../assets/imagesAlertaMujer/ScInicio/boton-rosa.png");
const botonvino   = require("../../assets/imagesAlertaMujer/ScInicio/boton-vino.png");
const botondorado = require("../../assets/imagesAlertaMujer/ScInicio/boton-dorado.png");

// ─── Temas ────────────────────────────────────────────────────────────────────

const THEMES: Record<AppMode, AppTheme> = {

  // ── LIGHT (morado/lavanda) ─────────────────────────────────────────────────
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
    logo: logoActual,
    imagenBoton: botonmorado,
    icono: "#9b009b",
    headercolor1: "#c4a8d6",
    headercolor2: "#7b1db2",

    // Contactos — tonos lavanda/morado claros
    contactCardBg: "#ffffff",
    contactCardBorder: "#e0d0f0",
    contactNombre: "#2a0045",
    contactSubtext: "#7a6090",
    contactAccent: "#7B1FA2",
    contactBadgeBg: "#F3E5F5",
    contactBadgeText: "#6A1B9A",
    contactBadgeBorder: "#CE93D8",
    contactAvatarBorder: "#AB47BC",
    contactDivider: "#EDE7F6",
    contactIconCallBg: "#F3E5F5",
    contactIconCallColor: "#7B1FA2",
    contactIconWaBg: "#E8F5E9",
    contactIconLocBg: "#E8EAF6",
    contactIconLocColor: "#3949AB",
    contactBotonEditar: "#F3E5F5",
    contactBotonEditarIcon: "#7B1FA2",
    contactSugerenciaBg: "#FAF7FF",
    contactSugerenciaBorder: "#CE93D8",
    contactSugerenciaIcon: "#AB47BC",
    contactBotonAgregarBg: "#7B1FA2",
    contactFlotanteBg: "#7B1FA2",
    contactCousserBg: "#F3E5F5",
    contactCousserIcon: "#7B1FA2",
    contactBuscadorBg: "#F3EEF8",
    contactBuscadorText: "#2a0045",
  },

  // ── DARK (oscuro con acentos morado/verde/azul) ────────────────────────────
  dark: {
    mode: "dark",
    headerBackground: "#000000",
    headerText: "#fefeff",
    background: "#2e2e31",
    containerBackground: "#1e1e22",
    text: "#f0e6ff",
    card: "#2e2e38",
    tabBackground: "#000000",
    tabActiveColor: "#fcfcfc",
    tabInactiveColor: "rgba(133, 128, 139, 0.4)",
    logo: logonegro,
    imagenBoton: botondorado,
    icono: "#c084fc",
    headercolor1: "#030303",
    headercolor2: "#010e33",

    // Contactos — oscuro con acentos morado, verde y azul
    contactCardBg: "#28282f",
    contactCardBorder: "#3d3d50",
    contactNombre: "#e8d5ff",
    contactSubtext: "#9e8fbb",
    contactAccent: "#c084fc",
    contactBadgeBg: "#3a2d55",
    contactBadgeText: "#d8b4fe",
    contactBadgeBorder: "#6d28d9",
    contactAvatarBorder: "#a855f7",
    contactDivider: "#3a3a48",
    contactIconCallBg: "#2d2040",      // morado oscuro
    contactIconCallColor: "#c084fc",   // morado claro
    contactIconWaBg: "#1a2e22",        // verde oscuro
    contactIconLocBg: "#1a233a",       // azul oscuro
    contactIconLocColor: "#60a5fa",    // azul claro
    contactBotonEditar: "#2d2040",
    contactBotonEditarIcon: "#c084fc",
    contactSugerenciaBg: "#22202e",
    contactSugerenciaBorder: "#5b21b6",
    contactSugerenciaIcon: "#a78bfa",
    contactBotonAgregarBg: "#7c3aed",
    contactFlotanteBg: "#7c3aed",
    contactCousserBg: "#2d2040",
    contactCousserIcon: "#c084fc",
    contactBuscadorBg: "#232330",
    contactBuscadorText: "#e8d5ff",
  },

  // ── ROSA (fucsia/rosa) ─────────────────────────────────────────────────────
  rosa: {
    mode: "rosa",
    headerBackground: "#cf3389",
    headerText: getContrastText("#ee108a"),
    background: "#fce4f0",
    containerBackground: "#fffbfe",
    text: "#3a0020",
    card: "#fff0f7",
    tabBackground: "#cf3389",
    tabActiveColor: getContrastText("#ee108a"),
    tabInactiveColor: "rgba(255, 255, 255, 0.95)",
    logo: logonegro,
    imagenBoton: botonrosa,
    icono: "#eb0a86",
    headercolor1: "#cf3389",
    headercolor2: "#a0005a",

    // Contactos — paleta rosa/fucsia con contraste
    contactCardBg: "#fff5fa",
    contactCardBorder: "#f8b4d4",
    contactNombre: "#3a0020",
    contactSubtext: "#9c3060",
    contactAccent: "#c2185b",
    contactBadgeBg: "#fce4f0",
    contactBadgeText: "#880e4f",
    contactBadgeBorder: "#f48fb1",
    contactAvatarBorder: "#e91e8c",
    contactDivider: "#fce4f0",
    contactIconCallBg: "#fce4f0",
    contactIconCallColor: "#c2185b",
    contactIconWaBg: "#E8F5E9",
    contactIconLocBg: "#fde8f4",
    contactIconLocColor: "#ad1457",
    contactBotonEditar: "#fce4f0",
    contactBotonEditarIcon: "#c2185b",
    contactSugerenciaBg: "#fff5fa",
    contactSugerenciaBorder: "#f48fb1",
    contactSugerenciaIcon: "#e91e8c",
    contactBotonAgregarBg: "#c2185b",
    contactFlotanteBg: "#c2185b",
    contactCousserBg: "#fce4f0",
    contactCousserIcon: "#c2185b",
    contactBuscadorBg: "#fde8f4",
    contactBuscadorText: "#3a0020",
  },

  // ── VINO (borgoña/vino tinto) ──────────────────────────────────────────────
  vino: {
    mode: "vino",
    headerBackground: "#770736",
    headerText: getContrastText("#920505"),
    background: "#fff5f5",
    containerBackground: "#ffffff",
    text: "#2a0000",
    card: "#fff0f0",
    tabBackground: "#770736",
    tabActiveColor: getContrastText("#920505"),
    tabInactiveColor: "rgb(255, 247, 247)",
    logo: logovino,
    imagenBoton: botonvino,
    icono: "#770736",
    headercolor1: "#770736",
    headercolor2: "#4a0020",

    // Contactos — paleta vino con rojos cálidos y contraste crema
    contactCardBg: "#fff8f8",
    contactCardBorder: "#f5c6c6",
    contactNombre: "#2a0000",
    contactSubtext: "#7a3535",
    contactAccent: "#b71c1c",
    contactBadgeBg: "#FFEBEE",
    contactBadgeText: "#b71c1c",
    contactBadgeBorder: "#EF9A9A",
    contactAvatarBorder: "#c62828",
    contactDivider: "#ffdede",
    contactIconCallBg: "#FFEBEE",
    contactIconCallColor: "#b71c1c",
    contactIconWaBg: "#E8F5E9",
    contactIconLocBg: "#FFF3E0",       // naranja muy claro para contraste
    contactIconLocColor: "#e65100",
    contactBotonEditar: "#FFEBEE",
    contactBotonEditarIcon: "#b71c1c",
    contactSugerenciaBg: "#fff8f8",
    contactSugerenciaBorder: "#EF9A9A",
    contactSugerenciaIcon: "#c62828",
    contactBotonAgregarBg: "#b71c1c",
    contactFlotanteBg: "#b71c1c",
    contactCousserBg: "#FFEBEE",
    contactCousserIcon: "#b71c1c",
    contactBuscadorBg: "#fff0f0",
    contactBuscadorText: "#2a0000",
  },

  // ── AZUL (navy/índigo) ─────────────────────────────────────────────────────
  Azul: {
    mode: "Azul",
    headerBackground: "#0b013b",
    headerText: getContrastText("#0b013b"),
    background: "#f0f0ff",
    containerBackground: "#ffffff",
    text: "#0b013b",
    card: "#eef2ff",
    tabBackground: "#0b013b",
    tabActiveColor: getContrastText("#0b013b"),
    tabInactiveColor: "rgba(255,255,255,0.4)",
    logo: logoAzul,
    imagenBoton: botonAzul,
    icono: "#1565C0",
    headercolor1: "#0b013b",
    headercolor2: "#1a237e",

    // Contactos — paleta azul navy con celeste y índigo
    contactCardBg: "#f8faff",
    contactCardBorder: "#c5cae9",
    contactNombre: "#0b013b",
    contactSubtext: "#3949ab",
    contactAccent: "#1565C0",
    contactBadgeBg: "#E8EAF6",
    contactBadgeText: "#1a237e",
    contactBadgeBorder: "#9FA8DA",
    contactAvatarBorder: "#1976D2",
    contactDivider: "#e8eaf6",
    contactIconCallBg: "#E3F2FD",
    contactIconCallColor: "#1565C0",
    contactIconWaBg: "#E8F5E9",
    contactIconLocBg: "#E8EAF6",
    contactIconLocColor: "#283593",
    contactBotonEditar: "#E3F2FD",
    contactBotonEditarIcon: "#1565C0",
    contactSugerenciaBg: "#f0f4ff",
    contactSugerenciaBorder: "#9FA8DA",
    contactSugerenciaIcon: "#3949AB",
    contactBotonAgregarBg: "#1565C0",
    contactFlotanteBg: "#1565C0",
    contactCousserBg: "#E3F2FD",
    contactCousserIcon: "#1565C0",
    contactBuscadorBg: "#eef2ff",
    contactBuscadorText: "#0b013b",
  },

  // ── MAGENTA (morado oscuro/ciruela) ───────────────────────────────────────
  magenta: {
    mode: "magenta",
    headerBackground: "#490449",
    headerText: getContrastText("#490449"),
    background: "#fdf0fd",
    containerBackground: "#ffffff",
    text: "#2a002a",
    card: "#fce8fc",
    tabBackground: "#490449",
    tabActiveColor: getContrastText("#490449"),
    tabInactiveColor: "rgba(255,255,255,0.5)",
    logo: logoMorado,
    imagenBoton: botonmorado,
    icono: "#6a0572",
    headercolor1: "#5a095a",
    headercolor2: "#2d002d",

    // Contactos — paleta magenta/ciruela con violetas
    contactCardBg: "#fdf4fd",
    contactCardBorder: "#e1bee7",
    contactNombre: "#2a002a",
    contactSubtext: "#7b2d7b",
    contactAccent: "#6a0572",
    contactBadgeBg: "#F3E5F5",
    contactBadgeText: "#4a0072",
    contactBadgeBorder: "#CE93D8",
    contactAvatarBorder: "#8E24AA",
    contactDivider: "#f3e5f3",
    contactIconCallBg: "#F3E5F5",
    contactIconCallColor: "#6a0572",
    contactIconWaBg: "#E8F5E9",
    contactIconLocBg: "#EDE7F6",
    contactIconLocColor: "#4527A0",
    contactBotonEditar: "#F3E5F5",
    contactBotonEditarIcon: "#6a0572",
    contactSugerenciaBg: "#fdf4fd",
    contactSugerenciaBorder: "#CE93D8",
    contactSugerenciaIcon: "#8E24AA",
    contactBotonAgregarBg: "#6a0572",
    contactFlotanteBg: "#6a0572",
    contactCousserBg: "#F3E5F5",
    contactCousserIcon: "#6a0572",
    contactBuscadorBg: "#fce8fc",
    contactBuscadorText: "#2a002a",
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