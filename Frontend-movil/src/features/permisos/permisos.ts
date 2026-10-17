import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { Camera } from "expo-camera";
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
import { Linking, Platform } from "react-native";
import SensorSacudidas from "../../../modules/sensor-sacudidas";
import { enColaDePermisos, permisoNotificaciones, permisoUbicacion } from "../../services/permisosSeguros";

/**
 * Permisos y ajustes que necesita la protección de AlertaMujer. "Crítico" = sin él una alerta puede
 * no enviarse (o no activarse al agitar): por esos se le recuerda a la usuaria al abrir la app.
 */
export type IdPermiso = "agitar" | "ubicacion" | "notificaciones" | "bateria" | "microfono" | "camara" | "contactos";

export type InfoPermiso = {
  id: IdPermiso;
  titulo: string;
  descripcion: string;
  icono: string; // MaterialIcons
  critico: boolean;
};

export const PERMISOS: InfoPermiso[] = [
  {
    id: "agitar",
    titulo: "Agitar el teléfono",
    descripcion: "Envía una alerta al agitar el teléfono, aunque la app esté cerrada o la pantalla apagada.",
    icono: "vibration",
    critico: true,
  },
  {
    id: "ubicacion",
    titulo: "Ubicación",
    descripcion: "Para enviar dónde estás a tus contactos cuando activas una alerta.",
    icono: "location-on",
    critico: true,
  },
  {
    id: "notificaciones",
    titulo: "Notificaciones",
    descripcion: "Para la cuenta regresiva al agitar y para recibir las alertas de tus contactos.",
    icono: "notifications-active",
    critico: true,
  },
  {
    id: "bateria",
    titulo: "Batería sin restricciones",
    descripcion: "Evita que el ahorro de batería apague la protección con la pantalla apagada.",
    icono: "battery-charging-full",
    critico: true,
  },
  {
    id: "microfono",
    titulo: "Micrófono",
    descripcion: "Para grabar audio como evidencia durante una alerta.",
    icono: "mic",
    critico: false,
  },
  {
    id: "camara",
    titulo: "Cámara",
    descripcion: "Para grabar video como evidencia durante una alerta.",
    icono: "videocam",
    critico: false,
  },
  {
    id: "contactos",
    titulo: "Contactos del teléfono",
    descripcion: "Para elegir tus contactos de emergencia desde la agenda.",
    icono: "contacts",
    critico: false,
  },
];

export type EstadoPermiso = {
  concedido: boolean;
  /** false si Android ya no deja volver a preguntar: hay que abrir los ajustes de la app. */
  puedePreguntar: boolean;
};

type Permiso = { granted: boolean; canAskAgain: boolean };
const aEstado = (p: Permiso): EstadoPermiso => ({ concedido: p.granted, puedePreguntar: p.canAskAgain });

/** Estado actual de cada permiso o ajuste. agitarActivo viene de los ajustes de la app. */
export async function revisarPermisos(agitarActivo: boolean): Promise<Record<IdPermiso, EstadoPermiso>> {
  const [ubicacion, notificaciones, microfono, camara, contactos] = await Promise.all([
    Location.getForegroundPermissionsAsync().then(aEstado),
    notifee.getNotificationSettings().then((s) => ({
      concedido: s.authorizationStatus === AuthorizationStatus.AUTHORIZED,
      puedePreguntar: true,
    })),
    Camera.getMicrophonePermissionsAsync().then(aEstado),
    Camera.getCameraPermissionsAsync().then(aEstado),
    Contacts.getPermissionsAsync().then(aEstado),
  ]);
  const bateria = Platform.OS !== "android" || SensorSacudidas.ignoraOptimizacionBateria();
  return {
    agitar: { concedido: agitarActivo, puedePreguntar: true },
    ubicacion,
    notificaciones,
    bateria: { concedido: bateria, puedePreguntar: true },
    microfono,
    camara,
    contactos,
  };
}

/** Faltantes críticos (para el recordatorio al abrir la app). */
export function faltantesCriticos(estados: Record<IdPermiso, EstadoPermiso>): InfoPermiso[] {
  return PERMISOS.filter((p) => p.critico && !estados[p.id].concedido);
}

/**
 * Pide el permiso; si Android ya no lo deja pedir, abre los ajustes de la app. "agitar" no es un
 * permiso: lo enciende quien llama (ajuste de la app).
 */
export async function activarPermiso(id: Exclude<IdPermiso, "agitar">, estado: EstadoPermiso): Promise<void> {
  if (!estado.puedePreguntar) {
    await Linking.openSettings();
    return;
  }
  // De una en una (ver permisosSeguros): dos peticiones a la vez pueden trabar la app
  switch (id) {
    case "ubicacion":
      await permisoUbicacion();
      return;
    case "notificaciones":
      if (!(await permisoNotificaciones())) await notifee.openNotificationSettings();
      return;
    case "bateria":
      SensorSacudidas.pedirIgnorarOptimizacionBateria();
      return;
    case "microfono":
      await enColaDePermisos(() => Camera.requestMicrophonePermissionsAsync());
      return;
    case "camara":
      await enColaDePermisos(() => Camera.requestCameraPermissionsAsync());
      return;
    case "contactos":
      await enColaDePermisos(() => Contacts.requestPermissionsAsync());
      return;
  }
}
