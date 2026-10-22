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
 * Replaces <LottieView autoPlay loop /> in the tutorial.
 * The animation progress is driven by JS itself (not the system animation clock),
 * so it looks the same on phones with animations disabled or battery saving on.
 * Only the visible screen is animated.
 */
export default function TutorialLottie({ source, style, resizeMode = "contain" }: Props) {
  const { isActive } = useTutorialPage();
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);

  // Real animation duration (frames / fps)
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

      // ~30 updates per second is enough and saves battery
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