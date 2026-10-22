import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { Camera } from "expo-camera";
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
import { Linking, Platform, Alert } from "react-native";
import SensorSacudidas from "../../../modules/sensor-sacudidas";
import { reportarPermisos } from "../../services/devices.service";
import { enColaDePermisos, permisoNotificaciones, permisoUbicacion } from "../../services/permisosSeguros";
import { registrarPush } from "../../services/push.service";

/**
 * Permisos y ajustes que necesita la protección de AlertaMujer. "Crítico" = sin él una alerta puede
 * no enviarse (o no activarse al agitar): por esos se le recuerda a la usuaria al abrir la app.
 */
export type IdPermiso =
  | "agitar"
  | "ubicacion"
  | "notificaciones"
  | "bateria"
  | "pantallaCompleta"
  | "inicioAutomatico"
  | "microfono"
  | "camara"
  | "contactos";

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
    id: "pantallaCompleta",
    titulo: "Alarma a pantalla completa",
    descripcion: "Para que la alarma de emergencia de tus contactos aparezca aunque el teléfono esté bloqueado.",
    icono: "fullscreen",
    critico: true,
  },
  {
    id: "inicioAutomatico",
    titulo: "Inicio automático",
    descripcion:
      "Tu teléfono puede cerrar apps en segundo plano. Actívalo para AlertaMujer y la protección no se detendrá.",
    icono: "autorenew",
    critico: false,
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
  /** null = Android no deja comprobarlo (se verifica por las interrupciones de la protección). */
  concedido: boolean | null;
  /** No aplica a este teléfono (p. ej. su marca no tiene "inicio automático"): no se muestra. */
  oculto?: boolean;
  /** false si Android ya no deja volver a preguntar: hay que abrir los ajustes de la app. */
  puedePreguntar: boolean;
};

type Permiso = { granted: boolean; canAskAgain: boolean };
const aEstado = (p: Permiso): EstadoPermiso => ({ concedido: p.granted, puedePreguntar: p.canAskAgain });

/**
 * Estado actual de cada permiso o ajuste. agitarActivo viene de los ajustes de la app;
 * cortesDelSistema: veces recientes que el teléfono detuvo la protección (ver saludProteccion).
 */
export async function revisarPermisos(
  agitarActivo: boolean,
  cortesDelSistema = 0,
): Promise<Record<IdPermiso, EstadoPermiso>> {
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
  const android = Platform.OS === "android";
  const bateria = !android || SensorSacudidas.ignoraOptimizacionBateria();
  const pantallaCompleta = !android || SensorSacudidas.puedePantallaCompleta();
  const conInicioAutomatico = android && SensorSacudidas.tieneAjusteInicioAutomatico();
  // La web muestra si el celular está listo para una emergencia
  void reportarPermisos({
    ubicacion: ubicacion.concedido === true,
    notificaciones: notificaciones.concedido === true,
    agitar: agitarActivo,
    bateria,
    pantallaCompleta,
    microfono: microfono.concedido === true,
    camara: camara.concedido === true,
  });
  return {
    agitar: { concedido: agitarActivo, puedePreguntar: true },
    ubicacion,
    notificaciones,
    bateria: { concedido: bateria, puedePreguntar: true },
    pantallaCompleta: { concedido: pantallaCompleta, puedePreguntar: true },
    // La marca no deja leerlo: si el teléfono ya cortó la protección, falta; si no, hay que revisarlo
    inicioAutomatico: {
      concedido: cortesDelSistema > 0 ? false : null,
      puedePreguntar: true,
      oculto: !conInicioAutomatico,
    },
    microfono,
    camara,
    contactos,
  };
}

/** Faltantes críticos (para el recordatorio al abrir la app). */
export function faltantesCriticos(estados: Record<IdPermiso, EstadoPermiso>): InfoPermiso[] {
  return PERMISOS.filter((p) => p.critico && estados[p.id].concedido === false && !estados[p.id].oculto);
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
      // Con el permiso recién dado, el celular ya puede recibir las alertas de sus contactos
      else await registrarPush();
      return;
    case "bateria":
      // Si no salió el diálogo del sistema se abrió la página de la app: se explica qué tocar
      if (!SensorSacudidas.pedirIgnorarOptimizacionBateria()) {
        Alert.alert(
          "Batería sin restricciones",
          "En la página de AlertaMujer que se abrió entra a \"Batería\" y elige \"Sin restricciones\" (en Samsung: Batería → Sin restricciones).",
        );
      }
      return;
    case "pantallaCompleta":
      SensorSacudidas.pedirPantallaCompleta();
      return;
    case "inicioAutomatico":
      if (!SensorSacudidas.abrirInicioAutomatico()) {
        Alert.alert(
          "Inicio automático",
          "En la página de AlertaMujer que se abrió busca \"Inicio automático\" o \"Batería\" y permite que la app se ejecute en segundo plano.",
        );
      }
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
