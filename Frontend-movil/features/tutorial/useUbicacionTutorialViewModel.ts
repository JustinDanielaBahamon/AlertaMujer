// useUbicacionTutorialViewModel.ts
import { useCallback, useRef, useState } from "react";
import { useVideoPlayer } from 'expo-video';

export function useUbicacionTutorialViewModel() {
  const [departamento, setDepartamento] = useState("Huila");
  const [municipio, setMunicipio] = useState("Neiva");
  const [modalConfirmacionVisible, setModalConfirmacionVisible] = useState(false);

  // 🆕 Referencia para avisar al Pager que ya confirmamos (Igual que en Mensajes)
  const resolverPaso = useRef<(valor: boolean) => void>(() => {});

  const videoSource = require("../../assets/imagesAlertaMujer/ScTutorial/ubicacion.mp4");
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.play();
    p.muted = true;
  });

  // 🆕 Esta función la llamará el Pager cuando el usuario intente deslizar
  const pedirConfirmacionUbicacion = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverPaso.current = resolve;
      setModalConfirmacionVisible(true);
    });
  }, []);

  const abrirConfirmacion = useCallback(() => {
    setModalConfirmacionVisible(true);
  }, []);

  const cerrarConfirmacion = useCallback(() => {
    setModalConfirmacionVisible(false);
    // Si cancela, resolvemos con false para que el Pager no avance
    resolverPaso.current(false);
  }, []);

  const confirmarUbicacion = useCallback(() => {
    setModalConfirmacionVisible(false);
    // ✅ ÉXITO: Ahora el Pager sabe que puede avanzar a Contactos
    resolverPaso.current(true);
  }, []);

  return {
    departamento,
    setDepartamento,
    municipio,
    setMunicipio,
    modalConfirmacionVisible,
    abrirConfirmacion,
    cerrarConfirmacion,
    confirmarUbicacion,
    pedirConfirmacionUbicacion, // 👈 Importante exportar esto
    player,
    municipiosHuila: [
      "Neiva", "Pitalito", "Garzón", "San Agustín", "Gigante",
      "Campoalegre", "Rivera", "La Plata", "Palermo", "Isnos",
    ],
  };
}