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
    if (names?.includes("DrawerHome") && names?.includes("AddContact")) {
      return current as unknown as NavigationProp<MainStackParamList>;
    }
    current = current.getParent();
  }
  return null;
}

/** true mientras la usuaria está en el tutorial: ahí no se interrumpe con avisos ni permisos. */
export function isInTutorial(navigation: { isReady: () => boolean; getCurrentRoute: () => { name: string } | undefined }): boolean {
  return navigation.isReady() && (navigation.getCurrentRoute()?.name ?? "").startsWith("Tutorial");
}
