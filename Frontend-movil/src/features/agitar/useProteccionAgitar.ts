import { useEffect } from "react";
import { Alert } from "react-native";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useMetodosActivacion } from "../../contexts/MetodosActivacionContext";
import type { MainStackParamList } from "../../navigation/types";
import {
  alAbrirAlertaPorSacudida,
  alSacudirEnPantalla,
  detenerProteccion,
  iniciarProteccion,
} from "./servicioProteccion";

// Durante una alerta (o su cuenta regresiva) otra sacudida no hace nada
const PANTALLAS_DE_ALERTA = new Set(["Activacion", "AlertaActiva"]);

/**
 * Enciende o apaga el servicio de "agitar el teléfono" según el ajuste de la usuaria y conecta
 * sus eventos con la navegación.
 */
export function useProteccionAgitar(
  navegacion: NavigationContainerRefWithCurrent<MainStackParamList>,
  conSesion: boolean,
): void {
  const { config, cargado, cambiar } = useMetodosActivacion();
  const encendida = conSesion && cargado && config.agitar;

  useEffect(() => {
    if (!encendida) {
      detenerProteccion().catch(() => {});
      return;
    }
    iniciarProteccion()
      .then((estado) => {
        if (estado === "sin_ubicacion") {
          cambiar("agitar", false);
          Alert.alert(
            "Agitar el teléfono",
            "Para enviar tu ubicación cuando agites el teléfono, AlertaMujer necesita el permiso de ubicación. Actívalo e intenta de nuevo.",
          );
        } else if (estado === "sin_sensor") {
          cambiar("agitar", false);
          Alert.alert("Agitar el teléfono", "Este teléfono no tiene acelerómetro disponible.");
        }
      })
      .catch((e) => console.warn("No se pudo iniciar la protección por sacudida:", e));
  }, [encendida, cambiar]);

  useEffect(() => {
    if (!conSesion) return undefined;

    const ir = (accion: () => void, intentos = 20) => {
      if (navegacion.isReady()) accion();
      else if (intentos > 0) setTimeout(() => ir(accion, intentos - 1), 300);
    };

    const dejarSacudida = alSacudirEnPantalla(() => {
      const actual = navegacion.isReady() ? navegacion.getCurrentRoute()?.name : undefined;
      if (actual && PANTALLAS_DE_ALERTA.has(actual)) return;
      ir(() => navegacion.navigate("Activacion", { metodo: "agitar" }));
    });
    const dejarAbrir = alAbrirAlertaPorSacudida((alertaId) =>
      ir(() => navegacion.navigate("AlertaActiva", { alertaId, metodo: "agitar" })),
    );
    return () => {
      dejarSacudida();
      dejarAbrir();
    };
  }, [conSesion, navegacion]);
}
