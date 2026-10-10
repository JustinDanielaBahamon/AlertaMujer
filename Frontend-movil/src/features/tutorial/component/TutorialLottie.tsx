import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { useTutorialPage } from "./TutorialPager";

interface Props {
  source: any;
  style?: StyleProp<ViewStyle>;
  resizeMode?: "cover" | "contain" | "center";
}

/**
 * Reemplaza a <LottieView autoPlay loop /> en el tutorial.
 * El progreso de la animación lo mueve el propio JS (no el reloj de animaciones del sistema),
 * así se ve igual en celulares con animaciones desactivadas o con ahorro de batería.
 * Solo se anima la pantalla que se está viendo.
 */
export default function TutorialLottie({ source, style, resizeMode = "contain" }: Props) {
  const { isActive } = useTutorialPage();
  const [progress, setProgress] = useState(0);
  const transcurrido = useRef(0);

  // Duración real de la animación (frames / fps)
  const duracion = Math.max(500, ((source.op - source.ip) / source.fr) * 1000);

  useEffect(() => {
    if (!isActive) return;

    let frame = 0;
    let ultimo = Date.now();
    let ultimoRender = 0;

    const tick = () => {
      const ahora = Date.now();
      transcurrido.current = (transcurrido.current + (ahora - ultimo)) % duracion;
      ultimo = ahora;

      // ~30 actualizaciones por segundo es suficiente y cuida la batería
      if (ahora - ultimoRender >= 33) {
        ultimoRender = ahora;
        setProgress(transcurrido.current / duracion);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, duracion]);

  return <LottieView source={source} progress={progress} resizeMode={resizeMode} style={style} />;
}