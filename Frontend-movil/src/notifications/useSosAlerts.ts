import { useEffect } from "react";
import { Alert } from "react-native";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import notifee, { EventType } from "@notifee/react-native";
import { getApp } from "@react-native-firebase/app";
import { getMessaging, onMessage } from "@react-native-firebase/messaging";
import type { MainStackParamList } from "../navigation/types";
import {
  openFullScreenSetting,
  shouldOfferFullScreen,
  markFullScreenNoticeShown,
  pushAvailable,
  registrarPush,
} from "../services/push.service";
import {
  openSosAlert,
  onSosAlertOpen,
  notificationData,
  isEndedAlert,
  isSosAlert,
  showSosAlarm,
  showEndedAlert,
} from "./sosAlarm";
import { handleProtectionEvent } from "../features/shake/protectionService";
import { isNewPhone, showNewPhone } from "./newPhone";
import { isTripNotification, isTripDueSoon, showTripDueSoon } from "./tripDueSoon";
import { isInTutorial } from "../navigation/navigationHelpers";
import { isLocationRequest, answerLocationRequest } from "../services/locationRequest";

/**
 * When signed in: registers the push token, shows the alarm if an alert arrives with the app
 * open and leads to the alert screen when the notification is tapped (or when it opens by itself).
 */
export function useSosAlerts(
  navigation: NavigationContainerRefWithCurrent<MainStackParamList>,
  withSession: boolean,
): void {
  useEffect(() => {
    if (!withSession) return undefined;

    registrarPush().then(async () => {
      if (!isInTutorial(navigation) && (await shouldOfferFullScreen())) {
        await markFullScreenNoticeShown();
        Alert.alert(
          "Alarma de emergencia",
          "Para que veas a pantalla completa cuando un contacto active una alerta, permite las notificaciones de pantalla completa de AlertaMujer.",
          [
            { text: "Ahora no", style: "cancel" },
            { text: "Permitir", onPress: () => openFullScreenSetting() },
          ],
        );
      }
    });

    const alreadyOpen = new Set<string>();
    const stopListening = onSosAlertOpen((data) => {
      if (alreadyOpen.has(data.alertaId)) return; // the same alert can arrive by several paths
      alreadyOpen.add(data.alertaId);
      const ir = (attempts: number) => {
        if (navigation.isReady()) {
          navigation.navigate("ContactAlert", {
            alertId: Number(data.alertaId),
            userName: data.nombre,
            code: data.codigo,
            delivery: data.envioId,
          });
        } else if (attempts > 0) {
          setTimeout(() => ir(attempts - 1), 300);
        }
      };
      ir(20);
    });

    // "Did you arrive?" of Let me know if I don't arrive: leads to the trip screen
    const goToTrip = (attempts = 20) => {
      if (navigation.isReady()) navigation.navigate("Trip");
      else if (attempts > 0) setTimeout(() => goToTrip(attempts - 1), 300);
    };

    // App opened from the notification or the full screen
    notifee.getInitialNotification().then((initial) => {
      // Notifee delivers it only once: it can also be the "Alert sent" one from shaking
      if (initial && handleProtectionEvent({ type: EventType.PRESS, detail: initial })) return;
      if (isTripNotification(initial?.notification?.data)) return goToTrip();
      const data = notificationData(initial?.notification);
      if (data) openSosAlert(data);
    });

    const stopListeningPresses = notifee.onForegroundEvent(({ type, detail }) => {
      if (handleProtectionEvent({ type, detail })) return;
      if (type === EventType.PRESS && isTripNotification(detail.notification?.data)) return goToTrip();
      const data = notificationData(detail.notification);
      if (data && (type === EventType.PRESS || type === EventType.ACTION_PRESS)) openSosAlert(data);
    });

    // With the app in the foreground: the alarm sounds and the alert screen opens directly
    let stopListeningPush: (() => void) | undefined;
    if (pushAvailable()) {
      try {
        stopListeningPush = onMessage(getMessaging(getApp()), async (message) => {
          if (isSosAlert(message.data)) {
            await showSosAlarm(message.data);
            openSosAlert(message.data);
          } else if (isEndedAlert(message.data)) {
            await showEndedAlert(message.data);
          } else if (isLocationRequest(message.data)) {
            await answerLocationRequest();
          } else if (isNewPhone(message.data)) {
            await showNewPhone(message.data);
          } else if (isTripDueSoon(message.data)) {
            await showTripDueSoon(message.data);
          }
        });
      } catch (error) {
        console.warn("[push] Firebase no está disponible:", error);
      }
    }

    return () => {
      stopListening();
      stopListeningPresses();
      stopListeningPush?.();
    };
  }, [withSession, navigation]);
}
