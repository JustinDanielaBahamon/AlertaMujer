import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useMetodosActivacion } from "../../contexts/MetodosActivacionContext";
import SensorSacudidas from "../../../modules/sensor-sacudidas";
import type { MainStackParamList } from "../../navigation/types";
import {
  alAbrirAlertaPorSacudida,
  alSacudirEnPantalla,
  detenerProteccion,
  iniciarProteccion,
} from "./servicioProteccion";

// Durante una alerta (o su cuenta regresiva) otra sacudida no hace nada
const PANTALLAS_DE_ALERTA = new Set(["Activacion", "AlertaActiva"]);

const CLAVE_BATERIA = "@alerta_mujer:bateria_preguntada";
const REPREGUNTAR_BATERIA_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * El acelerómetro no necesita permiso, pero el ahorro de batería de Android (y el de cada marca:
 * Infinix, Xiaomi, Samsung...) duerme la app con la pantalla apagada. Se pide que la deje correr
 * siempre; si la usuaria dice que no, se vuelve a preguntar a los 3 días.
 */
async function pedirSinAhorroDeBateria() {
  if (Platform.OS !== "android" || SensorSacudidas.ignoraOptimizacionBateria()) return;
  const ultima = Number((await AsyncStorage.getItem(CLAVE_BATERIA)) ?? 0);
  if (Date.now() - ultima < REPREGUNTAR_BATERIA_MS) return;
  await AsyncStorage.setItem(CLAVE_BATERIA, String(Date.now()));
  Alert.alert(
    "Agitar el teléfono",
    "Para que la alerta funcione con la app cerrada o la pantalla apagada, permite que AlertaMujer se ejecute siempre en segundo plano.",
    [
      { text: "Ahora no", style: "cancel" },
      { text: "Permitir", onPress: () => SensorSacudidas.pedirIgnorarOptimizacionBateria() },
    ],
  );
}

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
  // Valor del ajuste visto en esta sesión: si pasa de apagado a encendido, lo encendió la usuaria
  const ajusteAnterior = useRef<boolean | null>(null);

  useEffect(() => {
    const anterior = ajusteAnterior.current;
    ajusteAnterior.current = conSesion && cargado ? config.agitar : null;
    if (!encendida) {
      detenerProteccion().catch(() => {});
      return;
    }
    // Al abrir la app solo arranca si ya tiene los permisos; los pide si la usuaria la acaba de encender
    const loEncendioAhora = anterior === false;
    iniciarProteccion(loEncendioAhora)
      .then((estado) => {
        if (estado === "activa") {
          if (loEncendioAhora) pedirSinAhorroDeBateria().catch(() => {});
        } else if (estado === "sin_ubicacion") {
          // Al abrir la app no se insiste: el recordatorio de protección avisa lo que falta
          if (!loEncendioAhora) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
