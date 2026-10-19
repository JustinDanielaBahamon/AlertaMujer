// Punto de entrada: antes de montar la app se registran los manejadores que deben funcionar con
// la app cerrada o en segundo plano (push de alerta de emergencia y toques en la notificación).
import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import Constants from "expo-constants";
import notifee, { EventType } from "@notifee/react-native";
import { getApp } from "@react-native-firebase/app";
import { getMessaging, setBackgroundMessageHandler } from "@react-native-firebase/messaging";
import App from "./App";
import { esNuevoCelular, mostrarNuevoCelular } from "./src/notifications/nuevoCelular";
import { esPedidoUbicacion, responderPedidoUbicacion } from "./src/services/pedidoUbicacion";
import { manejarEventoProteccion, registrarServicioProteccion } from "./src/features/agitar/servicioProteccion";
import {
  abrirAlertaSos,
  datosDeNotificacion,
  esAlertaFinalizada,
  esAlertaSos,
  mostrarAlarmaSos,
  mostrarAlertaFinalizada,
} from "./src/notifications/alarmaSos";

if (Constants.expoConfig?.extra?.pushConfigurado === true) {
  try {
    setBackgroundMessageHandler(getMessaging(getApp()), async (mensaje) => {
      if (esAlertaSos(mensaje.data)) {
        await mostrarAlarmaSos(mensaje.data);
      } else if (esAlertaFinalizada(mensaje.data)) {
        await mostrarAlertaFinalizada(mensaje.data);
      } else if (esPedidoUbicacion(mensaje.data)) {
        await responderPedidoUbicacion();
      } else if (esNuevoCelular(mensaje.data)) {
        await mostrarNuevoCelular(mensaje.data);
      }
    });
  } catch (error) {
    console.warn("[push] Firebase no está disponible:", error);
  }
}

// Servicio de "agitar el teléfono" (notificación fija "Protección activa")
registrarServicioProteccion();

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (manejarEventoProteccion({ type, detail })) return;
  const datos = datosDeNotificacion(detail.notification);
  if (datos && (type === EventType.PRESS || type === EventType.ACTION_PRESS)) {
    abrirAlertaSos(datos);
  }
});

registerRootComponent(App);
