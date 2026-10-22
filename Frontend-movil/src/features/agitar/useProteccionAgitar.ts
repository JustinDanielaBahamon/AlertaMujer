import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useActivationMethods } from "../../contexts/MetodosActivacionContext";
import SensorSacudidas from "../../../modules/sensor-sacudidas";
import type { MainStackParamList } from "../../navigation/types";
import {
  onShakeAlertOpen,
  onShakeOnScreen,
  stopProtection,
  startProtection,
} from "./servicioProteccion";

// Durante una alerta (o su cuenta regresiva) otra sacudida no hace nada
const ALERT_SCREENS = new Set(["Activation", "ActiveAlert"]);

const BATTERY_KEY = "@alerta_mujer:bateria_preguntada";
const BATTERY_REASK_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * El acelerómetro no necesita permiso, pero el ahorro de batería de Android (y el de cada marca:
 * Infinix, Xiaomi, Samsung...) duerme la app con la pantalla apagada. Se pide que la deje correr
 * siempre; si la usuaria dice que no, se vuelve a preguntar a los 3 días.
 */
async function askNoBatterySaver(name: string) {
  if (Platform.OS !== "android" || SensorSacudidas.ignoraOptimizacionBateria()) return;
  const latest = Number((await AsyncStorage.getItem(BATTERY_KEY)) ?? 0);
  if (Date.now() - latest < BATTERY_REASK_MS) return;
  await AsyncStorage.setItem(BATTERY_KEY, String(Date.now()));
  Alert.alert(
    name,
    "Para que la alerta funcione con la app cerrada o la pantalla apagada, permite que AlertaMujer se ejecute siempre en segundo plano.",
    [
      { text: "Ahora no", style: "cancel" },
      { text: "Permitir", onPress: () => SensorSacudidas.pedirIgnorarOptimizacionBateria() },
    ],
  );
}

/**
 * Enciende o apaga el servicio "Protección activa" según los métodos que activó la usuaria
 * (agitar el teléfono y/o botón de encendido) y conecta sus eventos con la navegación.
 */
export function useShakeProtection(
  navigation: NavigationContainerRefWithCurrent<MainStackParamList>,
  withSession: boolean,
): void {
  const { config, loaded, change } = useActivationMethods();
  const ready = withSession && loaded;
  const shake = ready && config.agitar;
  const button = ready && config.encendido;
  const turnedOn = shake || button;
  // Valores del ajuste vistos en esta sesión: si uno pasa de apagado a encendido, lo encendió la usuaria
  const previousSetting = useRef<{ shake: boolean; powerButton: boolean } | null>(null);

  useEffect(() => {
    const previous = previousSetting.current;
    previousSetting.current = ready ? { shake: config.agitar, powerButton: config.encendido } : null;
    if (!turnedOn) {
      stopProtection().catch(() => {});
      return;
    }
    // Al abrir la app solo arranca si ya tiene los permisos; los pide si la usuaria acaba de encender un método
    const shakeTurnedOn = previous !== null && !previous.shake && shake;
    const buttonTurnedOn = previous !== null && !previous.powerButton && button;
    const turnedOnNow = shakeTurnedOn || buttonTurnedOn;
    const name = buttonTurnedOn && !shakeTurnedOn ? "Botón de encendido" : "Agitar el teléfono";
    startProtection(turnedOnNow, { shake, powerButton: button })
      .then((status) => {
        if (status === "activa") {
          if (turnedOnNow) askNoBatterySaver(name).catch(() => {});
        } else if (status === "sin_ubicacion") {
          // Al abrir la app no se insiste: el recordatorio de protección avisa lo que falta
          if (!turnedOnNow) return;
          if (shakeTurnedOn) change("agitar", false);
          if (buttonTurnedOn) change("encendido", false);
          Alert.alert(
            name,
            "Para enviar tu ubicación con la alerta, AlertaMujer necesita el permiso de ubicación. Actívalo e intenta de nuevo.",
          );
        } else if (status === "sin_sensor") {
          change("agitar", false);
          Alert.alert("Agitar el teléfono", "Este teléfono no tiene acelerómetro disponible.");
        }
      })
      .catch((e) => console.warn("No se pudo iniciar la protección:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shake, button, change]);

  useEffect(() => {
    if (!withSession) return undefined;

    const ir = (action: () => void, attempts = 20) => {
      if (navigation.isReady()) action();
      else if (attempts > 0) setTimeout(() => ir(action, attempts - 1), 300);
    };

    const dropShake = onShakeOnScreen((method) => {
      const current = navigation.isReady() ? navigation.getCurrentRoute()?.name : undefined;
      if (current && ALERT_SCREENS.has(current)) return;
      ir(() => navigation.navigate("Activation", { method: method }));
    });
    const allowOpen = onShakeAlertOpen((alertId) =>
      ir(() => navigation.navigate("ActiveAlert", { alertId: alertId, method: "agitar" })),
    );
    return () => {
      dropShake();
      allowOpen();
    };
  }, [withSession, navigation]);
}
