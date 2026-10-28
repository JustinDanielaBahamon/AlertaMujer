import { useCallback, useEffect, useState } from "react";
import ShakeSensor from "../../modules/shake-sensor";
import { isSosAlarmRinging, stopSosAlarm } from "./sosAlarm";

/** While it rings, how often it is checked whether the contact already silenced it some other way. */
const CHECK_MS = 3000;

const silencerAvailable = () => typeof ShakeSensor?.startAlarmSilencer === "function";

/**
 * On a contact's alert screen: while the alarm rings, one press of either volume key silences it (like
 * an incoming call). Opening the screen no longer turns it off: the phone may be far away. It also
 * notices when the alarm was silenced from the notification bar or ended by itself.
 */
export function useAlarmSilencer(alertId: number | string | undefined, enabled: boolean) {
  const [ringing, setRinging] = useState(false);

  const silence = useCallback(() => {
    if (alertId == null) return;
    setRinging(false);
    void stopSosAlarm(alertId).catch(() => undefined);
  }, [alertId]);

  useEffect(() => {
    if (!enabled || alertId == null) return undefined;
    let active = true;
    const check = async () => {
      const now = await isSosAlarmRinging(alertId);
      if (active) setRinging(now);
    };
    void check();
    const timer = setInterval(check, CHECK_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [alertId, enabled]);

  // The volume keys are listened to only while it rings
  useEffect(() => {
    if (!ringing || !silencerAvailable()) return undefined;
    const sub = ShakeSensor.addListener("onAlarmSilence", silence);
    ShakeSensor.startAlarmSilencer();
    return () => {
      sub.remove();
      ShakeSensor.stopAlarmSilencer();
    };
  }, [ringing, silence]);

  return { ringing, silence };
}
