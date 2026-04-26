import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import { useCallback, useRef, useState } from "react";
import { SEGURIDAD_COLORS } from "./seguridadStyle";

export interface SeguridadFeatureItem {
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

export const SEGURIDAD_FEATURE_ROWS: SeguridadFeatureItem[] = [
  {
    id: "registro",
    emoji: "🎥",
    title: "Registro clave",
    badge: "Evidencia",
    desc: "Captura automática de audio y video.",
    highlightLabel: "Registro: ",
    boldLabel: "Evidencia real.",
    detailDesc: "Se inicia captura automática de audio y video para documentar tu entorno en segundos.",
    color: SEGURIDAD_COLORS.row1Color,
    colorLight: SEGURIDAD_COLORS.row1Light,
    colorBorder: SEGURIDAD_COLORS.row1Border,
  },
  {
    id: "respaldo",
    emoji: "⚖️",
    title: "Respaldo total",
    badge: "Legal",
    desc: "Tu voz y entorno quedan documentados.",
    highlightLabel: "Respaldo: ",
    boldLabel: "Herramienta legal.",
    detailDesc: "Tu voz y entorno son protegidos para dejar constancia oficial de los hechos.",
    color: SEGURIDAD_COLORS.row2Color,
    colorLight: SEGURIDAD_COLORS.row2Light,
    colorBorder: SEGURIDAD_COLORS.row2Border,
  },
  {
    id: "privacidad",
    emoji: "🔒",
    title: "Privacidad total",
    badge: "Encriptado",
    desc: "Estándares de seguridad más altos.",
    highlightLabel: "Privacidad: ",
    boldLabel: "Encriptado.",
    detailDesc: "Tus grabaciones se manejan bajo los más altos estándares de seguridad y privacidad.",
    color: SEGURIDAD_COLORS.row3Color,
    colorLight: SEGURIDAD_COLORS.row3Light,
    colorBorder: SEGURIDAD_COLORS.row3Border,
  },
];

export function useSeguridadTutorialViewModel() {
  const [modalVisible, setModalVisible]             = useState(false);
  const [tipoPermiso, setTipoPermiso]               = useState<"camara" | "audio">("camara");
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);

  const resolverPermiso  = useRef<(valor: boolean) => void>(() => {});
  const tipoPermisoRef   = useRef<"camara" | "audio">("camara");
  // Usamos un número simple: 0=idle, 1=requesting, 2=user_cancelled
  // Evita cualquier problema de inferencia de tipos con strings literales
  const flowStateRef = useRef<number>(0);

  const actualizarTipo = (tipo: "camara" | "audio") => {
    tipoPermisoRef.current = tipo;
    setTipoPermiso(tipo);
  };

  const pedirPermisos = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverPermiso.current = resolve;
      flowStateRef.current = 0; // idle
      actualizarTipo("camara");
      setMostrarAdvertencia(false);
      setModalVisible(true);
    });
  }, []);

  const confirmarModal = useCallback(async () => {
    const pasoActual = tipoPermisoRef.current;
    flowStateRef.current = 1; // requesting

    try {
      if (pasoActual === "camara") {
        const resultado = await Camera.requestCameraPermissionsAsync();
        const camaraOk  = resultado.granted || resultado.status === "granted";

        // 2 = user_cancelled
        if (flowStateRef.current === 2) return;

        if (camaraOk) {
          flowStateRef.current = 0; // idle, listo para siguiente diálogo
          actualizarTipo("audio");
        } else {
          flowStateRef.current = 0;
          setModalVisible(false);
          setMostrarAdvertencia(true);
        }

      } else {
        const resultado = await Audio.requestPermissionsAsync();
        const audioOk   = resultado.granted || resultado.status === "granted";

        // 2 = user_cancelled
        if (flowStateRef.current === 2) return;

        if (audioOk) {
          // ✅ Éxito total — nunca mostrar advertencia
          flowStateRef.current = 0;
          setMostrarAdvertencia(false);
          setModalVisible(false);
          resolverPermiso.current(true);
        } else {
          flowStateRef.current = 0;
          setModalVisible(false);
          setMostrarAdvertencia(true);
        }
      }
    } catch (e) {
      console.error("[Seguridad] Error en flujo de permisos:", e);
      flowStateRef.current = 0;
      setModalVisible(false);
      setMostrarAdvertencia(true);
    }
  }, []);

  const cancelarModal = useCallback(() => {
    // Si el sistema nativo está procesando (1=requesting), ignorar cierre automático
    if (flowStateRef.current === 1) {
      console.log("[Seguridad] Ignorando cancelación durante diálogo nativo");
      return;
    }
    flowStateRef.current = 2; // user_cancelled
    setModalVisible(false);
    setMostrarAdvertencia(true);
  }, []);

  const reintentarPermisos = useCallback(() => {
    flowStateRef.current = 0;
    setMostrarAdvertencia(false);
    actualizarTipo("camara");
    setModalVisible(true);
  }, []);

  const continuarSinPermisos = useCallback(() => {
    flowStateRef.current = 0;
    setMostrarAdvertencia(false);
    resolverPermiso.current(true);
  }, []);

  return {
    featureRows: SEGURIDAD_FEATURE_ROWS,
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