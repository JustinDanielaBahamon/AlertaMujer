import { useCallback, useRef, useState } from "react";
import * as Contacts from "expo-contacts";
import { useVideoPlayer } from "expo-video";

export function useContactoTutorialViewModel() {
  // Controla el banner amarillo de advertencia cuando niega permisos
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);

  // Controla si nuestro modal explicativo está visible
  const [modalVisible, setModalVisible] = useState(false);

  // Guarda la función resolve de la Promise para resolverla después
  // cuando el usuario tome una decisión (aceptar/cancelar)
  const resolverPermiso = useRef<(valor: boolean) => void>(() => {});

  const videoSource = require("../../assets/imagesAlertaMujer/ScTutorial/contactos.mp4");
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.play();
    p.muted = true;
  });

  // El pager llama esto al detectar deslizamiento desde contactos.
  // Primero muestra nuestro modal explicativo antes del diálogo del sistema
  const pedirPermisos = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverPermiso.current = resolve;
      setModalVisible(true); // muestra nuestro modal primero
    });
  }, []);

  // Usuario tocó "Permitir acceso" en nuestro modal →
  // ahora sí lanzamos el diálogo nativo del sistema
  const confirmarModal = useCallback(async () => {
    setModalVisible(false);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      resolverPermiso.current(true); // permiso concedido → avanza
    } else {
      setMostrarAdvertencia(true); // permiso negado → banner amarillo
    }
  }, []);

  // Usuario tocó "Regresar" en nuestro modal → muestra banner
  const cancelarModal = useCallback(() => {
    setModalVisible(false);
    setMostrarAdvertencia(true);
  }, []);

  // Usuario tocó "Activar permisos" en el banner → vuelve al modal
  const reintentarPermisos = useCallback(() => {
    setMostrarAdvertencia(false);
    setModalVisible(true);
  }, []);

  // Usuario tocó "Continuar sin permisos" → avanza igual
  const continuarSinPermisos = useCallback(() => {
    setMostrarAdvertencia(false);
    resolverPermiso.current(true);
  }, []);

  return {
    player,
    modalVisible,
    mostrarAdvertencia,
    pedirPermisos,
    confirmarModal,
    cancelarModal,
    reintentarPermisos,
    continuarSinPermisos,
  };
}