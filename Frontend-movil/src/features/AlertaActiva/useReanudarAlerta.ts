import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useEffect } from "react";
import { AppState } from "react-native";
import type { MainStackParamList } from "../../navigation/types";
import { ownActiveAlert, getMyAlerts } from "../../services/alerts.service";

// En estas pantallas la alerta ya se está mostrando (o creando): no se navega encima
const ALERT_SCREENS = new Set(["Activation", "ActiveAlert"]);

/**
 * Si la usuaria tiene una alerta activa (p. ej. cerró la app desde "Recientes" con la alerta en
 * curso), al abrir la app o volver a ella se muestra de nuevo la pantalla de alerta activa, que
 * retoma esa misma alerta y vuelve a enviar la ubicación. Antes la alerta seguía activa en el
 * servidor pero la app no lo sabía y dejaba de enviar la ubicación.
 */
export function useResumeAlert(
  navigation: NavigationContainerRefWithCurrent<MainStackParamList>,
  withSession: boolean,
): void {
  useEffect(() => {
    if (!withSession) return undefined;
    let alive = true;

    const show = (alertId: number, attempts = 20) => {
      if (!alive) return;
      if (!navigation.isReady()) {
        if (attempts > 0) setTimeout(() => show(alertId, attempts - 1), 300);
        return;
      }
      const current = navigation.getCurrentRoute()?.name;
      if (current && ALERT_SCREENS.has(current)) return;
      navigation.navigate("ActiveAlert", { alertId: alertId });
    };

    const check = async () => {
      try {
        const active = ownActiveAlert(await getMyAlerts());
        if (active) show(active.id);
      } catch {
        // Sin conexión: se vuelve a revisar al volver a la app
      }
    };

    check();
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") check();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, [withSession, navigation]);
}
