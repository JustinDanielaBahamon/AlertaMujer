import notifee, { AuthorizationStatus } from "@notifee/react-native";
import * as Location from "expo-location";

/**
 * Pedir permisos sin que la app se quede trabada.
 *
 * La actividad de React Native guarda UN solo "escuchador" de permisos: si dos librerías piden un
 * permiso a la vez (p. ej. Notifee las notificaciones y Expo la ubicación al abrir la app), la
 * respuesta de una se pierde. Expo, además, encola todas sus peticiones detrás de la que no
 * respondió: desde ahí ninguna petición de Expo vuelve a responder (no arrancaba la protección por
 * sacudida, la alerta no obtenía ubicación y el inicio decía "Obteniendo ubicación..." para siempre).
 *
 * Por eso: 1) si el permiso ya está concedido no se pide (consultar no pasa por la actividad) y
 * 2) las peticiones que sí haya que hacer van de una en una.
 */

let cola: Promise<unknown> = Promise.resolve();

/** Ejecuta la petición de permiso cuando termine la anterior (nunca dos a la vez). */
export function enColaDePermisos<T>(pedir: () => Promise<T>): Promise<T> {
  const resultado = cola.then(pedir, pedir);
  cola = resultado.catch(() => undefined);
  return resultado;
}

/** true si la app tiene (o acaba de recibir) permiso de ubicación mientras se usa. */
export async function permisoUbicacion(): Promise<boolean> {
  const actual = await Location.getForegroundPermissionsAsync();
  if (actual.granted) return true;
  const pedido = await enColaDePermisos(() => Location.requestForegroundPermissionsAsync());
  return pedido.granted;
}

/** true si la app puede mostrar notificaciones (las pide si hace falta). */
export async function permisoNotificaciones(): Promise<boolean> {
  const actual = await notifee.getNotificationSettings();
  if (actual.authorizationStatus === AuthorizationStatus.AUTHORIZED) return true;
  const pedido = await enColaDePermisos(() => notifee.requestPermission());
  return pedido.authorizationStatus === AuthorizationStatus.AUTHORIZED;
}
