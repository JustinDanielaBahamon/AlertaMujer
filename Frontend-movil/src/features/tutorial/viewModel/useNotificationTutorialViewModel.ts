import { useCallback, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { registrarPush } from "../../../services/push.service";
import { NOTIF_COLORS } from "../styles/notificationStyle";
import { useLocale } from "../../../contexts/LocaleContext";

export interface NotifFeatureItem {
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
const getNotifFeatureRows = (t: LocaleT): NotifFeatureItem[] => [
  {
    id: "sos",
    emoji: "🚨",
    title: t.tutorial.notificacion_sos_titulo,
    badge: t.tutorial.notificacion_sos_badge,
    desc: t.tutorial.notificacion_sos_desc,
    highlightLabel: t.tutorial.notificacion_sos_highlight,
    boldLabel: t.tutorial.notificacion_sos_bold,
    detailDesc: t.tutorial.notificacion_sos_detail,
    color: NOTIF_COLORS.row1Color,
    colorLight: NOTIF_COLORS.row1Light,
    colorBorder: NOTIF_COLORS.row1Border,
  },
  {
    id: "red",
    emoji: "🤝",
    title: t.tutorial.notificacion_red_titulo,
    badge: t.tutorial.notificacion_red_badge,
    desc: t.tutorial.notificacion_red_desc,
    highlightLabel: t.tutorial.notificacion_red_highlight,
    boldLabel: t.tutorial.notificacion_red_bold,
    detailDesc: t.tutorial.notificacion_red_detail,
    color: NOTIF_COLORS.row2Color,
    colorLight: NOTIF_COLORS.row2Light,
    colorBorder: NOTIF_COLORS.row2Border,
  },
  {
    id: "rapidez",
    emoji: "⚡",
    title: t.tutorial.notificacion_rapidez_titulo,
    badge: t.tutorial.notificacion_rapidez_badge,
    desc: t.tutorial.notificacion_rapidez_desc,
    highlightLabel: t.tutorial.notificacion_rapidez_highlight,
    boldLabel: t.tutorial.notificacion_rapidez_bold,
    detailDesc: t.tutorial.notificacion_rapidez_detail,
    color: NOTIF_COLORS.row3Color,
    colorLight: NOTIF_COLORS.row3Light,
    colorBorder: NOTIF_COLORS.row3Border,
  },
];

export function useNotificationTutorialViewModel() {
  const { t } = useLocale();
  const featureRows = useMemo(() => getNotifFeatureRows(t), [t]);

  const [modalVisible, setModalVisible]   = useState(false);
  const [showWarning, setShowWarning]     = useState(false);

  const resolvePermission = useRef<(value: boolean) => void>(() => {});

  // Android 12 o menor no pide permiso de notificaciones; en Android 13+ se revisa si ya está concedido
  const alreadyHasPermission = async (): Promise<boolean> => {
    if (Platform.OS !== "android") return false;
    if (Platform.Version < 33) return true;
    try {
      return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    } catch {
      return false;
    }
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (await alreadyHasPermission()) return true;

    return new Promise((resolve) => {
      resolvePermission.current = resolve;
      setModalVisible(true);
      setShowWarning(false);
    });
  }, []);

  // Al aceptar se pide el permiso del sistema y se registra el celular para recibir alarmas.
  // Con o sin permiso el tutorial sigue a la página de protección.
  const confirmModal = useCallback(async () => {
    setModalVisible(false);
    if (Platform.OS === "android" && Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS).catch(() => null);
    }
    if (await alreadyHasPermission()) registrarPush().catch(() => {});
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
    showWarning,
    requestPermissions,
    confirmModal,
    cancelModal,
    retryPermissions,
    continueWithoutPermissions,
  };
}