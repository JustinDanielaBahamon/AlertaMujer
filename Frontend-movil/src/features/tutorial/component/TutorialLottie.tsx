import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { useAnimationsAllowed } from "./animationSupport";
import { useTutorialPage } from "./TutorialPager";

interface Props {
  source: any;
  style?: StyleProp<ViewStyle>;
  resizeMode?: "cover" | "contain" | "center";
}

// Frame shown when the phone does not play animations: the middle of the animation is the most complete
const STILL_PROGRESS = 0.5;

/**
 * Tutorial animation. It plays natively (on the animation thread, without re-rendering React) and only
 * on the visible page; on phones that cannot afford it, or with "reduce motion" on, a still frame is
 * shown. Nothing of this runs outside the tutorial: the component only exists inside it.
 */
export default function TutorialLottie({ source, style, resizeMode = "contain" }: Props) {
  const { isActive } = useTutorialPage();
  const animate = useAnimationsAllowed();
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    if (!animate) return;
    if (isActive) ref.current?.play();
    else ref.current?.pause();
  }, [isActive, animate]);

  if (!animate) {
    return <LottieView source={source} progress={STILL_PROGRESS} resizeMode={resizeMode} style={style} />;
  }
  return <LottieView ref={ref} source={source} autoPlay={isActive} loop resizeMode={resizeMode} style={style} />;
}
