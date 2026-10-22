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
 *
 * Orden de uso: lo que arranca solo al abrir la app (protección, push, ubicación diaria) solo
 * CONSULTA (pedir = false). Los permisos se piden en el tutorial, en "Permisos y protección" o
 * cuando la usuaria toca algo que los necesita, nunca de sorpresa al entrar.
 */

let cola: Promise<unknown> = Promise.resolve();

/** Ejecuta la petición de permiso cuando termine la anterior (nunca dos a la vez). */
export function inPermissionQueue<T>(ask: () => Promise<T>): Promise<T> {
  const result = cola.then(ask, ask);
  cola = result.catch(() => undefined);
  return result;
}

/** true si la app tiene (o acaba de recibir) permiso de ubicación mientras se usa. */
export async function locationPermission(ask = true): Promise<boolean> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) return true;
  if (!ask) return false;
  const request = await inPermissionQueue(() => Location.requestForegroundPermissionsAsync());
  return request.granted;
}

/** true si la app puede mostrar notificaciones (las pide si hace falta y pedir = true). */
export async function notificationsPermission(ask = true): Promise<boolean> {
  const current = await notifee.getNotificationSettings();
  if (current.authorizationStatus === AuthorizationStatus.AUTHORIZED) return true;
  if (!ask) return false;
  const request = await inPermissionQueue(() => notifee.requestPermission());
  return request.authorizationStatus === AuthorizationStatus.AUTHORIZED;
}

/**
 * Ubicación sin que Android muestre su aviso de "activa la ubicación del dispositivo": si el GPS
 * está apagado devuelve null. Para lo que corre solo (ubicación diaria, alerta en segundo plano).
 */
export async function locationWithoutNotices(
  precision: Location.Accuracy = Location.Accuracy.Balanced,
): Promise<Location.LocationObject | null> {
  if (!(await Location.hasServicesEnabledAsync().catch(() => false))) return null;
  return Location.getCurrentPositionAsync({ accuracy: precision, mayShowUserSettingsDialog: false });
}
