import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import type { MainStackParamList } from "../../../navigation/types";
import { NOTIF_COLORS } from "../styles/notificationStyle";

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

// ─── Static data ──────────────────────────────────────────────────────────────
export const NOTIF_FEATURE_ROWS: NotifFeatureItem[] = [
  {
    id: "sos",
    emoji: "🚨",
    title: "Alertas SOS",
    badge: "Tiempo real",
    desc: "Avisos críticos aunque la app esté cerrada.",
    highlightLabel: "Alertas SOS: ",
    boldLabel: "Tiempo real.",
    detailDesc: "Recibirás avisos críticos incluso si la aplicación no está abierta en tu dispositivo.",
    color: NOTIF_COLORS.row1Color,
    colorLight: NOTIF_COLORS.row1Light,
    colorBorder: NOTIF_COLORS.row1Border,
  },
  {
    id: "red",
    emoji: "🤝",
    title: "Red de apoyo",
    badge: "Siempre activa",
    desc: "Conectada para ayudar y ser ayudada.",
    highlightLabel: "Red de Apoyo: ",
    boldLabel: "Seguridad activa.",
    detailDesc: "Mantente siempre conectada para ayudar o ser ayudada por tu red de confianza sin demora.",
    color: NOTIF_COLORS.row2Color,
    colorLight: NOTIF_COLORS.row2Light,
    colorBorder: NOTIF_COLORS.row2Border,
  },
  {
    id: "rapidez",
    emoji: "⚡",
    title: "Rapidez",
    badge: "Inmediata",
    desc: "La notificación más poderosa para tu protección.",
    highlightLabel: "Rapidez: ",
    boldLabel: "Comunicación.",
    detailDesc: "La notificación inmediata es la herramienta más poderosa para garantizar tu protección.",
    color: NOTIF_COLORS.row3Color,
    colorLight: NOTIF_COLORS.row3Light,
    colorBorder: NOTIF_COLORS.row3Border,
  },
];

export function useNotificationTutorialViewModel() {

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
    featureRows: NOTIF_FEATURE_ROWS,
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