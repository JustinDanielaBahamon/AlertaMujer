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

// ─── Data (now depends on the active language) ───────────────────────────────
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

  // Checks which permissions are missing to start from the right step.
  // Returns null if it already has camera and microphone (nothing is asked).
  const pendingStep = async (): Promise<"camara" | "audio" | null> => {
    try {
      const cam = await Camera.getCameraPermissionsAsync();
      const mic = await Audio.getPermissionsAsync();
      const camOk = cam.granted || cam.status === "granted";
      const micOk = mic.granted || mic.status === "granted";
      if (camOk && micOk) return null;
      return camOk ? "audio" : "camara";
    } catch (e) {
      return "camara";
    }
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const step = await pendingStep();
    if (step === null) return true;

    return new Promise((resolve) => {
      resolvePermission.current = resolve;
      flowStateRef.current = 0;
      updatePermissionType(step);
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
          flowStateRef.current = 0;
          const mic = await Audio.getPermissionsAsync();
          if (mic.granted || mic.status === "granted") {
            // ← Camera granted and microphone already granted → not asked again
            setShowWarning(false);
            setModalVisible(false);
            resolvePermission.current(true);
          } else {
            // ← Camera granted → ask for audio
            updatePermissionType("audio");
          }
        } else {
          // ← Camera denied by the system → warning
          flowStateRef.current = 0;
          setModalVisible(false);
          setShowWarning(true);
        }

      } else {
        // ── Audio ──────────────────────────────────────────────────────────
        const result   = await Audio.requestPermissionsAsync();
        // audioOk stays available in case it is needed in the future
        const _audioOk = result.granted || result.status === "granted";

        if (flowStateRef.current === 2) return;

        // ← Confirming audio always continues the tutorial
        // The warning ONLY shows if the user presses "Cancel"
        flowStateRef.current = 0;
        setShowWarning(false);
        setModalVisible(false);
        resolvePermission.current(true);
      }

    } catch (e) {
      console.error("[Seguridad] Error en flujo de permisos:", e);
      flowStateRef.current = 0;
      setModalVisible(false);
      // ← Technical error → advance without a warning
      resolvePermission.current(true);
    }
  }, []);

  // ← Warning ONLY when the user cancels manually
  const cancelModal = useCallback(() => {
    if (flowStateRef.current === 1) {
      return;
    }
    flowStateRef.current = 2; // user_cancelled
    setModalVisible(false);
    setShowWarning(true); // ← here it is shown
  }, []);

  const retryPermissions = useCallback(async () => {
    flowStateRef.current = 0;
    setShowWarning(false);
    const step = await pendingStep();
    updatePermissionType(step ?? "camara");
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