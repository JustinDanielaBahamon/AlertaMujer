import notifee, { AndroidImportance } from "@notifee/react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, AppState, Platform, Vibration } from "react-native";
import SensorSacudidas from "../../../../modules/sensor-sacudidas";
import { useLocale } from "../../../contexts/LocaleContext";
import { useNotificaciones } from "../../../contexts/NotificacionesContext";
import { estiloGrande } from "../../../notifications/estiloNotificacion";
import { permisoNotificaciones } from "../../../services/permisosSeguros";
import { registrarPush } from "../../../services/push.service";

const CANAL_PRUEBA = "avisos_prueba";

/**
 * Pantalla Notificaciones: las alertas de emergencia no se pueden silenciar, así que aquí solo se
 * revisa que el celular las deje llegar (permiso y pantalla completa) y se ajusta la vibración.
 */
export function useNotificacionesViewModel() {
  const navigation = useNavigation();
  const { t } = useLocale();
  const { config, actualizar } = useNotificaciones();
  const [permiso, setPermiso] = useState<boolean | null>(null);
  const [pantallaCompleta, setPantallaCompleta] = useState<boolean | null>(null);

  const refrescar = useCallback(() => {
    permisoNotificaciones(false).then(setPermiso).catch(() => setPermiso(false));
    setPantallaCompleta(Platform.OS !== "android" || SensorSacudidas.puedePantallaCompleta());
  }, []);

  // Al entrar y al volver de los ajustes de Android
  useFocusEffect(refrescar);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active") refrescar();
    });
    return () => sub.remove();
  }, [refrescar]);

  // Pide el permiso; si Android ya no deja preguntar, abre los ajustes de notificaciones de la app
  const activarPermiso = useCallback(async () => {
    if (await permisoNotificaciones()) registrarPush().catch(() => {});
    else await notifee.openNotificationSettings();
    refrescar();
  }, [refrescar]);

  const activarPantallaCompleta = useCallback(() => {
    SensorSacudidas.pedirPantallaCompleta();
  }, []);

  // Al activar la vibración vibra una vez para que la usuaria la sienta
  const cambiarVibracion = (valor: boolean) => {
    actualizar({ vibracion: valor });
    if (valor) Vibration.vibrate(200);
  };

  const probar = useCallback(async () => {
    try {
      if (!(await permisoNotificaciones())) throw new Error("sin permiso");
      await notifee.createChannel({
        id: CANAL_PRUEBA,
        name: "Notificación de prueba",
        importance: AndroidImportance.HIGH,
        vibration: config.vibracion,
      });
      await notifee.displayNotification({
        title: t.notificaciones.probar_titulo,
        body: t.notificaciones.probar_cuerpo,
        android: {
          channelId: CANAL_PRUEBA,
          ...estiloGrande(t.notificaciones.probar_cuerpo),
          pressAction: { id: "default", launchActivity: "default" },
        },
      });
    } catch {
      Alert.alert(t.notificaciones.titulo_header, t.notificaciones.probar_error);
    }
    refrescar();
  }, [config.vibracion, t, refrescar]);

  const abrirAvanzado = useCallback(() => {
    notifee.openNotificationSettings().catch(() => {});
  }, []);

  return {
    config,
    permiso,
    pantallaCompleta,
    volver: navigation.goBack,
    activarPermiso,
    activarPantallaCompleta,
    cambiarVibracion,
    probar,
    abrirAvanzado,
  };
}
