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
  const elapsed = useRef(0);

  // Duración real de la animación (frames / fps)
  const duration = Math.max(500, ((source.op - source.ip) / source.fr) * 1000);

  useEffect(() => {
    if (!isActive) return;

    let frame = 0;
    let lastItem = Date.now();
    let lastRender = 0;

    const tick = () => {
      const now = Date.now();
      elapsed.current = (elapsed.current + (now - lastItem)) % duration;
      lastItem = now;

      // ~30 actualizaciones por segundo es suficiente y cuida la batería
      if (now - lastRender >= 33) {
        lastRender = now;
        setProgress(elapsed.current / duration);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, duration]);

  return <LottieView source={source} progress={progress} resizeMode={resizeMode} style={style} />;
}