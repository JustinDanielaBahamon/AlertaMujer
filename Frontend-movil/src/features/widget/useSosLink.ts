import { useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useActivationMethods } from "../../contexts/ActivationMethodsContext";
import type { MainStackParamList } from "../../navigation/types";
import { SOS_LINK } from "./WidgetSOS";

const ALERT_SCREENS = new Set(["Activation", "ActiveAlert"]);
const isSosLink = (url: string | null) => !!url && url.toLowerCase().startsWith(SOS_LINK);

/**
 * El widget abre alertamujer://sos: con sesión iniciada lleva a la cuenta regresiva de la alerta
 * (método "widget"). Si se tocó antes de iniciar sesión, se atiende al entrar.
 */
export function useSosLink(
  navigation: NavigationContainerRefWithCurrent<MainStackParamList>,
  withSession: boolean,
): void {
  const { config, loaded } = useActivationMethods();
  const pending = useRef(false);
  // Cambia con cada toque del widget para volver a correr el efecto que lo atiende
  const [toques, setToques] = useState(0);

  useEffect(() => {
    const receive = (url: string | null) => {
      if (!isSosLink(url)) return;
      pending.current = true;
      setToques((n) => n + 1);
    };
    Linking.getInitialURL().then(receive).catch(() => {});
    const sub = Linking.addEventListener("url", ({ url }) => receive(url));
    return () => sub.remove();
  }, []);

  // Se atiende en cuanto hay sesión y ajustes (el toque pudo llegar antes de iniciar sesión)
  useEffect(() => {
    if (!pending.current || !withSession || !loaded) return;
    pending.current = false;
    if (!config.widget) {
      Alert.alert(
        "Widget de alerta",
        "El widget está desactivado. Actívalo en Ajustes → Métodos de activación para enviar alertas desde la pantalla de inicio.",
      );
      return;
    }
    const ir = (attempts = 20) => {
      if (!navigation.isReady()) {
        if (attempts > 0) setTimeout(() => ir(attempts - 1), 300);
        return;
      }
      const current = navigation.getCurrentRoute()?.name;
      if (current && ALERT_SCREENS.has(current)) return;
      navigation.navigate("Activation", { method: "widget" });
    };
    ir();
  }, [toques, withSession, loaded, config.widget, navigation]);
}
