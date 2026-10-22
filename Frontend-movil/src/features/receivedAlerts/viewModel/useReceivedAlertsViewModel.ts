import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import type { MainStackParamList } from "../../../navigation/types";
import { getReceivedAlerts, getTrackingCode, type ReceivedAlert } from "../../../services/received-alerts.service";

type Nav = NativeStackNavigationProp<MainStackParamList>;

// While there is an active alert the list updates itself
const REFRESH_MS = 30_000;

/**
 * Alerts from the people who have the user as an emergency contact: in case she could not
 * answer the alarm, here she can see what happened and open the tracking while it is still available.
 */
export function useReceivedAlertsViewModel() {
  const navigation = useNavigation<Nav>();
  const { t } = useLocale();
  const [alerts, setAlerts] = useState<ReceivedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [opening, setOpening] = useState<number | null>(null);
  const focused = useRef(false);

  const load = useCallback(async () => {
    try {
      setAlerts(await getReceivedAlerts());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      load();
      return () => {
        focused.current = false;
      };
    }, [load]),
  );

  const hasActive = alerts.some((a) => a.active);
  useEffect(() => {
    if (!hasActive) return;
    const id = setInterval(() => focused.current && load(), REFRESH_MS);
    return () => clearInterval(id);
  }, [hasActive, load]);

  const open = useCallback(
    async (alert: ReceivedAlert) => {
      if (!alert.trackingAvailable || opening !== null) return;
      setOpening(alert.id);
      try {
        const code = await getTrackingCode(alert.id);
        navigation.navigate("ContactAlert", {
          alertId: alert.id,
          userName: alert.name || undefined,
          code: code,
        });
      } catch {
        Alert.alert(t.alertasRecibidas.titulo_header, t.alertasRecibidas.error_seguimiento);
        load();
      } finally {
        setOpening(null);
      }
    },
    [opening, navigation, t, load],
  );

  return {
    activeOnes: alerts.filter((a) => a.active),
    previousOnes: alerts.filter((a) => !a.active),
    loading: loading,
    error,
    opening: opening,
    reload: load,
    open: open,
    goBack: navigation.goBack,
  };
}
