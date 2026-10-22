import notifee, { AndroidImportance } from "@notifee/react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, AppState, Platform, Vibration } from "react-native";
import ShakeSensor from "../../../../modules/shake-sensor";
import { useLocale } from "../../../contexts/LocaleContext";
import { useNotifications } from "../../../contexts/NotificationsContext";
import { bigStyle } from "../../../notifications/notificationStyle";
import { notificationsPermission } from "../../../services/safePermissions";
import { registrarPush } from "../../../services/push.service";

const TEST_CHANNEL = "avisos_prueba";

/**
 * Pantalla Notificaciones: las alertas de emergencia no se pueden silenciar, así que aquí solo se
 * revisa que el celular las deje llegar (permiso y pantalla completa) y se ajusta la vibración.
 */
export function useNotificationsViewModel() {
  const navigation = useNavigation();
  const { t } = useLocale();
  const { config, update } = useNotifications();
  const [permission, setPermission] = useState<boolean | null>(null);
  const [fullScreen, setFullScreen] = useState<boolean | null>(null);

  const refresh = useCallback(() => {
    notificationsPermission(false).then(setPermission).catch(() => setPermission(false));
    setFullScreen(Platform.OS !== "android" || ShakeSensor.canUseFullScreen());
  }, []);

  // Al entrar y al volver de los ajustes de Android
  useFocusEffect(refresh);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  // Pide el permiso; si Android ya no deja preguntar, abre los ajustes de notificaciones de la app
  const grantPermission = useCallback(async () => {
    if (await notificationsPermission()) registrarPush().catch(() => {});
    else await notifee.openNotificationSettings();
    refresh();
  }, [refresh]);

  const enableFullScreen = useCallback(() => {
    ShakeSensor.requestFullScreen();
  }, []);

  // Al activar la vibración vibra una vez para que la usuaria la sienta
  const setVibration = (value: boolean) => {
    update({ vibracion: value });
    if (value) Vibration.vibrate(200);
  };

  const test = useCallback(async () => {
    try {
      if (!(await notificationsPermission())) throw new Error("sin permiso");
      await notifee.createChannel({
        id: TEST_CHANNEL,
        name: "Notificación de prueba",
        importance: AndroidImportance.HIGH,
        vibration: config.vibracion,
      });
      await notifee.displayNotification({
        title: t.notificaciones.probar_titulo,
        body: t.notificaciones.probar_cuerpo,
        android: {
          channelId: TEST_CHANNEL,
          ...bigStyle(t.notificaciones.probar_cuerpo),
          pressAction: { id: "default", launchActivity: "default" },
        },
      });
    } catch {
      Alert.alert(t.notificaciones.titulo_header, t.notificaciones.probar_error);
    }
    refresh();
  }, [config.vibracion, t, refresh]);

  const openAdvanced = useCallback(() => {
    notifee.openNotificationSettings().catch(() => {});
  }, []);

  return {
    config,
    permission: permission,
    fullScreen: fullScreen,
    goBack: navigation.goBack,
    grantPermission: grantPermission,
    enableFullScreen: enableFullScreen,
    setVibration: setVibration,
    test: test,
    openAdvanced: openAdvanced,
  };
}
