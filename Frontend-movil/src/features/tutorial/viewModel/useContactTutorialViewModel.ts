import * as Contacts from "expo-contacts";
import { useCallback, useRef, useState } from "react";
import { CONTACT_COLORS } from "../styles/contactStyle";

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

// ─── Datos estáticos ──────────────────────────────────────────────────────────
export const CONTACT_FEATURE_ROWS: ContactFeatureItem[] = [
  {
    id: "confianza",
    emoji: "🤝",
    title: "Red de confianza",
    badge: "Familia",
    desc: "Familiares y amigos cercanos que te cuidan.",
    highlightLabel: "Confianza: ",
    boldLabel: "Red segura.",
    detailDesc: "Agrega a tus familiares y amigos cercanos para que te cuiden en cualquier momento.",
    color: CONTACT_COLORS.row1Color,
    colorLight: CONTACT_COLORS.row1Light,
    colorBorder: CONTACT_COLORS.row1Border,
  },
  {
    id: "notificaciones",
    emoji: "🔔",
    title: "Aviso inmediato",
    badge: "Urgente",
    desc: "Reciben tu ubicación exacta al activar alerta.",
    highlightLabel: "Notificaciones: ",
    boldLabel: "Aviso inmediato.",
    detailDesc: "Ellos recibirán tu ubicación exacta cuando actives una alerta de emergencia.",
    color: CONTACT_COLORS.row2Color,
    colorLight: CONTACT_COLORS.row2Light,
    colorBorder: CONTACT_COLORS.row2Border,
  },
  {
    id: "gestion",
    emoji: "⚙️",
    title: "Gestión flexible",
    badge: "Siempre",
    desc: "Administra tus contactos cuando quieras.",
    highlightLabel: "Gestión: ",
    boldLabel: "Siempre conectada.",
    detailDesc: "Puedes gestionar tus contactos en cualquier momento desde tu perfil.",
    color: CONTACT_COLORS.row3Color,
    colorLight: CONTACT_COLORS.row3Light,
    colorBorder: CONTACT_COLORS.row3Border,
  },
];

// ─── ViewModel — lógica original 100% intacta ─────────────────────────────────
export function useContactTutorialViewModel() {
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
    featureRows: CONTACT_FEATURE_ROWS,
    modalVisible,
    showWarning,
    requestPermissions,
    confirmModal,
    cancelModal,
    retryPermissions,
    continueWithoutPermissions,
  };
}