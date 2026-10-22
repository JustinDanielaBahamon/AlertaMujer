import { useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useMetodosActivacion } from "../../contexts/MetodosActivacionContext";
import type { MainStackParamList } from "../../navigation/types";
import { ENLACE_SOS } from "./WidgetSOS";

const PANTALLAS_DE_ALERTA = new Set(["Activacion", "AlertaActiva"]);
const esEnlaceSOS = (url: string | null) => !!url && url.toLowerCase().startsWith(ENLACE_SOS);

/**
 * El widget abre alertamujer://sos: con sesión iniciada lleva a la cuenta regresiva de la alerta
 * (método "widget"). Si se tocó antes de iniciar sesión, se atiende al entrar.
 */
export function useEnlaceSOS(
  navegacion: NavigationContainerRefWithCurrent<MainStackParamList>,
  conSesion: boolean,
): void {
  const { config, cargado } = useMetodosActivacion();
  const pendiente = useRef(false);
  // Cambia con cada toque del widget para volver a correr el efecto que lo atiende
  const [toques, setToques] = useState(0);

  useEffect(() => {
    const recibir = (url: string | null) => {
      if (!esEnlaceSOS(url)) return;
      pendiente.current = true;
      setToques((n) => n + 1);
    };
    Linking.getInitialURL().then(recibir).catch(() => {});
    const sub = Linking.addEventListener("url", ({ url }) => recibir(url));
    return () => sub.remove();
  }, []);

  // Se atiende en cuanto hay sesión y ajustes (el toque pudo llegar antes de iniciar sesión)
  useEffect(() => {
    if (!pendiente.current || !conSesion || !cargado) return;
    pendiente.current = false;
    if (!config.widget) {
      Alert.alert(
        "Widget de alerta",
        "El widget está desactivado. Actívalo en Ajustes → Métodos de activación para enviar alertas desde la pantalla de inicio.",
      );
      return;
    }
    const ir = (intentos = 20) => {
      if (!navegacion.isReady()) {
        if (intentos > 0) setTimeout(() => ir(intentos - 1), 300);
        return;
      }
      const actual = navegacion.getCurrentRoute()?.name;
      if (actual && PANTALLAS_DE_ALERTA.has(actual)) return;
      navegacion.navigate("Activacion", { metodo: "widget" });
    };
    ir();
  }, [toques, conSesion, cargado, config.widget, navegacion]);
}
