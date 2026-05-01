import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import { useCallback, useRef, useState } from "react";
import { SECURITY_COLORS } from "./securityStyle";

export interface SecurityFeatureItem {
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

export const SECURITY_FEATURE_ROWS: SecurityFeatureItem[] = [
  {
    id: "registro",
    emoji: "🎥",
    title: "Registro clave",
    badge: "Evidencia",
    desc: "Captura automática de audio y video.",
    highlightLabel: "Registro: ",
    boldLabel: "Evidencia real.",
    detailDesc: "Se inicia captura automática de audio y video para documentar tu entorno en segundos.",
    color: SECURITY_COLORS.row1Color,
    colorLight: SECURITY_COLORS.row1Light,
    colorBorder: SECURITY_COLORS.row1Border,
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
    color: SECURITY_COLORS.row2Color,
    colorLight: SECURITY_COLORS.row2Light,
    colorBorder: SECURITY_COLORS.row2Border,
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
    color: SECURITY_COLORS.row3Color,
    colorLight: SECURITY_COLORS.row3Light,
    colorBorder: SECURITY_COLORS.row3Border,
  },
];

export function useSecurityTutorialViewModel() {
  const [modalVisible, setModalVisible]       = useState(false);
  const [permissionType, setPermissionType]   = useState<"camara" | "audio">("camara");
  const [showWarning, setShowWarning]         = useState(false);

  const resolvePermission = useRef<(value: boolean) => void>(() => {});
  const permissionTypeRef = useRef<"camara" | "audio">("camara");
  // 0=idle, 1=requesting, 2=user_cancelled
  const flowStateRef      = useRef<number>(0);

  const updatePermissionType = (type: "camara" | "audio") => {
    permissionTypeRef.current = type;
    setPermissionType(type);
  };

  const requestPermissions = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolvePermission.current = resolve;
      flowStateRef.current = 0;
      updatePermissionType("camara");
      setShowWarning(false);
      setModalVisible(true);
    });
  }, []);

  const confirmModal = useCallback(async () => {
    const currentStep = permissionTypeRef.current;
    flowStateRef.current = 1; // requesting

    try {
      if (currentStep === "camara") {
        const result   = await Camera.requestCameraPermissionsAsync();
        const cameraOk = result.granted || result.status === "granted";

        if (flowStateRef.current === 2) return;

        if (cameraOk) {
          // ← Cámara concedida → pide audio
          flowStateRef.current = 0;
          updatePermissionType("audio");
        } else {
          // ← Cámara denegada por el sistema → advertencia
          flowStateRef.current = 0;
          setModalVisible(false);
          setShowWarning(true);
        }

      } else {
        // ── Audio ──────────────────────────────────────────────────────────
        const result   = await Audio.requestPermissionsAsync();
        // audioOk queda disponible por si en el futuro lo necesitas
        const _audioOk = result.granted || result.status === "granted";

        if (flowStateRef.current === 2) return;

        // ← Confirmar audio siempre avanza al tutorial
        // La advertencia SOLO sale si el usuario presiona "Cancelar"
        flowStateRef.current = 0;
        setShowWarning(false);
        setModalVisible(false);
        resolvePermission.current(true);
      }

    } catch (e) {
      console.error("[Seguridad] Error en flujo de permisos:", e);
      flowStateRef.current = 0;
      setModalVisible(false);
      // ← Error técnico → avanza sin advertencia
      resolvePermission.current(true);
    }
  }, []);

  // ← Advertencia SOLO cuando el usuario cancela manualmente
  const cancelModal = useCallback(() => {
    if (flowStateRef.current === 1) {
      console.log("[Seguridad] Ignorando cancelación durante diálogo nativo");
      return;
    }
    flowStateRef.current = 2; // user_cancelled
    setModalVisible(false);
    setShowWarning(true); // ← aquí sí se muestra
  }, []);

  const retryPermissions = useCallback(() => {
    flowStateRef.current = 0;
    setShowWarning(false);
    updatePermissionType("camara");
    setModalVisible(true);
  }, []);

  const continueWithoutPermissions = useCallback(() => {
    flowStateRef.current = 0;
    setShowWarning(false);
    resolvePermission.current(true);
  }, []);

  return {
    featureRows: SECURITY_FEATURE_ROWS,
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