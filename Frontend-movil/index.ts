// Punto de entrada: antes de montar la app se registran los manejadores que deben funcionar con
// la app cerrada o en segundo plano (push de alerta de emergencia y toques en la notificación).
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
import { isLocationRequest, answerLocationRequest } from "./src/services/locationRequest";
import { handleProtectionEvent, registerProtectionService } from "./src/features/shake/protectionService";
import {
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

// Servicio de "agitar el teléfono" (notificación fija "Protección activa")
registerProtectionService();

// Widget "SOS" de la pantalla de inicio: Android pide dibujarlo aunque la app esté cerrada
registerWidgetTaskHandler(widgetTask);

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (handleProtectionEvent({ type, detail })) return;
  const data = notificationData(detail.notification);
  if (data && (type === EventType.PRESS || type === EventType.ACTION_PRESS)) {
    openSosAlert(data);
  }
});

registerRootComponent(App);
