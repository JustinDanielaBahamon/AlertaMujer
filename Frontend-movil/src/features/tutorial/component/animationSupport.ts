import * as Device from "expo-device";
import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Whether this phone plays the tutorial animations. They are skipped (a still frame is shown instead)
 * on phones with little memory or old hardware, where they would make the app stutter, and when the
 * user asked the system to reduce motion.
 */

// Below this the animations compete with the camera, the map and the alert services for memory
const MIN_MEMORY_BYTES = 3 * 1024 ** 3;
// Phones older than this class tend to drop frames with vector animations
const MIN_YEAR_CLASS = 2018;

/** Hardware check only (synchronous, computed once). */
export function deviceCanAnimate(
  totalMemory: number | null = Device.totalMemory,
  yearClass: number | null = Device.deviceYearClass,
): boolean {
  if (totalMemory != null && totalMemory < MIN_MEMORY_BYTES) return false;
  if (yearClass != null && yearClass < MIN_YEAR_CLASS) return false;
  return true;
}

let hardware: boolean | null = null;

/** Hardware check plus the system "reduce motion" setting (it can change while the app is open). */
export function useAnimationsAllowed(): boolean {
  hardware ??= deviceCanAnimate();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (!hardware) return undefined;
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => active && setReduceMotion(on))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  return hardware && !reduceMotion;
}
