import { useCallback, useRef, useState } from "react";
import * as SMS from "expo-sms";
import { useVideoPlayer } from "expo-video";

export function useMensajesTutorialViewModel() {
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoPermiso, setTipoPermiso] = useState<"sms" | "llamada">("sms");
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);

  // promesa que resuelve cuando el usuario termina con los permisos
  const resolverPermiso = useRef<(valor: boolean) => void>(() => {});

  const videoSource = require("../../assets/imagesAlertaMujer/ScTutorial/mensaje.mp4");
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.play();
    p.muted = true;
  });

  // El pager llama esto cuando detecta deslizamiento desde mensajes
  const pedirPermisos = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverPermiso.current = resolve;
      setTipoPermiso("sms");
      setModalVisible(true);
      setMostrarAdvertencia(false);
    });
  }, []);

  const confirmarModal = useCallback(async () => {
    if (tipoPermiso === "sms") {
      try { await SMS.isAvailableAsync(); } catch (e) { console.log("Error SMS:", e); }
      setTipoPermiso("llamada");
    } else {
      // Ambos aceptados → puede pasar
      setModalVisible(false);
      resolverPermiso.current(true);
    }
  }, [tipoPermiso]);

  const cancelarModal = useCallback(() => {
    setModalVisible(false);
    setMostrarAdvertencia(true);
  }, []);

  const reintentarPermisos = useCallback(() => {
    setMostrarAdvertencia(false);
    setTipoPermiso("sms");
    setModalVisible(true);
  }, []);

  const continuarSinPermisos = useCallback(() => {
    // Canceló pero igual puede pasar
    setMostrarAdvertencia(false);
    resolverPermiso.current(true);
  }, []);

  return {
    player,
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