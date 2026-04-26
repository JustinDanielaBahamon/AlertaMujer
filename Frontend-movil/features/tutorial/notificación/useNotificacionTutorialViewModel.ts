import { useCallback, useRef, useState } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../src/navigation/types";
import { NOTIF_COLORS } from "./notificacionStyle";

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

// ─── Datos estáticos ──────────────────────────────────────────────────────────
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

export function useNotificacionTutorialViewModel() {

  const navigation = useNavigation<Nav>();
  const [modalVisible, setModalVisible]             = useState(false);
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);

  const resolverPermiso = useRef<(valor: boolean) => void>(() => {});

  const pedirPermisos = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverPermiso.current = resolve;
      setModalVisible(true);
      setMostrarAdvertencia(false);
    });
  }, []);

  const abrirModal = useCallback(() => {
    setMostrarAdvertencia(false);
    setModalVisible(true);
  }, []);

  const confirmarModal = useCallback(async () => {
    setModalVisible(false);

    // ✅ Pide permisos nativos sin usar expo-notifications
    if (Platform.OS === "android" && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    }
    // En iOS los permisos de notificación se manejan al registrar el dispositivo
    // No se necesita llamada extra aquí

    navigation.replace("DrawerHome");
  }, [navigation]);

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
    navigation.replace("DrawerHome");
  }, [navigation]);

  return {
    featureRows: NOTIF_FEATURE_ROWS,
    modalVisible,
    mostrarAdvertencia,
    pedirPermisos,
    abrirModal,
    confirmarModal,
    cancelarModal,
    reintentarPermisos,
    continuarSinPermisos,
  };
}