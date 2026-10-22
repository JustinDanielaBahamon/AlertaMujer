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
 * Permissions and settings AlertaMujer protection needs. "Critical" = without it an alert may
 * not be sent (or not be activated by shaking): the user is reminded of those when the app opens.
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
  /** null = Android does not let us check it (verified through protection interruptions). */
  granted: boolean | null;
  /** Does not apply to this phone (e.g. its brand has no "auto start"): not shown. */
  hidden?: boolean;
  /** false if Android no longer lets us ask again: the app settings must be opened. */
  canAsk: boolean;
};

type Permission = { granted: boolean; canAskAgain: boolean };
const toStatus = (p: Permission): PermissionStatus => ({ granted: p.granted, canAsk: p.canAskAgain });

/**
 * Current status of each permission or setting. shakeEnabled comes from the app settings;
 * systemKills: recent times the phone stopped protection (see protectionHealth).
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
  // The website shows whether the phone is ready for an emergency
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
    // The brand does not let us read it: if the phone already cut protection, it is missing; otherwise it must be checked
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

/** Missing critical items (for the reminder when the app opens). */
export function missingCritical(statuses: Record<PermissionId, PermissionStatus>): PermissionInfo[] {
  return PERMISSIONS.filter((p) => p.critical && statuses[p.id].granted === false && !statuses[p.id].hidden);
}

/**
 * Asks for the permission; if Android no longer lets us ask, opens the app settings. "agitar" is not a
 * permission: the caller turns it on (an app setting).
 */
export async function grantPermission(id: Exclude<PermissionId, "agitar">, status: PermissionStatus): Promise<void> {
  if (!status.canAsk) {
    await Linking.openSettings();
    return;
  }
  // One at a time (see safePermissions): two requests at once can freeze the app
  switch (id) {
    case "ubicacion":
      await locationPermission();
      return;
    case "notificaciones":
      if (!(await notificationsPermission())) await notifee.openNotificationSettings();
      // With the permission just granted, the phone can now receive its contacts' alerts
      else await registrarPush();
      return;
    case "bateria":
      // If the system dialog did not show, the app page was opened: explain what to tap
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
