import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Vibration } from "react-native";
import { useEvidence } from "../../../contexts/EvidenciaContext";
import { useNotifications } from "../../../contexts/NotificacionesContext";
import type { MainStackParamList } from "../../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type ActivationRoute = RouteProp<MainStackParamList, "Activacion">;

export function useActivationViewModel() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ActivationRoute>();
  // Si viene un contacto, la alerta es solo para esa persona (no para todos)
  const contact = route.params?.contacto;
  const method = route.params?.metodo;
  const { config } = useNotifications();
  const { recordVideo, recordAudio } = useEvidence();
  const [counter, setCounter] = useState(5);

  // Evita navegar dos veces (por ejemplo, si se toca "Activar ahora" justo cuando el conteo llega a 0)
  const alreadyNavigatedRef = useRef(false);

  const goToActiveAlert = useCallback(() => {
    if (alreadyNavigatedRef.current) return;
    alreadyNavigatedRef.current = true;
    navigation.replace("AlertaActiva", contact || method ? { contacto: contact, metodo: method } : undefined);
  }, [navigation, contact, method]);

  useEffect(() => {
    if (counter > 0) {
      // Una vibración corta por cada segundo del conteo (5, 4, 3, 2, 1)
      if (config.vibracion) Vibration.vibrate(200);
      const timer = setTimeout(() => setCounter((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    goToActiveAlert();
    return undefined;
  }, [counter, goToActiveAlert, config.vibracion]);

  // Salta el conteo y va directo a la pantalla de alerta activa
  const activateNow = useCallback(() => {
    goToActiveAlert();
  }, [goToActiveAlert]);

  const cancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return { counter: counter, cancel: cancel, activateNow: activateNow, recordVideo: recordVideo, recordAudio: recordAudio };
}