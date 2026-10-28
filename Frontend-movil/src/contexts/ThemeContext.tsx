import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageSourcePropType } from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  buttonImage: ImageSourcePropType;
  activationImage: ImageSourcePropType; // ← new
  icon: string;
  headercolor1: string;
  headercolor2: string;

  // ─── Contacts ───────────────────────────────────────────────
  contactCardBg: string;
  contactCardBorder: string;
  contactName: string;
  contactSubtext: string;
  contactAccent: string;
  contactBadgeBg: string;
  contactBadgeText: string;
  contactBadgeBorder: string;
  contactAvatarBorder: string;
  contactDivider: string;
  contactIconCallBg: string;
  contactIconWaBg: string;
  contactIconLocBg: string;
  contactIconCallColor: string;
  contactIconLocColor: string;
  contactEditButton: string;
  contactEditButtonIcon: string;
  contactSuggestionBg: string;
  contactSuggestionBorder: string;
  contactSuggestionIcon: string;
  contactAddButtonBg: string;
  contactFloatingBg: string;
  contactCounterBg: string;
  contactCounterIcon: string;
  contactSearchBg: string;
  contactSearchText: string;

  // ─── Assistance ─────────────────────────────────────────────
  assistanceEmergencyGradient: [string, string];
  assistanceViolenceGradient: [string, string];
  assistanceMentalGradient: [string, string];
  assistanceUserIconBg: string;
  assistanceBulbIconBg: string;
  assistanceBulbIconColor: string;
  assistanceStarIconBg: string;
};

// ─── Automatic contrast ──────────────────────────────────────────────────────

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

// ─── Assets logos ─────────────────────────────────────────────────────────────

const currentLogo = require("../../assets/imagesAlertaMujer/logos/logoAlertaMujer.png");
const purpleLogo = require("../../assets/imagesAlertaMujer/logos/logo-morado.png");
const blueLogo   = require("../../assets/imagesAlertaMujer/logos/logo-Azul.png");
const pinkLogo   = require("../../assets/imagesAlertaMujer/logos/logo-rosa.png");
const wineLogo   = require("../../assets/imagesAlertaMujer/logos/logo-vino.png");
const blackLogo  = require("../../assets/imagesAlertaMujer/logos/logo-negro.png");

// ─── Button assets ───────────────────────────────────────────────────────────

const purpleButton = require("../../assets/imagesAlertaMujer/ScInicio/boton-morado.png");
const blueButton   = require("../../assets/imagesAlertaMujer/ScInicio/boton-azul.png");
const pinkButton   = require("../../assets/imagesAlertaMujer/ScInicio/boton-rosa.png");
const wineButton   = require("../../assets/imagesAlertaMujer/ScInicio/boton-vino.png");
const goldButton = require("../../assets/imagesAlertaMujer/ScInicio/boton-dorado.png");

// ─── Assets activacion ────────────────────────────────────────────────────────

const activationPurple = require("../../assets/imagesAlertaMujer/ScActivacion/morado.png");
const activationPink   = require("../../assets/imagesAlertaMujer/ScActivacion/rosa.png");
const activationBlue   = require("../../assets/imagesAlertaMujer/ScActivacion/Azul.png");
const activationWine   = require("../../assets/imagesAlertaMujer/ScActivacion/vino.png");
const activationLogo   = require("../../assets/imagesAlertaMujer/ScActivacion/LOGO.png");

// ─── Images preloaded when the app opens (avoids the delay when changing theme) ───

export const PRELOAD_IMAGES: ImageSourcePropType[] = [
  currentLogo, purpleLogo, blueLogo, pinkLogo, wineLogo, blackLogo,
  purpleButton, blueButton, pinkButton, wineButton, goldButton,
  activationPurple, activationPink, activationBlue, activationWine, activationLogo,
];

// ─── Themes ──────────────────────────────────────────────────────────────────

