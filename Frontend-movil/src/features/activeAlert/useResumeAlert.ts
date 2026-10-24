import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useEffect } from "react";
import { AppState } from "react-native";
import type { MainStackParamList } from "../../navigation/types";
import { ownActiveAlert, getMyAlerts } from "../../services/alerts.service";

// On these screens the alert is already shown (or being created): do not navigate on top
const ALERT_SCREENS = new Set(["Activation", "ActiveAlert"]);

/**
 * If the user has an active alert (e.g. she closed the app from "Recents" with the alert in
 * progress), opening or returning to the app shows the active alert screen again, which
 * resumes that same alert and sends the location again. Before, the alert stayed active on the
 * server but the app did not know and stopped sending the location.
 */
export function useResumeAlert(
  navigation: NavigationContainerRefWithCurrent<MainStackParamList>,
  withSession: boolean,
): void {
  useEffect(() => {
    if (!withSession) return undefined;
    let alive = true;

    const show = (alertId: number, attempts = 20) => {
      if (!alive) return;
      if (!navigation.isReady()) {
        if (attempts > 0) setTimeout(() => show(alertId, attempts - 1), 300);
        return;
      }
      const current = navigation.getCurrentRoute()?.name;
      if (current && ALERT_SCREENS.has(current)) return;
      navigation.navigate("ActiveAlert", { alertId: alertId });
    };

    const check = async () => {
      try {
        const active = ownActiveAlert(await getMyAlerts());
        // An alert "cancelled" with the duress PIN goes on silently: opening it would give her away
        if (active && !active.duressAt) show(active.id);
      } catch {
        // Offline: checked again when returning to the app
      }
    };

    check();
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") check();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, [withSession, navigation]);
}
