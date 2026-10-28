import { useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import { BUTTON_COLORS } from "../styles/buttonStyle";
import { useLocale } from "../../../contexts/LocaleContext";

// ─── Public types ─────────────────────────────────────────────────────────────
export type TapType = "contacto" | "acelerometro" | "pantalla" | null;

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

// ─── Activation methods data (depends on the active language) ─────────────────
const getTapOptions = (t: LocaleT): TapOption[] => [
  {
    id: "contacto",
    emoji: "👤",
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
    id: "acelerometro",
    emoji: "📳",
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
    id: "pantalla",
    emoji: "🔘",
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

  // ── State ───────────────────────────────────────────────────────────────────
  const [activeRow, setActiveRow]   = useState<TapType>(null);
  const [tapCount, setTapCount]     = useState(0);
  const [feedback, setFeedback]     = useState("");

  // ── Main screen animations ──────────────────────────────────────────────────
  const cardAnim        = useRef(new Animated.Value(0)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // Card spring entrance on mount
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      delay: 200,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Interpolated card animation (ready to use in JSX) ───────────────────────
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

  /** Shows a feedback message with fade in/out */
  const showFeedback = (msg: string) => {
    setFeedback(msg);
    feedbackOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(feedbackOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(feedbackOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  /** Toggles a row when it is tapped */
  const handleTapRow = (id: TapType) => {
    setActiveRow((prev) => (id === prev ? null : id));
  };

  /** Cycles through the 3 methods when the demo SOS button is pressed */
  const handleSOSTap = (msg: string) => {
    const next = tapCount + 1;
    const types: TapType[] = ["contacto", "acelerometro", "pantalla"];
    const type = types[(next - 1) % 3];
    setActiveRow(type);
    showFeedback(msg);
    setTapCount(next % 3 === 0 ? 0 : next);
  };

  return {
    // state
    activeRow,
    feedback,
    // animaciones
    cardAnimStyle,
    feedbackOpacity,
    // data
    tapOptions,
    // handlers
    handleTapRow,
    handleSOSTap,
  };
}