import { useEffect } from "react";
import { Alert } from "react-native";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import notifee, { EventType } from "@notifee/react-native";
import { getApp } from "@react-native-firebase/app";
import { getMessaging, onMessage } from "@react-native-firebase/messaging";
import type { MainStackParamList } from "../navigation/types";
import {
  abrirAjustePantallaCompleta,
  debeOfrecerPantallaCompleta,
  marcarAvisoPantallaCompleta,
  pushDisponible,
  registrarPush,
} from "../services/push.service";
import {
  abrirAlertaSos,
  alAbrirAlertaSos,
  datosDeNotificacion,
  esAlertaFinalizada,
  esAlertaSos,
  mostrarAlarmaSos,
  mostrarAlertaFinalizada,
} from "./alarmaSos";
import { manejarEventoProteccion } from "../features/agitar/servicioProteccion";
import { esNuevoCelular, mostrarNuevoCelular } from "./nuevoCelular";
import { esPedidoUbicacion, responderPedidoUbicacion } from "../services/pedidoUbicacion";

/**
 * Con sesión iniciada: registra el token push, muestra la alarma si llega una alerta con la app
 * abierta y lleva a la pantalla de la alerta al tocar la notificación (o al abrirse sola).
 */
export function useAlertasSos(
  navegacion: NavigationContainerRefWithCurrent<MainStackParamList>,
  conSesion: boolean,
): void {
  useEffect(() => {
    if (!conSesion) return undefined;

    registrarPush().then(async () => {
      if (await debeOfrecerPantallaCompleta()) {
        await marcarAvisoPantallaCompleta();
        Alert.alert(
          "Alarma de emergencia",
          "Para que veas a pantalla completa cuando un contacto active una alerta, permite las notificaciones de pantalla completa de AlertaMujer.",
          [
            { text: "Ahora no", style: "cancel" },
            { text: "Permitir", onPress: () => abrirAjustePantallaCompleta() },
          ],
        );
      }
    });

    const yaAbiertas = new Set<string>();
    const dejarDeEscuchar = alAbrirAlertaSos((datos) => {
      if (yaAbiertas.has(datos.alertaId)) return; // la misma alerta puede llegar por varios caminos
      yaAbiertas.add(datos.alertaId);
      const ir = (intentos: number) => {
        if (navegacion.isReady()) {
          navegacion.navigate("AlertaContacto", {
            alertaId: Number(datos.alertaId),
            nombreUsuaria: datos.nombre,
            codigo: datos.codigo,
          });
        } else if (intentos > 0) {
          setTimeout(() => ir(intentos - 1), 300);
        }
      };
      ir(20);
    });

    // App abierta desde la notificación o la pantalla completa
    notifee.getInitialNotification().then((inicial) => {
      // Notifee la entrega una sola vez: también puede ser la de "Alerta enviada" al agitar
      if (inicial && manejarEventoProteccion({ type: EventType.PRESS, detail: inicial })) return;
      const datos = datosDeNotificacion(inicial?.notification);
      if (datos) abrirAlertaSos(datos);
    });

    const dejarDeOirToques = notifee.onForegroundEvent(({ type, detail }) => {
      if (manejarEventoProteccion({ type, detail })) return;
      const datos = datosDeNotificacion(detail.notification);
      if (datos && (type === EventType.PRESS || type === EventType.ACTION_PRESS)) abrirAlertaSos(datos);
    });

    // Con la app en primer plano: suena la alarma y se abre la pantalla de la alerta directamente
    let dejarDeOirPush: (() => void) | undefined;
    if (pushDisponible()) {
      try {
        dejarDeOirPush = onMessage(getMessaging(getApp()), async (mensaje) => {
          if (esAlertaSos(mensaje.data)) {
            await mostrarAlarmaSos(mensaje.data);
            abrirAlertaSos(mensaje.data);
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

    return () => {
      dejarDeEscuchar();
      dejarDeOirToques();
      dejarDeOirPush?.();
    };
  }, [conSesion, navegacion]);
}
