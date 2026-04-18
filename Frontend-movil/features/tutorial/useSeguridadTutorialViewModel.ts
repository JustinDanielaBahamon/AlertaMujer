import { useCallback, useRef, useState } from "react";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";// por ahora utilizamos esta no me deja con la otra 
import { useVideoPlayer } from "expo-video";

export function useSeguridadTutorialViewModel() {

  // Controla qué modal se muestra: primero cámara, luego audio
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoPermiso, setTipoPermiso] = useState<"camara" | "audio">("camara");

  // Banner amarillo si negó algún permiso
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);

  // Guarda el resolve de la Promise para resolverla cuando el usuario decida
  const resolverPermiso = useRef<(valor: boolean) => void>(() => {});

  const videoSource = require("../../assets/imagesAlertaMujer/ScTutorial/seguridad.mp4");
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.play();
    p.muted = true;
  });

  // El pager llama esto al deslizar desde SeguridadScreen
  const pedirPermisos = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverPermiso.current = resolve;
      // Empieza siempre por cámara
      setTipoPermiso("camara");
      setModalVisible(true);
      setMostrarAdvertencia(false);
    });
  }, []);

  const confirmarModal = useCallback(async () => {
    if (tipoPermiso === "camara") {
      // Pide permiso de cámara al sistema y pasa al modal de audio
      await Camera.requestCameraPermissionsAsync();
      setTipoPermiso("audio");
    } else {
      // Pide permiso de audio al sistema
      const { status } = await Audio.requestPermissionsAsync();
      setModalVisible(false);
      if (status === "granted") {
        resolverPermiso.current(true); // ambos listos → avanza
      } else {
        setMostrarAdvertencia(true); // negó audio → banner
      }
    }
  }, [tipoPermiso]);

  const cancelarModal = useCallback(() => {
    setModalVisible(false);
    setMostrarAdvertencia(true); // negó → muestra banner
  }, []);

  const reintentarPermisos = useCallback(() => {
    setMostrarAdvertencia(false);
    // Vuelve desde el inicio: primero cámara
    setTipoPermiso("camara");
    setModalVisible(true);
  }, []);

  const continuarSinPermisos = useCallback(() => {
    setMostrarAdvertencia(false);
    resolverPermiso.current(true); // avanza igual sin permisos
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