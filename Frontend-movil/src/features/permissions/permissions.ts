import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { Camera } from "expo-camera";
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
import { Linking, Platform, Alert } from "react-native";
import ShakeSensor from "../../../modules/shake-sensor";
import { reportPermissions } from "../../services/devices.service";
import { inPermissionQueue, notificationsPermission, locationPermission } from "../../services/safePermissions";
import { registrarPush } from "../../services/push.service";

/**
 * Permisos y ajustes que necesita la protección de AlertaMujer. "Crítico" = sin él una alerta puede
 * no enviarse (o no activarse al agitar): por esos se le recuerda a la usuaria al abrir la app.
 */
export type PermissionId =
  | "agitar"
  | "ubicacion"
  | "notificaciones"
  | "bateria"
  | "pantallaCompleta"
  | "inicioAutomatico"
  | "microfono"
  | "camara"
  | "contactos";

export type PermissionInfo = {
  id: PermissionId;
  title: string;
  description: string;
  icon: string; // MaterialIcons
  critical: boolean;
};

export const PERMISSIONS: PermissionInfo[] = [
  {
    id: "agitar",
    title: "Agitar el teléfono",
    description: "Envía una alerta al agitar el teléfono, aunque la app esté cerrada o la pantalla apagada.",
    icon: "vibration",
    critical: true,
  },
  {
    id: "ubicacion",
    title: "Ubicación",
    description: "Para enviar dónde estás a tus contactos cuando activas una alerta.",
    icon: "location-on",
    critical: true,
  },
  {
    id: "notificaciones",
    title: "Notificaciones",
    description: "Para la cuenta regresiva al agitar y para recibir las alertas de tus contactos.",
    icon: "notifications-active",
    critical: true,
  },
  {
    id: "bateria",
    title: "Batería sin restricciones",
    description: "Evita que el ahorro de batería apague la protección con la pantalla apagada.",
    icon: "battery-charging-full",
    critical: true,
  },
  {
    id: "pantallaCompleta",
    title: "Alarma a pantalla completa",
    description: "Para que la alarma de emergencia de tus contactos aparezca aunque el teléfono esté bloqueado.",
    icon: "fullscreen",
    critical: true,
  },
  {
    id: "inicioAutomatico",
    title: "Inicio automático",
    description:
      "Tu teléfono puede cerrar apps en segundo plano. Actívalo para AlertaMujer y la protección no se detendrá.",
    icon: "autorenew",
    critical: false,
  },
  {
    id: "microfono",
    title: "Micrófono",
    description: "Para grabar audio como evidencia durante una alerta.",
    icon: "mic",
    critical: false,
  },
  {
    id: "camara",
    title: "Cámara",
    description: "Para grabar video como evidencia durante una alerta.",
    icon: "videocam",
    critical: false,
  },
  {
    id: "contactos",
    title: "Contactos del teléfono",
    description: "Para elegir tus contactos de emergencia desde la agenda.",
    icon: "contacts",
    critical: false,
  },
];

export type PermissionStatus = {
  /** null = Android no deja comprobarlo (se verifica por las interrupciones de la protección). */
  granted: boolean | null;
  /** No aplica a este teléfono (p. ej. su marca no tiene "inicio automático"): no se muestra. */
  hidden?: boolean;
  /** false si Android ya no deja volver a preguntar: hay que abrir los ajustes de la app. */
  canAsk: boolean;
};

type Permission = { granted: boolean; canAskAgain: boolean };
const toStatus = (p: Permission): PermissionStatus => ({ granted: p.granted, canAsk: p.canAskAgain });

/**
 * Estado actual de cada permiso o ajuste. agitarActivo viene de los ajustes de la app;
 * cortesDelSistema: veces recientes que el teléfono detuvo la protección (ver saludProteccion).
 */
