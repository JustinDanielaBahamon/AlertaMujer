import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { MainStackParamList } from "./types";

/**
 * Busca el navegador del stack principal (DrawerHome, AgregarContacto, etc.).
 * Util cuando la pantalla esta anidada en Drawer + Tabs.
 */
export function getMainStackNavigation(
  navigation: NavigationProp<ParamListBase>,
): NavigationProp<MainStackParamList> | null {
  let current: NavigationProp<ParamListBase> | undefined = navigation;
  for (let depth = 0; depth < 10 && current; depth++) {
    const state = current.getState();
    const names = state?.routeNames;
    if (names?.includes("DrawerHome") && names?.includes("AgregarContacto")) {
      return current as unknown as NavigationProp<MainStackParamList>;
    }
    current = current.getParent();
  }
  return null;
}
