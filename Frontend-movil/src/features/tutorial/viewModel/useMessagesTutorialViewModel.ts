import { useMemo } from "react";
import { MSG_COLORS } from "../styles/messageStyle";
import { useLocale } from "../../../contexts/LocaleContext";

// ─── Public types ─────────────────────────────────────────────────────────────
export interface FeatureItem {
  id: string;
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

// ─── Data (depends on the active language) ───────────────────────────────────
// How contacts are notified: the server does it, no phone permission is needed
const getFeatureRows = (t: LocaleT): FeatureItem[] => [
  {
    id: "correo",
    emoji: "📧",
    title: t.tutorial.mensaje_sms_titulo,
    badge: t.tutorial.mensaje_sms_badge,
    desc: t.tutorial.mensaje_sms_desc,
    highlightLabel: t.tutorial.mensaje_sms_highlight,
    boldLabel: t.tutorial.mensaje_sms_bold,
    detailDesc: t.tutorial.mensaje_sms_detail,
    color: MSG_COLORS.row1Color,
    colorLight: MSG_COLORS.row1Light,
    colorBorder: MSG_COLORS.row1Border,
  },
  {
    id: "tiempoReal",
    emoji: "📍",
    title: t.tutorial.mensaje_llamada_titulo,
    badge: t.tutorial.mensaje_llamada_badge,
    desc: t.tutorial.mensaje_llamada_desc,
    highlightLabel: t.tutorial.mensaje_llamada_highlight,
    boldLabel: t.tutorial.mensaje_llamada_bold,
    detailDesc: t.tutorial.mensaje_llamada_detail,
    color: MSG_COLORS.row2Color,
    colorLight: MSG_COLORS.row2Light,
    colorBorder: MSG_COLORS.row2Border,
  },
  {
    id: "notificacion",
    emoji: "🔔",
    title: t.tutorial.mensaje_confirmacion_titulo,
    badge: t.tutorial.mensaje_confirmacion_badge,
    desc: t.tutorial.mensaje_confirmacion_desc,
    highlightLabel: t.tutorial.mensaje_confirmacion_highlight,
    boldLabel: t.tutorial.mensaje_confirmacion_bold,
    detailDesc: t.tutorial.mensaje_confirmacion_detail,
    color: MSG_COLORS.row3Color,
    colorLight: MSG_COLORS.row3Light,
    colorBorder: MSG_COLORS.row3Border,
  },
];

// ─── ViewModel ────────────────────────────────────────────────────────────────
export function useMessagesTutorialViewModel() {
  const { t } = useLocale();
  const featureRows = useMemo(() => getFeatureRows(t), [t]);
  return { featureRows };
}
