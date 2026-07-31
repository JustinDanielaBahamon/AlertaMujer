import * as SMS from "expo-sms";
import { useCallback, useMemo, useRef, useState } from "react";
import { MSG_COLORS } from "../styles/messageStyle";
import { useLocale } from "../../../contexts/LocaleContext";

// ─── Tipos públicos ───────────────────────────────────────────────────────────
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

// ─── Datos (ahora dependen del idioma activo) ─────────────────────────────────
const getFeatureRows = (t: LocaleT): FeatureItem[] => [
  {
    id: "sms",
    emoji: "💬",
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
    id: "call",
    emoji: "📞",
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
    id: "confirm",
    emoji: "✅",
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

  const [modalVisible, setModalVisible]   = useState(false);
  const [permissionType, setPermissionType] = useState<"sms" | "llamada">("sms");
  const [showWarning, setShowWarning]     = useState(false);

  const resolvePermission = useRef<(value: boolean) => void>(() => {});

  // ── Handlers permisos (lógica original intacta) ──────────────────────────
  const requestPermissions = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolvePermission.current = resolve;
      setPermissionType("sms");
      setModalVisible(true);
      setShowWarning(false);
    });
  }, []);

  const confirmModal = useCallback(async () => {
    if (permissionType === "sms") {
      try { await SMS.isAvailableAsync(); } catch (e) { console.log("Error SMS:", e); }
      setPermissionType("llamada");
    } else {
      setModalVisible(false);
      resolvePermission.current(true);
    }
  }, [permissionType]);

  const cancelModal = useCallback(() => {
    setModalVisible(false);
    setShowWarning(true);
  }, []);

  const retryPermissions = useCallback(() => {
    setShowWarning(false);
    setPermissionType("sms");
    setModalVisible(true);
  }, []);

  const continueWithoutPermissions = useCallback(() => {
    setShowWarning(false);
    resolvePermission.current(true);
  }, []);

  return {
    featureRows,
    modalVisible,
    permissionType,
    showWarning,
    requestPermissions,
    confirmModal,
    cancelModal,
    retryPermissions,
    continueWithoutPermissions,
  };
}