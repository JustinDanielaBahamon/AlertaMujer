import { Platform } from "react-native";

/**
 * Brands whose system has motion gestures triggered by shaking the phone that can
 * fire together with the alert (e.g. Moto Actions turns on the flashlight with two "chop"
 * motions, which could give the user away in the dark). The app cannot disable them:
 * it only warns and explains where to do it.
 */
export type GestureConflict = "motorola";

const BRANDS: Record<string, GestureConflict> = {
  motorola: "motorola",
  lenovo: "motorola", // Lenovo uses the same Moto Actions
};

export function gestureConflict(manufacturer: string | undefined, brand?: string): GestureConflict | null {
  for (const value of [manufacturer, brand]) {
    const key = (value ?? "").trim().toLowerCase();
    if (BRANDS[key]) return BRANDS[key];
  }
  return null;
}

/** Conflict of the phone the app runs on (Android only). */
export function conflictOnThisPhone(): GestureConflict | null {
  if (Platform.OS !== "android") return null;
  const c = Platform.constants as { Manufacturer?: string; Brand?: string };
  return gestureConflict(c.Manufacturer, c.Brand);
}
