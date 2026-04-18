import { useCallback, useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
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

  // Abre el modal automáticamente al llegar a esta pantalla
  useEffect(() => {
    const timer = setTimeout(() => {
      setModalVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // El pager también puede llamar esto al deslizar
  const pedirPermisos = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverPermiso.current = resolve;
      setModalVisible(true);
      setMostrarAdvertencia(false);
    });
  }, []);

  // Función simple para el botón "Finalizar y Activar"
  const abrirModal = useCallback(() => {
    setMostrarAdvertencia(false);
    setModalVisible(true);
  }, []);

  const confirmarModal = useCallback(async () => {
    setModalVisible(false);
    await Notifications.requestPermissionsAsync();
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
    abrirModal,       // 🆕 para el botón
    confirmarModal,
    cancelarModal,
    reintentarPermisos,
    continuarSinPermisos,
  };
}