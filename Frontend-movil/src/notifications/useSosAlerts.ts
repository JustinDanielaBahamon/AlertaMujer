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
 * Con sesión iniciada: registra el token push, muestra la alarma si llega una alerta con la app
 * abierta y lleva a la pantalla de la alerta al tocar la notificación (o al abrirse sola).
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
      if (alreadyOpen.has(data.alertaId)) return; // la misma alerta puede llegar por varios caminos
      alreadyOpen.add(data.alertaId);
      const ir = (attempts: number) => {
        if (navigation.isReady()) {
          navigation.navigate("ContactAlert", {
            alertId: Number(data.alertaId),
            userName: data.nombre,
            code: data.codigo,
          });
        } else if (attempts > 0) {
          setTimeout(() => ir(attempts - 1), 300);
        }
      };
      ir(20);
    });

    // "¿Ya llegaste?" de Avísame si no llego: lleva a la pantalla del trayecto
    const goToTrip = (attempts = 20) => {
      if (navigation.isReady()) navigation.navigate("Trip");
      else if (attempts > 0) setTimeout(() => goToTrip(attempts - 1), 300);
    };

    // App abierta desde la notificación o la pantalla completa
    notifee.getInitialNotification().then((initial) => {
      // Notifee la entrega una sola vez: también puede ser la de "Alerta enviada" al agitar
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

    // Con la app en primer plano: suena la alarma y se abre la pantalla de la alerta directamente
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
