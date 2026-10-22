import AsyncStorage from "@react-native-async-storage/async-storage";
import { isInTutorial } from "../../navigation/navigationHelpers";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useActivationMethods } from "../../contexts/MetodosActivacionContext";
import type { MainStackParamList } from "../../navigation/types";
import { missingCritical, checkPermissions } from "./permisos";
import { EXPLANATION, recentInterruptions } from "./saludProteccion";

const LAST_NOTICE_KEY = "@alerta_mujer:recordatorio_proteccion";
const REPEAT_EVERY_MS = 12 * 60 * 60 * 1000;
const OPEN_DELAY_MS = 3000;

/**
 * Al abrir la app con sesión, si falta algo crítico (agitar apagado, ubicación, notificaciones,
 * batería) se muestra un aviso con acceso a "Permisos y protección". Como mucho cada 12 h, para no
 * molestar. Tras reinstalar la app, "agitar" vuelve a estar apagado: este aviso lo recuerda.
 */
export function useProtectionReminder(
  navigation: NavigationContainerRefWithCurrent<MainStackParamList>,
  withSession: boolean,
): void {
  const { config, loaded } = useActivationMethods();
  const checked = useRef(false);

  useEffect(() => {
    if (!withSession) {
      checked.current = false;
      return undefined;
    }
    if (!loaded || checked.current) return undefined;
    checked.current = true;

    const timer = setTimeout(async () => {
      try {
        // Durante el tutorial no se interrumpe: ahí mismo se piden los permisos en orden
        if (isInTutorial(navigation)) return;
        const lastItem = Number((await AsyncStorage.getItem(LAST_NOTICE_KEY)) ?? 0);
        if (Date.now() - lastItem < REPEAT_EVERY_MS) return;
        // Cortes de la protección desde el último aviso (comprobados con los registros de Android)
        const cortes = config.agitar ? recentInterruptions().filter((c) => c.when > lastItem) : [];
        const missing = missingCritical(
          await checkPermissions(config.agitar, cortes.filter((c) => c.cause === "sistema").length),
        );
        if (missing.length === 0 && cortes.length === 0) return;
        await AsyncStorage.setItem(LAST_NOTICE_KEY, String(Date.now()));
        const parts = [
          cortes.length > 0
            ? `Tu protección se detuvo ${cortes.length === 1 ? "1 vez" : `${cortes.length} veces`}: ${EXPLANATION[cortes[0].cause].title.toLowerCase()}.`
            : null,
          missing.length > 0 ? `Para que tus alertas funcionen siempre, falta: ${missing.map((f) => f.title).join(", ")}.` : null,
        ].filter(Boolean);
        Alert.alert(
          cortes.length > 0 ? "Tu protección se detuvo" : "Tu protección está incompleta",
          parts.join("\n\n"),
          [
            { text: "Ahora no", style: "cancel" },
            { text: "Revisar", onPress: () => navigation.isReady() && navigation.navigate("Permissions") },
          ],
        );
      } catch (e) {
        console.warn("No se pudo revisar la protección:", e);
      }
    }, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
    // Solo una vez por sesión, cuando ya cargaron los ajustes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withSession, loaded]);
}
