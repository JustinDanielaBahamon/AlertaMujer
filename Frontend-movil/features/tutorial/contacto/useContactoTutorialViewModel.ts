import { useCallback, useRef, useState } from "react";
import * as Contacts from "expo-contacts";
import { CONTACTO_COLORS } from "./contactoStyle";

// ─── Tipos públicos ───────────────────────────────────────────────────────────
export interface ContactoFeatureItem {
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
export const CONTACTO_FEATURE_ROWS: ContactoFeatureItem[] = [
  {
    id: "confianza",
    emoji: "🤝",
    title: "Red de confianza",
    badge: "Familia",
    desc: "Familiares y amigos cercanos que te cuidan.",
    highlightLabel: "Confianza: ",
    boldLabel: "Red segura.",
    detailDesc: "Agrega a tus familiares y amigos cercanos para que te cuiden en cualquier momento.",
    color: CONTACTO_COLORS.row1Color,
    colorLight: CONTACTO_COLORS.row1Light,
    colorBorder: CONTACTO_COLORS.row1Border,
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
    color: CONTACTO_COLORS.row2Color,
    colorLight: CONTACTO_COLORS.row2Light,
    colorBorder: CONTACTO_COLORS.row2Border,
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
    color: CONTACTO_COLORS.row3Color,
    colorLight: CONTACTO_COLORS.row3Light,
    colorBorder: CONTACTO_COLORS.row3Border,
  },
];

// ─── ViewModel — lógica original 100% intacta ─────────────────────────────────
export function useContactoTutorialViewModel() {
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);
  const [modalVisible, setModalVisible]             = useState(false);

  const resolverPermiso = useRef<(valor: boolean) => void>(() => {});

  // ── Permisos (lógica original sin cambios) ───────────────────────────────
  const pedirPermisos = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverPermiso.current = resolve;
      setModalVisible(true);
    });
  }, []);

  const confirmarModal = useCallback(async () => {
    setModalVisible(false);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      resolverPermiso.current(true);
    } else {
      setMostrarAdvertencia(true);
    }
  }, []);

  const cancelarModal = useCallback(() => {
    setModalVisible(false);
    setMostrarAdvertencia(true);
  }, []);

  const reintentarPermisos = useCallback(() => {
    setMostrarAdvertencia(false);
    setModalVisible(true);
  }, []);

  const continuarSinPermisos = useCallback(() => {
    setMostrarAdvertencia(false);
    resolverPermiso.current(true);
  }, []);

  return {
    // datos
    featureRows: CONTACTO_FEATURE_ROWS,
    // permisos
    modalVisible,
    mostrarAdvertencia,
    pedirPermisos,
    confirmarModal,
    cancelarModal,
    reintentarPermisos,
    continuarSinPermisos,
  };
}