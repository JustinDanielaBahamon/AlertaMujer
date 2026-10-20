import { Linking, Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp } from "@react-native-firebase/app";
import { getMessaging, getToken, onTokenRefresh } from "@react-native-firebase/messaging";
import { permisoNotificaciones } from "./permisosSeguros";
import api from "./api";
import { getOrCreateDevice } from "./devices.service";
import { crearCanalSos } from "../notifications/alarmaSos";

const CLAVE_AVISO_PANTALLA_COMPLETA = "@alerta_mujer:aviso_pantalla_completa";

/** false si el APK se compiló sin google-services.json (no hay push). */
export const pushDisponible = (): boolean => Constants.expoConfig?.extra?.pushConfigurado === true;

let cancelarRefresco: (() => void) | null = null;

/**
 * Tras iniciar sesión: pide permiso de notificaciones, crea el canal de la alarma y registra el
 * token FCM del teléfono en el backend para recibir alertas de las personas que lo tienen como
 * contacto. Nunca lanza: si algo falla, la app sigue funcionando sin push.
 */
export async function registrarPush(pedirPermiso = false): Promise<void> {
  if (Platform.OS !== "android" || !pushDisponible()) return;
  try {
    if (!(await permisoNotificaciones(pedirPermiso))) return;
    await crearCanalSos();

    const device = await getOrCreateDevice();
    const messaging = getMessaging(getApp());
    const enviar = (token: string) =>
      api.put(`/api/devices/${device.id}/push-token`, { token }).catch(() => undefined);

    await enviar(await getToken(messaging));
    cancelarRefresco?.();
    cancelarRefresco = onTokenRefresh(messaging, enviar);
  } catch (error) {
    console.warn("[push] No se pudo registrar el token:", error);
  }
}

/**
 * Android 14+: la alarma a pantalla completa necesita que la usuaria la permita en Ajustes.
 * Se ofrece una sola vez; devuelve true si conviene mostrar el aviso.
 */
export async function debeOfrecerPantallaCompleta(): Promise<boolean> {
  if (Platform.OS !== "android" || Number(Platform.Version) < 34 || !pushDisponible()) return false;
  try {
    return (await AsyncStorage.getItem(CLAVE_AVISO_PANTALLA_COMPLETA)) === null;
  } catch {
    return false;
  }
}

export async function marcarAvisoPantallaCompleta(): Promise<void> {
  await AsyncStorage.setItem(CLAVE_AVISO_PANTALLA_COMPLETA, "1").catch(() => undefined);
}

export async function abrirAjustePantallaCompleta(): Promise<void> {
  const paquete = Constants.expoConfig?.android?.package ?? "com.alertamujer.app";
  try {
    await Linking.sendIntent("android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT", [
      { key: "android.provider.extra.APP_PACKAGE", value: paquete },
    ]);
  } catch {
    await Linking.openSettings();
  }
}
