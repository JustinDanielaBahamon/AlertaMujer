import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import type { MainStackParamList } from "../../../navigation/types";
import { NOTIF_COLORS } from "../styles/notificationStyle";
import { useLocale } from "../../../contexts/LocaleContext";

type Nav = NativeStackNavigationProp<MainStackParamList>;

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

  const navigation = useNavigation<Nav>();
  const [modalVisible, setModalVisible]   = useState(false);
  const [showWarning, setShowWarning]     = useState(false);

  const resolvePermission = useRef<(value: boolean) => void>(() => {});

  const requestPermissions = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolvePermission.current = resolve;
      setModalVisible(true);
      setShowWarning(false);
    });
  }, []);

  const openModal = useCallback(() => {
    setShowWarning(false);
    setModalVisible(true);
  }, []);

  const confirmModal = useCallback(async () => {
    setModalVisible(false);

    // ✅ Request native permissions without using expo-notifications
    if (Platform.OS === "android" && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    }
    // On iOS, notification permissions are handled when registering the device
    // No extra call needed here

    navigation.replace("DrawerHome");
  }, [navigation]);

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
    navigation.replace("DrawerHome");
  }, [navigation]);

  return {
    featureRows,
    modalVisible,
    showWarning,
    requestPermissions,
    openModal,
    confirmModal,
    cancelModal,
    retryPermissions,
    continueWithoutPermissions,
  };
}