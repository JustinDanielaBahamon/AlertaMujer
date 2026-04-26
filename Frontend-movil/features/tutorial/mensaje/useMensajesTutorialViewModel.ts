import * as SMS from "expo-sms";
import { useVideoPlayer } from "expo-video";
import { useCallback, useRef, useState } from "react";
import { MSG_COLORS } from "./mensajeStyle";

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
export function useMensajesTutorialViewModel() {
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoPermiso, setTipoPermiso] = useState<"sms" | "llamada">("sms");
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);

  const resolverPermiso = useRef<(valor: boolean) => void>(() => {});



  // ── Handlers permisos (lógica original intacta) ──────────────────────────
  const pedirPermisos = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverPermiso.current = resolve;
      setTipoPermiso("sms");
      setModalVisible(true);
      setMostrarAdvertencia(false);
    });
  }, []);

  const confirmarModal = useCallback(async () => {
    if (tipoPermiso === "sms") {
      try { await SMS.isAvailableAsync(); } catch (e) { console.log("Error SMS:", e); }
      setTipoPermiso("llamada");
    } else {
      setModalVisible(false);
      resolverPermiso.current(true);
    }
  }, [tipoPermiso]);

  const cancelarModal = useCallback(() => {
    setModalVisible(false);
    setMostrarAdvertencia(true);
  }, []);

  const reintentarPermisos = useCallback(() => {
    setMostrarAdvertencia(false);
    setTipoPermiso("sms");
    setModalVisible(true);
  }, []);

  const continuarSinPermisos = useCallback(() => {
    setMostrarAdvertencia(false);
    resolverPermiso.current(true);
  }, []);

  return {
    
    featureRows: FEATURE_ROWS,
    modalVisible,
    tipoPermiso,
    mostrarAdvertencia,
    pedirPermisos,
    confirmarModal,
    cancelarModal,
    reintentarPermisos,
    continuarSinPermisos,
  };
}