import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useActivationMethods } from "../../contexts/ActivationMethodsContext";
import ShakeSensor from "../../../modules/shake-sensor";
import type { MainStackParamList } from "../../navigation/types";
import { getAlert } from "../../services/alerts.service";
import {
  onShakeAlertOpen,
  onShakeOnScreen,
  stopProtection,
  startProtection,
} from "./protectionService";

// During an alert (or its countdown) another shake does nothing
const ALERT_SCREENS = new Set(["Activation", "ActiveAlert"]);

const BATTERY_KEY = "@alerta_mujer:bateria_preguntada";
const BATTERY_REASK_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * The accelerometer needs no permission, but Android battery saving (and each brand's:
 * Infinix, Xiaomi, Samsung...) puts the app to sleep with the screen off. We ask to let it always
 * run; if the user says no, we ask again after 3 days.
 */
async function askNoBatterySaver(name: string) {
  if (Platform.OS !== "android" || ShakeSensor.ignoresBatteryOptimization()) return;
  const latest = Number((await AsyncStorage.getItem(BATTERY_KEY)) ?? 0);
  if (Date.now() - latest < BATTERY_REASK_MS) return;
  await AsyncStorage.setItem(BATTERY_KEY, String(Date.now()));
  Alert.alert(
    name,
    "Para que la alerta funcione con la app cerrada o la pantalla apagada, permite que AlertaMujer se ejecute siempre en segundo plano.",
    [
      { text: "Ahora no", style: "cancel" },
      { text: "Permitir", onPress: () => ShakeSensor.requestIgnoreBatteryOptimization() },
    ],
  );
}

/**
 * Turns the "Active protection" service on or off depending on the methods the user enabled
 * (shaking the phone and/or the power button) and connects its events with navigation.
 */
/** Offline we cannot know: the alert is opened (better than hiding an alert that is still on). */
async function alertStillActive(alertId: number): Promise<boolean> {
  try {
    return (await getAlert(alertId)).status === "active";
  } catch {
    return true;
  }
}

export function useShakeProtection(
  navigation: NavigationContainerRefWithCurrent<MainStackParamList>,
  withSession: boolean,
): void {
  const { config, loaded, change } = useActivationMethods();
  const ready = withSession && loaded;
  const shake = ready && config.agitar;
  const button = ready && config.encendido;
  const turnedOn = shake || button;
  // Setting values seen in this session: if one goes from off to on, the user turned it on
  const previousSetting = useRef<{ shake: boolean; powerButton: boolean } | null>(null);

  useEffect(() => {
    const previous = previousSetting.current;
    previousSetting.current = ready ? { shake: config.agitar, powerButton: config.encendido } : null;
    if (!turnedOn) {
      stopProtection().catch(() => {});
      return;
    }
    // When the app opens it only starts if it already has the permissions; it asks for them if the user just turned a method on
    const shakeTurnedOn = previous !== null && !previous.shake && shake;
    const buttonTurnedOn = previous !== null && !previous.powerButton && button;
    const turnedOnNow = shakeTurnedOn || buttonTurnedOn;
    const name = buttonTurnedOn && !shakeTurnedOn ? "Botón de encendido" : "Agitar el teléfono";
    startProtection(turnedOnNow, { shake, powerButton: button })
      .then((status) => {
        if (status === "activa") {
          if (turnedOnNow) askNoBatterySaver(name).catch(() => {});
        } else if (status === "sin_ubicacion") {
          // When the app opens we do not insist: the protection reminder tells what is missing
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
    // A notice left in the tray after the alert ended must not reopen it
    const allowOpen = onShakeAlertOpen(async (alertId) => {
      if (!(await alertStillActive(alertId))) return;
      ir(() => navigation.navigate("ActiveAlert", { alertId: alertId, method: "agitar" }));
    });
    return () => {
      dropShake();
      allowOpen();
    };
  }, [withSession, navigation]);
}
