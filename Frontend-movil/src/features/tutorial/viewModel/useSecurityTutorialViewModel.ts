import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import { useCallback, useMemo, useRef, useState } from "react";
import { SECURITY_COLORS } from "../styles/securityStyle";
import { useLocale } from "../../../contexts/LocaleContext";

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

type LocaleT = ReturnType<typeof useLocale>["t"];

// ─── Datos (ahora dependen del idioma activo) ─────────────────────────────────
const getSecurityFeatureRows = (t: LocaleT): SecurityFeatureItem[] => [
  {
    id: "registro",
    emoji: "🎥",
    title: t.tutorial.seguridad_registro_titulo,
    badge: t.tutorial.seguridad_registro_badge,
    desc: t.tutorial.seguridad_registro_desc,
    highlightLabel: t.tutorial.seguridad_registro_highlight,
    boldLabel: t.tutorial.seguridad_registro_bold,
    detailDesc: t.tutorial.seguridad_registro_detail,
    color: SECURITY_COLORS.row1Color,
    colorLight: SECURITY_COLORS.row1Light,
    colorBorder: SECURITY_COLORS.row1Border,
  },
  {
    id: "respaldo",
    emoji: "⚖️",
    title: t.tutorial.seguridad_respaldo_titulo,
    badge: t.tutorial.seguridad_respaldo_badge,
    desc: t.tutorial.seguridad_respaldo_desc,
    highlightLabel: t.tutorial.seguridad_respaldo_highlight,
    boldLabel: t.tutorial.seguridad_respaldo_bold,
    detailDesc: t.tutorial.seguridad_respaldo_detail,
    color: SECURITY_COLORS.row2Color,
    colorLight: SECURITY_COLORS.row2Light,
    colorBorder: SECURITY_COLORS.row2Border,
  },
  {
    id: "privacidad",
    emoji: "🔒",
    title: t.tutorial.seguridad_privacidad_titulo,
    badge: t.tutorial.seguridad_privacidad_badge,
    desc: t.tutorial.seguridad_privacidad_desc,
    highlightLabel: t.tutorial.seguridad_privacidad_highlight,
    boldLabel: t.tutorial.seguridad_privacidad_bold,
    detailDesc: t.tutorial.seguridad_privacidad_detail,
    color: SECURITY_COLORS.row3Color,
    colorLight: SECURITY_COLORS.row3Light,
    colorBorder: SECURITY_COLORS.row3Border,
  },
];

export function useSecurityTutorialViewModel() {
  const { t } = useLocale();
  const featureRows = useMemo(() => getSecurityFeatureRows(t), [t]);

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