import { Linking, Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp } from "@react-native-firebase/app";
import { getMessaging, getToken, onTokenRefresh } from "@react-native-firebase/messaging";
import { notificationsPermission } from "./safePermissions";
import api from "./api";
import { getOrCreateDevice } from "./devices.service";
import { createSosChannel } from "../notifications/sosAlarm";

const FULL_SCREEN_NOTICE_KEY = "@alerta_mujer:aviso_pantalla_completa";

/** false if the APK was built without google-services.json (no push). */
export const pushAvailable = (): boolean => Constants.expoConfig?.extra?.pushConfigurado === true;

let cancelRefresh: (() => void) | null = null;

/**
 * After signing in: asks for the notifications permission, creates the alarm channel and registers the
 * phone FCM token in the backend to receive alerts from the people who have her as a
 * contact. It never throws: if something fails, the app keeps working without push.
 */
export async function registrarPush(requestPermission = false): Promise<void> {
  if (Platform.OS !== "android" || !pushAvailable()) return;
  try {
    if (!(await notificationsPermission(requestPermission))) return;
    await createSosChannel();

    const device = await getOrCreateDevice();
    const messaging = getMessaging(getApp());
    const send = (token: string) =>
      api.put(`/api/devices/${device.id}/push-token`, { token }).catch(() => undefined);

    await send(await getToken(messaging));
    cancelRefresh?.();
    cancelRefresh = onTokenRefresh(messaging, send);
  } catch (error) {
    console.warn("[push] No se pudo registrar el token:", error);
  }
}

/**
 * Android 14+: the full-screen alarm needs the user to allow it in Settings.
 * Offered only once; returns true if the notice should be shown.
 */
export async function shouldOfferFullScreen(): Promise<boolean> {
  if (Platform.OS !== "android" || Number(Platform.Version) < 34 || !pushAvailable()) return false;
  try {
    return (await AsyncStorage.getItem(FULL_SCREEN_NOTICE_KEY)) === null;
  } catch {
    return false;
  }
}

export async function markFullScreenNoticeShown(): Promise<void> {
  await AsyncStorage.setItem(FULL_SCREEN_NOTICE_KEY, "1").catch(() => undefined);
}

export async function openFullScreenSetting(): Promise<void> {
  const packageName = Constants.expoConfig?.android?.package ?? "com.alertamujer.app";
  try {
    await Linking.sendIntent("android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT", [
      { key: "android.provider.extra.APP_PACKAGE", value: packageName },
    ]);
  } catch {
    await Linking.openSettings();
  }
}
