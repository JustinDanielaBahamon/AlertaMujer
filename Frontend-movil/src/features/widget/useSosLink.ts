import { useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useActivationMethods } from "../../contexts/ActivationMethodsContext";
import type { MainStackParamList } from "../../navigation/types";
import { SOS_LINK } from "./WidgetSOS";

const ALERT_SCREENS = new Set(["Activation", "ActiveAlert"]);
const isSosLink = (url: string | null) => !!url && url.toLowerCase().startsWith(SOS_LINK);

/**
 * The widget opens alertamujer://sos: when signed in it leads to the alert countdown
 * ("widget" method). If it was tapped before signing in, it is handled on entering.
 */
export function useSosLink(
  navigation: NavigationContainerRefWithCurrent<MainStackParamList>,
  withSession: boolean,
): void {
  const { config, loaded, change } = useActivationMethods();
  const pending = useRef(false);
  // Changes with each widget tap to run the effect that handles it again
  const [toques, setToques] = useState(0);

  useEffect(() => {
    const receive = (url: string | null) => {
      if (!isSosLink(url)) return;
      pending.current = true;
      setToques((n) => n + 1);
    };
    Linking.getInitialURL().then(receive).catch(() => {});
    const sub = Linking.addEventListener("url", ({ url }) => receive(url));
    return () => sub.remove();
  }, []);

  // Handled as soon as there is a session and settings (the tap may have come before signing in)
  useEffect(() => {
    if (!pending.current || !withSession || !loaded) return;
    pending.current = false;
    // She put the widget on her home screen and tapped it: that is the intention, even if the method
    // was off in Settings (it happens when the widget is added from the launcher). Before, the app
    // only showed a notice and the countdown never opened.
    if (!config.widget) change("widget", true);
    const ir = (attempts = 20) => {
      if (!navigation.isReady()) {
        if (attempts > 0) setTimeout(() => ir(attempts - 1), 300);
        return;
      }
      const current = navigation.getCurrentRoute()?.name;
      if (current && ALERT_SCREENS.has(current)) return;
      navigation.navigate("Activation", { method: "widget" });
    };
    ir();
  }, [toques, withSession, loaded, config.widget, change, navigation]);
}