export async function checkPermissions(
  shakeEnabled: boolean,
  systemKills = 0,
): Promise<Record<PermissionId, PermissionStatus>> {
  const [location, notifications, microphonePermission, camera, contacts] = await Promise.all([
    Location.getForegroundPermissionsAsync().then(toStatus),
    notifee.getNotificationSettings().then((s) => ({
      granted: s.authorizationStatus === AuthorizationStatus.AUTHORIZED,
      canAsk: true,
    })),
    Camera.getMicrophonePermissionsAsync().then(toStatus),
    Camera.getCameraPermissionsAsync().then(toStatus),
    Contacts.getPermissionsAsync().then(toStatus),
  ]);
  const android = Platform.OS === "android";
  const battery = !android || ShakeSensor.ignoresBatteryOptimization();
  const fullScreen = !android || ShakeSensor.canUseFullScreen();
  const withAutoStart = android && ShakeSensor.hasAutoStartSetting();
  // La web muestra si el celular está listo para una emergencia
  void reportPermissions({
    ubicacion: location.granted === true,
    notificaciones: notifications.granted === true,
    agitar: shakeEnabled,
    bateria: battery,
    pantallaCompleta: fullScreen,
    microfono: microphonePermission.granted === true,
    camara: camera.granted === true,
  });
  return {
    agitar: { granted: shakeEnabled, canAsk: true },
    ubicacion: location,
    notificaciones: notifications,
    bateria: { granted: battery, canAsk: true },
    pantallaCompleta: { granted: fullScreen, canAsk: true },
    // La marca no deja leerlo: si el teléfono ya cortó la protección, falta; si no, hay que revisarlo
    inicioAutomatico: {
      granted: systemKills > 0 ? false : null,
      canAsk: true,
      hidden: !withAutoStart,
    },
    microfono: microphonePermission,
    camara: camera,
    contactos: contacts,
  };
}

/** Faltantes críticos (para el recordatorio al abrir la app). */
export function missingCritical(statuses: Record<PermissionId, PermissionStatus>): PermissionInfo[] {
  return PERMISSIONS.filter((p) => p.critical && statuses[p.id].granted === false && !statuses[p.id].hidden);
}

/**
 * Pide el permiso; si Android ya no lo deja pedir, abre los ajustes de la app. "agitar" no es un
 * permiso: lo enciende quien llama (ajuste de la app).
 */
export async function grantPermission(id: Exclude<PermissionId, "agitar">, status: PermissionStatus): Promise<void> {
  if (!status.canAsk) {
    await Linking.openSettings();
    return;
  }
  // De una en una (ver permisosSeguros): dos peticiones a la vez pueden trabar la app
  switch (id) {
    case "ubicacion":
      await locationPermission();
      return;
    case "notificaciones":
      if (!(await notificationsPermission())) await notifee.openNotificationSettings();
      // Con el permiso recién dado, el celular ya puede recibir las alertas de sus contactos
      else await registrarPush();
      return;
    case "bateria":
      // Si no salió el diálogo del sistema se abrió la página de la app: se explica qué tocar
      if (!ShakeSensor.requestIgnoreBatteryOptimization()) {
        Alert.alert(
          "Batería sin restricciones",
          "En la página de AlertaMujer que se abrió entra a \"Batería\" y elige \"Sin restricciones\" (en Samsung: Batería → Sin restricciones).",
        );
      }
      return;
    case "pantallaCompleta":
      ShakeSensor.requestFullScreen();
      return;
    case "inicioAutomatico":
      if (!ShakeSensor.openAutoStart()) {
        Alert.alert(
          "Inicio automático",
          "En la página de AlertaMujer que se abrió busca \"Inicio automático\" o \"Batería\" y permite que la app se ejecute en segundo plano.",
        );
      }
      return;
    case "microfono":
      await inPermissionQueue(() => Camera.requestMicrophonePermissionsAsync());
      return;
    case "camara":
      await inPermissionQueue(() => Camera.requestCameraPermissionsAsync());
      return;
    case "contactos":
      await inPermissionQueue(() => Contacts.requestPermissionsAsync());
      return;
  }
}