const THEMES: Record<AppMode, AppTheme> = {

  // ── LIGHT ─────────────────────────────────────────────────────────────────
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
    tabInactiveColor: "rgb(255, 255, 255)",
    logo: currentLogo,
    buttonImage: purpleButton,
    activationImage: activationPurple,
    icon: "#9b009b",
    headercolor1: "#c4a8d6",
    headercolor2: "#7b1db2",
    contactCardBg: "#ffffff",
    contactCardBorder: "#e0d0f0",
    contactName: "#2a0045",
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
    contactEditButton: "#F3E5F5",
    contactEditButtonIcon: "#7B1FA2",
    contactSuggestionBg: "#FAF7FF",
    contactSuggestionBorder: "#CE93D8",
    contactSuggestionIcon: "#AB47BC",
    contactAddButtonBg: "#7B1FA2",
    contactFloatingBg: "#7B1FA2",
    contactCounterBg: "#F3E5F5",
    contactCounterIcon: "#7B1FA2",
    contactSearchBg: "#F3EEF8",
    contactSearchText: "#2a0045",
    assistanceEmergencyGradient: ["#c4a8d6", "#7b1db2"],
    assistanceViolenceGradient: ["#b891d0", "#6a14a6"],
    assistanceMentalGradient:    ["#c4a8d6", "#9a2fcf"],
    assistanceUserIconBg:        "purple",
    assistanceBulbIconBg:    "rgba(205, 117, 230, 0.29)",
    assistanceBulbIconColor: "#1E1228",
    assistanceStarIconBg:    "purple",
  },

  // ── DARK ──────────────────────────────────────────────────────────────────
  dark: {
    mode: "dark",
    headerBackground: "#000000",
    headerText: "#fefeff",
    background: "#3d3d42",
    containerBackground: "#1e1e22",
    text: "#f0e6ff",
    card: "#2e2e38",
    tabBackground: "#000000",
    tabActiveColor: "#9718ff",
    tabInactiveColor: "rgba(230, 217, 247, 0.89)",
    logo: blackLogo,
    buttonImage: goldButton,
    activationImage: activationLogo,
    icon: "#c084fc",
    headercolor1: "#030303",
    headercolor2: "#200138",
    contactCardBg: "#28282f",
    contactCardBorder: "#3d3d50",
    contactName: "#e8d5ff",
    contactSubtext: "#9e8fbb",
    contactAccent: "#c084fc",
    contactBadgeBg: "#3a2d55",
    contactBadgeText: "#d8b4fe",
    contactBadgeBorder: "#6d28d9",
    contactAvatarBorder: "#a855f7",
    contactDivider: "#3a3a48",
    contactIconCallBg: "#2d2040",
    contactIconCallColor: "#c084fc",
    contactIconWaBg: "#1a2e22",
    contactIconLocBg: "#1a233a",
    contactIconLocColor: "#60a5fa",
    contactEditButton: "#2d2040",
    contactEditButtonIcon: "#c084fc",
    contactSuggestionBg: "#22202e",
    contactSuggestionBorder: "#5b21b6",
    contactSuggestionIcon: "#a78bfa",
    contactAddButtonBg: "#7c3aed",
    contactFloatingBg: "#7c3aed",
    contactCounterBg: "#2d2040",
    contactCounterIcon: "#c084fc",
    contactSearchBg: "#232330",
    contactSearchText: "#e8d5ff",
    assistanceEmergencyGradient: ["#3a035c", "#0b022c"],
    assistanceViolenceGradient: ["#350249", "#33012b"],
    assistanceMentalGradient:    ["#4c1d95", "#1e0b3a"],
    assistanceUserIconBg:        "#3b0764",
    assistanceBulbIconBg:    "#3a2d55",
    assistanceBulbIconColor: "#c084fc",
    assistanceStarIconBg:    "#3b0764",
  },

  // ── ROSA ──────────────────────────────────────────────────────────────────
  rosa: {
    mode: "rosa",
    headerBackground: "#cf3389",
    headerText: getContrastText("#ee108a"),
    background: "#fce4f0",
    containerBackground: "#fffbfe",
    text: "#3a0020",
    card: "#fff0f7",
    tabBackground: "#cf3389",
    tabActiveColor: getContrastText("#3d033d"),
    tabInactiveColor: "rgb(255, 255, 255)",
    logo: pinkLogo,
    buttonImage: pinkButton,
    activationImage: activationPink,
    icon: "#eb0a86",
    headercolor1: "#cf3389",
    headercolor2: "#860e52",
    contactCardBg: "#fff5fa",
    contactCardBorder: "#f8b4d4",
    contactName: "#3a0020",
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
    contactEditButton: "#fce4f0",
    contactEditButtonIcon: "#c2185b",
    contactSuggestionBg: "#fff5fa",
    contactSuggestionBorder: "#f48fb1",
    contactSuggestionIcon: "#e91e8c",
    contactAddButtonBg: "#c2185b",
    contactFloatingBg: "#c2185b",
    contactCounterBg: "#fce4f0",
    contactCounterIcon: "#c2185b",
    contactSearchBg: "#fde8f4",
    contactSearchText: "#3a0020",
    assistanceEmergencyGradient: ["#aa0069", "#8f45b9"],
    assistanceViolenceGradient: ["#e70059", "#8000a7"],
    assistanceMentalGradient:    ["#a80a81", "#f58ef5"],
    assistanceUserIconBg:        "#a0005a",
    assistanceBulbIconBg:    "#fce4f0",
    assistanceBulbIconColor: "#c2185b",
    assistanceStarIconBg:    "#a0005a",
  },

  // ── WINE ──────────────────────────────────────────────────────────────────
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
    logo: wineLogo,
    buttonImage: wineButton,
    activationImage: activationWine,
    icon: "#770736",
    headercolor1: "#770736",
    headercolor2: "#4a0020",
    contactCardBg: "#fff8f8",
    contactCardBorder: "#f5c6c6",
    contactName: "#2a0000",
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
    contactIconLocBg: "#FFF3E0",
    contactIconLocColor: "#e65100",
    contactEditButton: "#FFEBEE",
    contactEditButtonIcon: "#b71c1c",
    contactSuggestionBg: "#fff8f8",
    contactSuggestionBorder: "#EF9A9A",
    contactSuggestionIcon: "#c62828",
    contactAddButtonBg: "#b71c1c",
    contactFloatingBg: "#b71c1c",
    contactCounterBg: "#FFEBEE",
    contactCounterIcon: "#b71c1c",
    contactSearchBg: "#fff0f0",
    contactSearchText: "#2a0000",
    assistanceEmergencyGradient: ["#470238", "#83044a"],
    assistanceViolenceGradient: ["#28033a", "#942010"],
    assistanceMentalGradient:    ["#680c2f", "#62026b"],
    assistanceUserIconBg:        "#4a0020",
    assistanceBulbIconBg:    "#FFEBEE",
    assistanceBulbIconColor: "#b71c1c",
    assistanceStarIconBg:    "#4a0020",
  },

  // ── BLUE ──────────────────────────────────────────────────────────────────
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
    logo: blueLogo,
    buttonImage: blueButton,
    activationImage: activationBlue,
    icon: "#1565C0",
    headercolor1: "#0b013b",
    headercolor2: "#1a237e",
    contactCardBg: "#f8faff",
    contactCardBorder: "#c5cae9",
    contactName: "#0b013b",
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
    contactEditButton: "#E3F2FD",
    contactEditButtonIcon: "#1565C0",
    contactSuggestionBg: "#f0f4ff",
    contactSuggestionBorder: "#9FA8DA",
    contactSuggestionIcon: "#3949AB",
    contactAddButtonBg: "#1565C0",
    contactFloatingBg: "#1565C0",
    contactCounterBg: "#E3F2FD",
    contactCounterIcon: "#1565C0",
    contactSearchBg: "#eef2ff",
    contactSearchText: "#0b013b",
    assistanceEmergencyGradient: ["#1d0479", "#7a3fbe"],
    assistanceViolenceGradient: ["#2c5d96", "#4f07a1"],
    assistanceMentalGradient:    ["#3c48a5", "#02021a"],
    assistanceUserIconBg:        "#1a237e",
    assistanceBulbIconBg:    "#E8EAF6",
    assistanceBulbIconColor: "#1565C0",
    assistanceStarIconBg:    "#1a237e",
  },

  // ── MAGENTA ───────────────────────────────────────────────────────────────
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
    logo: purpleLogo,
    buttonImage: purpleButton,
    activationImage: activationPurple,
    icon: "#6a0572",
    headercolor1: "#490449",
    headercolor2: "#860386",
    contactCardBg: "#fdf4fd",
    contactCardBorder: "#e1bee7",
    contactName: "#2a002a",
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
    contactEditButton: "#F3E5F5",
    contactEditButtonIcon: "#6a0572",
    contactSuggestionBg: "#fdf4fd",
    contactSuggestionBorder: "#CE93D8",
    contactSuggestionIcon: "#8E24AA",
    contactAddButtonBg: "#6a0572",
    contactFloatingBg: "#6a0572",
    contactCounterBg: "#F3E5F5",
    contactCounterIcon: "#6a0572",
    contactSearchBg: "#fce8fc",
    contactSearchText: "#2a002a",
    assistanceEmergencyGradient: ["#4f1970", "#821bbd"],
    assistanceViolenceGradient: ["#6a0572", "#2d002d"],
    assistanceMentalGradient:    ["#8361e9", "#38023b"],
    assistanceUserIconBg:        "#2d002d",
    assistanceBulbIconBg:    "#F3E5F5",
    assistanceBulbIconColor: "#6a0572",
    assistanceStarIconBg:    "#2d002d",
  },
};

// ─── Contexto ─────────────────────────────────────────────────────────────────

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
  setMode: (m: AppMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// The theme belongs to the phone, not the account: it is kept after signing out and restarting the app
const THEME_KEY = "@alerta_mujer:tema";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("light");
  // Nothing is painted until the saved theme is read, so the light theme never flashes
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((savedItem) => {
        if (savedItem && savedItem in THEMES) setModeState(savedItem as AppMode);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const setMode = useCallback((m: AppMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m).catch(() => {});
  }, []);

  const theme = useMemo(() => THEMES[mode], [mode]);

  const toggleTheme = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ theme, toggleTheme, setMode }),
    [theme, toggleTheme, setMode]
  );

  if (!loaded) return null;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}