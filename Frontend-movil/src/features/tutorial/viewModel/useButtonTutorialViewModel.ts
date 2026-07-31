import { useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import { BUTTON_COLORS } from "../styles/buttonStyle";
import { useLocale } from "../../../contexts/LocaleContext";

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

type LocaleT = ReturnType<typeof useLocale>["t"];

// ─── Datos de gestos (ahora dependen del idioma activo) ───────────────────────
const getTapOptions = (t: LocaleT): TapOption[] => [
  {
    id: "short",
    emoji: "👆",
    title: t.tutorial.boton_toque_corto_titulo,
    badge: t.tutorial.boton_toque_corto_badge,
    highlightLabel: t.tutorial.boton_toque_corto_highlight,
    boldLabel: t.tutorial.boton_toque_corto_bold,
    desc: t.tutorial.boton_toque_corto_desc,
    detailDesc: t.tutorial.boton_toque_corto_detail,
    color: BUTTON_COLORS.row1Color,
    colorLight: BUTTON_COLORS.row1Light,
    colorBorder: BUTTON_COLORS.row1Border,
  },
  {
    id: "double",
    emoji: "✌️",
    title: t.tutorial.boton_doble_titulo,
    badge: t.tutorial.boton_doble_badge,
    highlightLabel: t.tutorial.boton_doble_highlight,
    boldLabel: t.tutorial.boton_doble_bold,
    desc: t.tutorial.boton_doble_desc,
    detailDesc: t.tutorial.boton_doble_detail,
    color: BUTTON_COLORS.row2Color,
    colorLight: BUTTON_COLORS.row2Light,
    colorBorder: BUTTON_COLORS.row2Border,
  },
  {
    id: "hold",
    emoji: "✊",
    title: t.tutorial.boton_mantener_titulo,
    badge: t.tutorial.boton_mantener_badge,
    highlightLabel: t.tutorial.boton_mantener_highlight,
    boldLabel: t.tutorial.boton_mantener_bold,
    desc: t.tutorial.boton_mantener_desc,
    detailDesc: t.tutorial.boton_mantener_detail,
    color: BUTTON_COLORS.row3Color,
    colorLight: BUTTON_COLORS.row3Light,
    colorBorder: BUTTON_COLORS.row3Border,
  },
];

// ─── ViewModel ────────────────────────────────────────────────────────────────
export function useButtonTutorialViewModel() {
  const { t } = useLocale();
  const tapOptions = useMemo(() => getTapOptions(t), [t]);

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
    tapOptions,
    // handlers
    handleTapRow,
    handleSOSTap,
  };
}