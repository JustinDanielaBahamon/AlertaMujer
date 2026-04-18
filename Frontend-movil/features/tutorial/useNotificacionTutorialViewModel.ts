import { useCallback, useRef, useState } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import { useVideoPlayer } from "expo-video";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../src/navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useNotificacionTutorialViewModel() {
  const navigation = useNavigation<Nav>();
  const [modalVisible, setModalVisible] = useState(false);
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);
  const resolverPermiso = useRef<(valor: boolean) => void>(() => {});

  const videoSource = require("../../assets/imagesAlertaMujer/ScTutorial/notificacion .mp4");
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.play();
    p.muted = true;
  });

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
    player,
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