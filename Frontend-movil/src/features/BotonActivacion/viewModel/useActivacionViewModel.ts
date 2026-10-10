import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Vibration } from "react-native";
import { useEvidencia } from "../../../contexts/EvidenciaContext";
import { useNotificaciones } from "../../../contexts/NotificacionesContext";
import type { MainStackParamList } from "../../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useActivacionViewModel() {
  const navigation = useNavigation<Nav>();
  const { config } = useNotificaciones();
  const { grabarVideo, grabarAudio } = useEvidencia();
  const [contador, setContador] = useState(5);

  // Evita navegar dos veces (por ejemplo, si se toca "Activar ahora" justo cuando el conteo llega a 0)
  const yaNavegoRef = useRef(false);

  const irAAlertaActiva = useCallback(() => {
    if (yaNavegoRef.current) return;
    yaNavegoRef.current = true;
    navigation.replace("AlertaActiva");
  }, [navigation]);

  useEffect(() => {
    if (contador > 0) {
      // Una vibración corta por cada segundo del conteo (5, 4, 3, 2, 1)
      if (config.vibracion) Vibration.vibrate(200);
      const timer = setTimeout(() => setContador((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    irAAlertaActiva();
    return undefined;
  }, [contador, irAAlertaActiva, config.vibracion]);

  // Salta el conteo y va directo a la pantalla de alerta activa
  const activarAhora = useCallback(() => {
    irAAlertaActiva();
  }, [irAAlertaActiva]);

  const cancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return { contador, cancelar, activarAhora, grabarVideo, grabarAudio };
}