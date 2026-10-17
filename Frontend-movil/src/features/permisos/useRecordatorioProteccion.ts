import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useMetodosActivacion } from "../../contexts/MetodosActivacionContext";
import type { MainStackParamList } from "../../navigation/types";
import { faltantesCriticos, revisarPermisos } from "./permisos";
import { EXPLICACION, interrupcionesRecientes } from "./saludProteccion";

const CLAVE_ULTIMO_AVISO = "@alerta_mujer:recordatorio_proteccion";
const REPETIR_CADA_MS = 12 * 60 * 60 * 1000;
const ESPERA_AL_ABRIR_MS = 3000;

/**
 * Al abrir la app con sesión, si falta algo crítico (agitar apagado, ubicación, notificaciones,
 * batería) se muestra un aviso con acceso a "Permisos y protección". Como mucho cada 12 h, para no
 * molestar. Tras reinstalar la app, "agitar" vuelve a estar apagado: este aviso lo recuerda.
 */
export function useRecordatorioProteccion(
  navegacion: NavigationContainerRefWithCurrent<MainStackParamList>,
  conSesion: boolean,
): void {
  const { config, cargado } = useMetodosActivacion();
  const revisado = useRef(false);

  useEffect(() => {
    if (!conSesion) {
      revisado.current = false;
      return undefined;
    }
    if (!cargado || revisado.current) return undefined;
    revisado.current = true;

    const temporizador = setTimeout(async () => {
      try {
        const ultimo = Number((await AsyncStorage.getItem(CLAVE_ULTIMO_AVISO)) ?? 0);
        if (Date.now() - ultimo < REPETIR_CADA_MS) return;
        // Cortes de la protección desde el último aviso (comprobados con los registros de Android)
        const cortes = config.agitar ? interrupcionesRecientes().filter((c) => c.cuando > ultimo) : [];
        const faltan = faltantesCriticos(
          await revisarPermisos(config.agitar, cortes.filter((c) => c.causa === "sistema").length),
        );
        if (faltan.length === 0 && cortes.length === 0) return;
        await AsyncStorage.setItem(CLAVE_ULTIMO_AVISO, String(Date.now()));
        const partes = [
          cortes.length > 0
            ? `Tu protección se detuvo ${cortes.length === 1 ? "1 vez" : `${cortes.length} veces`}: ${EXPLICACION[cortes[0].causa].titulo.toLowerCase()}.`
            : null,
          faltan.length > 0 ? `Para que tus alertas funcionen siempre, falta: ${faltan.map((f) => f.titulo).join(", ")}.` : null,
        ].filter(Boolean);
        Alert.alert(
          cortes.length > 0 ? "Tu protección se detuvo" : "Tu protección está incompleta",
          partes.join("\n\n"),
          [
            { text: "Ahora no", style: "cancel" },
            { text: "Revisar", onPress: () => navegacion.isReady() && navegacion.navigate("Permisos") },
          ],
        );
      } catch (e) {
        console.warn("No se pudo revisar la protección:", e);
      }
    }, ESPERA_AL_ABRIR_MS);
    return () => clearTimeout(temporizador);
    // Solo una vez por sesión, cuando ya cargaron los ajustes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conSesion, cargado]);
}
