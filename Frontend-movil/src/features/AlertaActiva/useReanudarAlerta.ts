import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useEffect } from "react";
import { AppState } from "react-native";
import type { MainStackParamList } from "../../navigation/types";
import { alertaActivaPropia, getMisAlertas } from "../../services/alerts.service";

// En estas pantallas la alerta ya se está mostrando (o creando): no se navega encima
const PANTALLAS_DE_ALERTA = new Set(["Activacion", "AlertaActiva"]);

/**
 * Si la usuaria tiene una alerta activa (p. ej. cerró la app desde "Recientes" con la alerta en
 * curso), al abrir la app o volver a ella se muestra de nuevo la pantalla de alerta activa, que
 * retoma esa misma alerta y vuelve a enviar la ubicación. Antes la alerta seguía activa en el
 * servidor pero la app no lo sabía y dejaba de enviar la ubicación.
 */
export function useReanudarAlerta(
  navegacion: NavigationContainerRefWithCurrent<MainStackParamList>,
  conSesion: boolean,
): void {
  useEffect(() => {
    if (!conSesion) return undefined;
    let vivo = true;

    const mostrar = (alertaId: number, intentos = 20) => {
      if (!vivo) return;
      if (!navegacion.isReady()) {
        if (intentos > 0) setTimeout(() => mostrar(alertaId, intentos - 1), 300);
        return;
      }
      const actual = navegacion.getCurrentRoute()?.name;
      if (actual && PANTALLAS_DE_ALERTA.has(actual)) return;
      navegacion.navigate("AlertaActiva", { alertaId });
    };

    const revisar = async () => {
      try {
        const activa = alertaActivaPropia(await getMisAlertas());
        if (activa) mostrar(activa.id);
      } catch {
        // Sin conexión: se vuelve a revisar al volver a la app
      }
    };

    revisar();
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active") revisar();
    });
    return () => {
      vivo = false;
      sub.remove();
    };
  }, [conSesion, navegacion]);
}
