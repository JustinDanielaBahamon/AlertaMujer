import * as SMS from "expo-sms";
import { useCallback, useRef, useState } from "react";
import { MSG_COLORS } from "./messageStyle";

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

// ─── Datos estáticos ──────────────────────────────────────────────────────────
export const FEATURE_ROWS: FeatureItem[] = [
  {
    id: "sms",
    emoji: "💬",
    title: "SMS Automático",
    badge: "Instantáneo",
    desc: "Mensaje de texto con tu ubicación exacta.",
    highlightLabel: "SMS Automático: ",
    boldLabel: "Aviso rápido.",
    detailDesc: "Se envía un mensaje de texto con tu ubicación exacta a tus contactos de confianza.",
    color: MSG_COLORS.row1Color,
    colorLight: MSG_COLORS.row1Light,
    colorBorder: MSG_COLORS.row1Border,
  },
  {
    id: "call",
    emoji: "📞",
    title: "Llamada SOS",
    badge: "Urgente",
    desc: "Llamada de emergencia automática.",
    highlightLabel: "Llamada SOS: ",
    boldLabel: "Auxilio directo.",
    detailDesc: "El sistema inicia una llamada de emergencia a tus personas de confianza.",
    color: MSG_COLORS.row2Color,
    colorLight: MSG_COLORS.row2Light,
    colorBorder: MSG_COLORS.row2Border,
  },
  {
    id: "confirm",
    emoji: "✅",
    title: "Confirmación",
    badge: "Seguridad",
    desc: "Notificación cuando la ayuda está en camino.",
    highlightLabel: "Confirmación: ",
    boldLabel: "Seguridad total.",
    detailDesc: "Recibirás una notificación cuando la ayuda esté en camino hacia ti.",
    color: MSG_COLORS.row3Color,
    colorLight: MSG_COLORS.row3Light,
    colorBorder: MSG_COLORS.row3Border,
  },
];

// ─── ViewModel ────────────────────────────────────────────────────────────────
export function useMessagesTutorialViewModel() {
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
    featureRows: FEATURE_ROWS,
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