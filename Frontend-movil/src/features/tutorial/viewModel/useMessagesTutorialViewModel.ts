import AsyncStorage from "@react-native-async-storage/async-storage";
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

// Se guarda cuando el usuario ya aceptó el aviso de mensajes, para no pedirlo otra vez
const STORAGE_KEY_MENSAJES = "@alerta_mujer:permiso_mensajes";

// ─── Datos (ahora dependen del idioma activo) ─────────────────────────────────
const getFeatureRows = (t: LocaleT): FeatureItem[] => [
  {
    id: "rcs",
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

  const [modalVisible, setModalVisible] = useState(false);
  const [showWarning, setShowWarning]   = useState(false);

  const resolvePermission = useRef<(value: boolean) => void>(() => {});

  // ── Handlers permisos ─────────────────────────────────────────────────────
  // Si el usuario ya aceptó el aviso antes, no se vuelve a mostrar
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const yaAceptado = await AsyncStorage.getItem(STORAGE_KEY_MENSAJES);
      if (yaAceptado === "true") return true;
    } catch (e) { console.log("Error leyendo permiso de mensajes:", e); }

    return new Promise((resolve) => {
      resolvePermission.current = resolve;
      setModalVisible(true);
      setShowWarning(false);
    });
  }, []);

  const confirmModal = useCallback(async () => {
    try { await SMS.isAvailableAsync(); } catch (e) { console.log("Error mensajes:", e); }
    try { await AsyncStorage.setItem(STORAGE_KEY_MENSAJES, "true"); } catch {}
    setModalVisible(false);
    resolvePermission.current(true);
  }, []);

  const cancelModal = useCallback(() => {
    setModalVisible(false);
    setShowWarning(true);
  }, []);

  const retryPermissions = useCallback(() => {
    setShowWarning(false);
    setModalVisible(true);
  }, []);

  const continueWithoutPermissions = useCallback(() => {
    setShowWarning(false);
    resolvePermission.current(true);
  }, []);

  return {
    featureRows,
    modalVisible,
    permissionType: "sms" as const,
    showWarning,
    requestPermissions,
    confirmModal,
    cancelModal,
    retryPermissions,
    continueWithoutPermissions,
  };
}