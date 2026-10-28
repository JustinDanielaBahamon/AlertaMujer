import ShakeSensor from "../../../modules/shake-sensor";
import { checkCancelPin, type PinCheck } from "./cancelPin";

/** "Detener" in the automatic protection notice opens this link when she has a cancel PIN. */
export const AUTO_STOP_LINK = "alertamujer://auto-protection/stop";

export const isAutoStopLink = (url: string | null | undefined): boolean =>
  !!url && url.toLowerCase().startsWith(AUTO_STOP_LINK);

/**
 * Her PIN after tapping "Detener": the normal one stops the protection; the duress one looks exactly the
 * same on her phone but her contacts are alerted silently. A wrong PIN changes nothing.
 */
export async function stopWithPin(pin: string): Promise<PinCheck> {
  const result = await checkCancelPin(pin);
  if (result === "ok") ShakeSensor.stopAutoProtection?.();
  else if (result === "duress") ShakeSensor.duressAutoProtection?.();
  return result;
}
