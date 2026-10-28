import notifee, { AuthorizationStatus } from "@notifee/react-native";
import * as Location from "expo-location";

/**
 * Ask for permissions without freezing the app.
 *
 * The React Native activity keeps a SINGLE permission "listener": if two libraries ask for a
 * permission at the same time (e.g. Notifee notifications and Expo location when the app opens), the
 * answer of one is lost. On top of that, Expo queues all its requests behind the one that did not
 * answer: from then on no Expo request answers again (shake protection did not start,
 * the alert got no location and home said "Getting location..." forever).
 *
 * That is why: 1) if the permission is already granted it is not requested (checking does not go through the
 * activity) and
 * 2) the requests that must be made go one at a time.
 *
 * Usage order: what starts by itself when the app opens (protection, push, daily location) only
 * CHECKS (ask = false). Permissions are requested in the tutorial, in "Permissions and protection" or
 * when the user taps something that needs them, never by surprise on entering.
 */

let cola: Promise<unknown> = Promise.resolve();

/** Runs the permission request when the previous one ends (never two at once). */
export function inPermissionQueue<T>(ask: () => Promise<T>): Promise<T> {
  const result = cola.then(ask, ask);
  cola = result.catch(() => undefined);
  return result;
}

/** true if the app has (or just received) location permission while in use. */
export async function locationPermission(ask = true): Promise<boolean> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) return true;
  if (!ask) return false;
  const request = await inPermissionQueue(() => Location.requestForegroundPermissionsAsync());
  return request.granted;
}

/** true if the app can show notifications (asks for them if needed and ask = true). */
export async function notificationsPermission(ask = true): Promise<boolean> {
  const current = await notifee.getNotificationSettings();
  if (current.authorizationStatus === AuthorizationStatus.AUTHORIZED) return true;
  if (!ask) return false;
  const request = await inPermissionQueue(() => notifee.requestPermission());
  return request.authorizationStatus === AuthorizationStatus.AUTHORIZED;
}

/**
 * Location without Android showing its "turn on device location" prompt: if the GPS
 * is off it returns null. For what runs on its own (daily location, background alert).
 */
export async function locationWithoutNotices(
  precision: Location.Accuracy = Location.Accuracy.Balanced,
): Promise<Location.LocationObject | null> {
  if (!(await Location.hasServicesEnabledAsync().catch(() => false))) return null;
  return Location.getCurrentPositionAsync({ accuracy: precision, mayShowUserSettingsDialog: false });
}
