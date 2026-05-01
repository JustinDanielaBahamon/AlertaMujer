import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { BUTTON_COLORS } from "./buttonStyle";

// ─── Tipos públicos ───────────────────────────────────────────────────────────
export type TapType = "short" | "double" | "hold" | null;

export interface TapOption {
  id: TapType;
  emoji: string;
  title: string;
  badge: string;
  desc: string;
  highlightLabel: string;
  boldLabel: string;
  detailDesc: string;
  color: string;
  colorLight: string;
  colorBorder: string;
}

// ─── Datos estáticos de gestos ────────────────────────────────────────────────
export const TAP_OPTIONS: TapOption[] = [
  {
    id: "short",
    emoji: "👆",
    title: "Toque corto",
    badge: "Discreta",
    highlightLabel: "Toque corto: ",
    boldLabel: "Alerta discreta.",
    desc: "Envía un SMS silencioso con tu ubicación exacta.",
    detailDesc: "Envía un SMS silencioso con tu ubicación.",
    color: BUTTON_COLORS.row1Color,
    colorLight: BUTTON_COLORS.row1Light,
    colorBorder: BUTTON_COLORS.row1Border,
  },
  {
    id: "double",
    emoji: "✌️",
    title: "Doble toque",
    badge: "Urgente",
    highlightLabel: "Doble toque: ",
    boldLabel: "Alerta urgente.",
    desc: "Tus contactos reciben notificación y llamada.",
    detailDesc: "Tus contactos reciben notificación y llamada automática.",
    color: BUTTON_COLORS.row2Color,
    colorLight: BUTTON_COLORS.row2Light,
    colorBorder: BUTTON_COLORS.row2Border,
  },
  {
    id: "hold",
    emoji: "✊",
    title: "Mantener presionado",
    badge: "Máxima",
    highlightLabel: "Mantener: ",
    boldLabel: "Alerta máxima.",
    desc: "Inicia grabación, sirena y ubicación en tiempo real.",
    detailDesc: "Inicia grabación, sirena y ubicación en tiempo real.",
    color: BUTTON_COLORS.row3Color,
    colorLight: BUTTON_COLORS.row3Light,
    colorBorder: BUTTON_COLORS.row3Border,
  },
];

// ─── ViewModel ────────────────────────────────────────────────────────────────
export function useButtonTutorialViewModel() {
  // ── Estado ──────────────────────────────────────────────────────────────────
  const [activeRow, setActiveRow]   = useState<TapType>(null);
  const [tapCount, setTapCount]     = useState(0);
  const [feedback, setFeedback]     = useState("");

  // ── Animaciones de la pantalla principal ────────────────────────────────────
  const cardAnim        = useRef(new Animated.Value(0)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // Entrada de card con spring al montar
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      delay: 200,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Animación interpolada de la card (lista para usar en JSX) ───────────────
  const cardAnimStyle = {
    opacity: cardAnim,
    transform: [
      {
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
    ],
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  /** Muestra un mensaje de feedback con fade in/out */
  const showFeedback = (msg: string) => {
    setFeedback(msg);
    feedbackOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(feedbackOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(feedbackOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  /** Activa / desactiva una fila al tocarla */
  const handleTapRow = (id: TapType) => {
    setActiveRow((prev) => (id === prev ? null : id));
  };

  /** Cicla entre las 3 filas al presionar el botón SOS demo */
  const handleSOSTap = (msg: string) => {
    const next = tapCount + 1;
    const types: TapType[] = ["short", "double", "hold"];
    const type = types[(next - 1) % 3];
    setActiveRow(type);
    showFeedback(msg);
    setTapCount(next % 3 === 0 ? 0 : next);
  };

  return {
    // estado
    activeRow,
    feedback,
    // animaciones
    cardAnimStyle,
    feedbackOpacity,
    // datos
    tapOptions: TAP_OPTIONS,
    // handlers
    handleTapRow,
    handleSOSTap,
  };
}