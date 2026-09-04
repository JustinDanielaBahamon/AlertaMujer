import { useCallback, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

// Tiempo total de la cuenta regresiva en segundos. 182s = 3:02, coincidiendo con el diseno de referencia.
const INITIAL_SECONDS = 182;

export function useAlertaActivaViewModel() {
  const navigation = useNavigation<Nav>();

  // Generico useState<number>: TypeScript garantiza que este estado solo puede contener un numero.
  const [secondsLeft, setSecondsLeft] = useState<number>(INITIAL_SECONDS);

  // Efecto de cuenta regresiva: se ejecuta cada segundo y limpia su propio temporizador.
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Valor derivado (no es un estado): se recalcula en cada render a partir de secondsLeft.
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${String(seconds).padStart(2, "0")}`;

  // Se ejecuta cuando el usuario presiona "Estoy bien".
  const marcarEstoyBien = useCallback(() => {
    // TODO: llamar aqui a la capa de alertas/servicios para cerrar la alerta activa en el backend.
    navigation.replace("DrawerHome");
  }, [navigation]);

  // Abre el marcador del telefono con el 911 ya preparado.
  const llamarEmergencias = useCallback(() => {
    const url = Platform.OS === "android" ? "tel:911" : "telprompt:911";
    Linking.openURL(url).catch(() => {
      // Ignorar silenciosamente si el dispositivo no puede realizar llamadas.
    });
  }, []);

  return {
    formattedTime,
    marcarEstoyBien,
    llamarEmergencias,
  };
}