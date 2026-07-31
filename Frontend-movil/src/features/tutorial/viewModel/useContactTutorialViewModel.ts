import * as Contacts from "expo-contacts";
import { useCallback, useMemo, useRef, useState } from "react";
import { CONTACT_COLORS } from "../styles/contactStyle";
import { useLocale } from "../../../contexts/LocaleContext";

// ─── Tipos públicos ───────────────────────────────────────────────────────────
export interface ContactFeatureItem {
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
const getContactFeatureRows = (t: LocaleT): ContactFeatureItem[] => [
  {
    id: "confianza",
    emoji: "🤝",
    title: t.tutorial.contacto_confianza_titulo,
    badge: t.tutorial.contacto_confianza_badge,
    desc: t.tutorial.contacto_confianza_desc,
    highlightLabel: t.tutorial.contacto_confianza_highlight,
    boldLabel: t.tutorial.contacto_confianza_bold,
    detailDesc: t.tutorial.contacto_confianza_detail,
    color: CONTACT_COLORS.row1Color,
    colorLight: CONTACT_COLORS.row1Light,
    colorBorder: CONTACT_COLORS.row1Border,
  },
  {
    id: "notificaciones",
    emoji: "🔔",
    title: t.tutorial.contacto_notificaciones_titulo,
    badge: t.tutorial.contacto_notificaciones_badge,
    desc: t.tutorial.contacto_notificaciones_desc,
    highlightLabel: t.tutorial.contacto_notificaciones_highlight,
    boldLabel: t.tutorial.contacto_notificaciones_bold,
    detailDesc: t.tutorial.contacto_notificaciones_detail,
    color: CONTACT_COLORS.row2Color,
    colorLight: CONTACT_COLORS.row2Light,
    colorBorder: CONTACT_COLORS.row2Border,
  },
  {
    id: "gestion",
    emoji: "⚙️",
    title: t.tutorial.contacto_gestion_titulo,
    badge: t.tutorial.contacto_gestion_badge,
    desc: t.tutorial.contacto_gestion_desc,
    highlightLabel: t.tutorial.contacto_gestion_highlight,
    boldLabel: t.tutorial.contacto_gestion_bold,
    detailDesc: t.tutorial.contacto_gestion_detail,
    color: CONTACT_COLORS.row3Color,
    colorLight: CONTACT_COLORS.row3Light,
    colorBorder: CONTACT_COLORS.row3Border,
  },
];

// ─── ViewModel — lógica original 100% intacta ─────────────────────────────────
export function useContactTutorialViewModel() {
  const { t } = useLocale();
  const featureRows = useMemo(() => getContactFeatureRows(t), [t]);

  const [showWarning, setShowWarning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const permissionResolver = useRef<(value: boolean) => void>(() => {});

  // ── Permisos (lógica original sin cambios) ───────────────────────────────
  const requestPermissions = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      permissionResolver.current = resolve;
      setModalVisible(true);
    });
  }, []);

  const confirmModal = useCallback(async () => {
    setModalVisible(false);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      permissionResolver.current(true);
    } else {
      setShowWarning(true);
    }
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
    permissionResolver.current(true);
  }, []);

  return {
    featureRows,
    modalVisible,
    showWarning,
    requestPermissions,
    confirmModal,
    cancelModal,
    retryPermissions,
    continueWithoutPermissions,
  };
}