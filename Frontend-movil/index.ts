// Entry point: before mounting the app, register the handlers that must work with
// the app closed or in the background (emergency alert push and taps on the notification).
import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import Constants from "expo-constants";
import notifee, { EventType } from "@notifee/react-native";
import { getApp } from "@react-native-firebase/app";
import { getMessaging, setBackgroundMessageHandler } from "@react-native-firebase/messaging";
import App from "./App";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTask } from "./src/features/widget/widgetTask";
import { isNewPhone, showNewPhone } from "./src/notifications/newPhone";
import { isTripDueSoon, showTripDueSoon } from "./src/notifications/tripDueSoon";
import { isEvidenceExpiry, showEvidenceExpiry } from "./src/notifications/evidenceExpiry";
import { isLocationRequest, answerLocationRequest } from "./src/services/locationRequest";
import { handleProtectionEvent, registerProtectionService } from "./src/features/shake/protectionService";
import ShakeSensor from "./modules/shake-sensor";
import { isOwnAlert, showOwnAlert } from "./src/notifications/ownAlert";
import {
  rememberSosToOpen,
  openSosAlert,
  notificationData,
  isEndedAlert,
  isSosAlert,
  showSosAlarm,
  showEndedAlert,
} from "./src/notifications/sosAlarm";

if (Constants.expoConfig?.extra?.pushConfigurado === true) {
  try {
    setBackgroundMessageHandler(getMessaging(getApp()), async (message) => {
      if (isSosAlert(message.data)) {
        await showSosAlarm(message.data);
        // With "Mostrar sobre otras apps" the app comes to the front and opens the alert by itself
        if (!message.data.aviso) {
          await rememberSosToOpen(message.data);
          openSosAlert(message.data);
          try {
            ShakeSensor.bringToFront?.();
          } catch {
            // Old build without the function: the alarm notification stays
          }
        }
      } else if (isOwnAlert(message.data)) {
        await showOwnAlert(message.data);
      } else if (isEndedAlert(message.data)) {
        await showEndedAlert(message.data);
      } else if (isLocationRequest(message.data)) {
        await answerLocationRequest();
      } else if (isNewPhone(message.data)) {
        await showNewPhone(message.data);
      } else if (isTripDueSoon(message.data)) {
        await showTripDueSoon(message.data);
      } else if (isEvidenceExpiry(message.data)) {
        await showEvidenceExpiry(message.data);
      }
    });
  } catch (error) {
    console.warn("[push] Firebase no está disponible:", error);
  }
}

// "Shake the phone" service (persistent "Active protection" notification)
registerProtectionService();

// Home screen "SOS" widget: Android asks to draw it even when the app is closed
registerWidgetTaskHandler(widgetTask);

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (handleProtectionEvent({ type, detail })) return;
  const data = notificationData(detail.notification);
  if (data && (type === EventType.PRESS || type === EventType.ACTION_PRESS)) {
    openSosAlert(data);
  }
});

registerRootComponent(App);
