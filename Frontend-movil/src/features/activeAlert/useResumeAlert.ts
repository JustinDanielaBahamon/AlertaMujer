import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useEffect } from "react";
import { AppState } from "react-native";
import type { MainStackParamList } from "../../navigation/types";
import { ownActiveAlert, getMyAlerts } from "../../services/alerts.service";
import { getReceivedAlerts, getTrackingCode } from "../../services/received-alerts.service";

// On these screens an alert is already shown (or being created): do not navigate on top
const ALERT_SCREENS = new Set(["Activation", "ActiveAlert", "ContactAlert"]);
/** While the app is open it looks again this often (an alert the server activates, a contact's alert). */
const CHECK_EVERY_MS = 60 * 1000;

// A contact's alert opens by itself once per app session: if she closes it, she is not taken back
const openedContactAlerts = new Set<number>();

// "Look now" (a push said an alert started): the hook of the open app runs its check
const checkRequests = new Set<() => void>();
export function requestAlertCheck(): void {
  checkRequests.forEach((check) => check());
}

/**
 * Opening the app (or coming back to it) with an alert going on shows its screen right away:
 *  - her own active alert (e.g. she closed the app from "Recents", or the server activated it for her
 *    in a trip or the automatic protection): the active alert screen resumes it and sends the location;
 *  - the alert of a person who has her as a contact: its tracking screen, without searching the menu.
 * While the app is open it checks again every minute and whenever a push asks for it.
 */
export function useResumeAlert(
  navigation: NavigationContainerRefWithCurrent<MainStackParamList>,
  withSession: boolean,
): void {
  useEffect(() => {
    if (!withSession) return undefined;
    let alive = true;

    const currentScreen = () => navigation.getCurrentRoute()?.name;

    const whenReady = (go: () => void, attempts = 20) => {
      if (!alive) return;
      if (navigation.isReady()) return go();
      if (attempts > 0) setTimeout(() => whenReady(go, attempts - 1), 300);
    };

    const openContactAlert = async () => {
      const active = (await getReceivedAlerts())
        .filter((a) => a.active && a.trackingAvailable && !openedContactAlerts.has(a.id))
        .sort((a, b) => (b.startTime?.getTime() ?? 0) - (a.startTime?.getTime() ?? 0))[0];
      if (!active || !alive) return;
      const code = await getTrackingCode(active.id);
      whenReady(() => {
        const screen = currentScreen();
        if (screen && ALERT_SCREENS.has(screen)) return;
        openedContactAlerts.add(active.id);
        navigation.navigate("ContactAlert", { alertId: active.id, userName: active.name, code });
      });
    };

    const check = async () => {
      try {
        const own = ownActiveAlert(await getMyAlerts());
        // An alert "cancelled" with the duress PIN goes on silently: opening it would give her away
        if (own && !own.duressAt) {
          whenReady(() => {
            const screen = currentScreen();
            if (!screen || !ALERT_SCREENS.has(screen)) navigation.navigate("ActiveAlert", { alertId: own.id });
          });
          return;
        }
        await openContactAlert();
      } catch {
        // Offline: checked again on the next minute or when returning to the app
      }
    };

    check();
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") check();
    });
    const timer = setInterval(() => {
      if (AppState.currentState === "active") check();
    }, CHECK_EVERY_MS);
    checkRequests.add(check);
    return () => {
      alive = false;
      sub.remove();
      clearInterval(timer);
      checkRequests.delete(check);
    };
  }, [withSession, navigation]);
}
