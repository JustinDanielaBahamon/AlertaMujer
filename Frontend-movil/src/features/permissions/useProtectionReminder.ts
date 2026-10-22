import AsyncStorage from "@react-native-async-storage/async-storage";
import { isInTutorial } from "../../navigation/navigationHelpers";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useActivationMethods } from "../../contexts/ActivationMethodsContext";
import type { MainStackParamList } from "../../navigation/types";
import { missingCritical, checkPermissions } from "./permissions";
import { EXPLANATION, recentInterruptions } from "./protectionHealth";

const LAST_NOTICE_KEY = "@alerta_mujer:recordatorio_proteccion";
const REPEAT_EVERY_MS = 12 * 60 * 60 * 1000;
const OPEN_DELAY_MS = 3000;

/**
 * When the app opens with a session, if something critical is missing (shake off, location, notifications,
 * battery) a notice with access to "Permissions and protection" is shown. At most every 12 h, so it does not
 * nag. After reinstalling the app, "shake" is off again: this notice reminds her.
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
        // It does not interrupt during the tutorial: the permissions are asked there in order
        if (isInTutorial(navigation)) return;
        const lastItem = Number((await AsyncStorage.getItem(LAST_NOTICE_KEY)) ?? 0);
        if (Date.now() - lastItem < REPEAT_EVERY_MS) return;
        // Protection cuts since the last notice (checked with the Android records)
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
    // Only once per session, once the settings have loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withSession, loaded]);
}
