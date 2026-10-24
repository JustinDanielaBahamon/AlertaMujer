import AsyncStorage from "@react-native-async-storage/async-storage";
import ShakeSensor from "../../../modules/shake-sensor";

/**
 * "Modo discreto": the persistent and alert notifications on HER phone show neutral texts, so whoever
 * looks at it (the aggressor, a thief) does not learn that she is protected or being recorded.
 * On by default. The native services read the same setting (ShakeSensor.setDiscreet).
 */
const KEY = "@alerta-mujer:discreet-notifications";

export const DISCREET_TITLE = "Servicio activo";
export const DISCREET_TEXT = "Toca para abrir";

let cached: boolean | null = null;

export async function isDiscreet(): Promise<boolean> {
  if (cached !== null) return cached;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cached = raw === null ? true : raw === "true";
  } catch {
    cached = true;
  }
  return cached;
}

export async function setDiscreet(on: boolean): Promise<void> {
  cached = on;
  try {
    if (typeof ShakeSensor?.setDiscreet === "function") ShakeSensor.setDiscreet(on);
  } catch {
    // Old build: only the JS notifications change
  }
  await AsyncStorage.setItem(KEY, String(on)).catch(() => {});
}

/** At startup: the native services get the saved choice (they also default to discreet). */
export async function syncDiscreet(): Promise<void> {
  const on = await isDiscreet();
  try {
    if (typeof ShakeSensor?.setDiscreet === "function") ShakeSensor.setDiscreet(on);
  } catch {
    // Old build
  }
}
