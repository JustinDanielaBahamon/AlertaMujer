// Punto de entrada: antes de montar la app se registran los manejadores que deben funcionar con
// la app cerrada o en segundo plano (push de alerta de emergencia y toques en la notificación).
import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import Constants from "expo-constants";
import notifee, { EventType } from "@notifee/react-native";
import { getApp } from "@react-native-firebase/app";
import { getMessaging, setBackgroundMessageHandler } from "@react-native-firebase/messaging";
import App from "./App";
import { abrirAlertaSos, datosDeNotificacion, esAlertaSos, mostrarAlarmaSos } from "./src/notifications/alarmaSos";

if (Constants.expoConfig?.extra?.pushConfigurado === true) {
  try {
    setBackgroundMessageHandler(getMessaging(getApp()), async (mensaje) => {
      if (esAlertaSos(mensaje.data)) {
        await mostrarAlarmaSos(mensaje.data);
      }
    });
  } catch (error) {
    console.warn("[push] Firebase no está disponible:", error);
  }
}

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const datos = datosDeNotificacion(detail.notification);
  if (datos && (type === EventType.PRESS || type === EventType.ACTION_PRESS)) {
    abrirAlertaSos(datos);
  }
});

registerRootComponent(App);
