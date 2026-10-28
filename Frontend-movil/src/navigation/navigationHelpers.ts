import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { MainStackParamList } from "./types";

/**
 * Finds the main stack navigator (DrawerHome, AddContact, etc.).
 * Useful when the screen is nested in Drawer + Tabs.
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

/** true while the user is in the tutorial: notices and permissions do not interrupt there. */
export function isInTutorial(navigation: { isReady: () => boolean; getCurrentRoute: () => { name: string } | undefined }): boolean {
  return navigation.isReady() && (navigation.getCurrentRoute()?.name ?? "").startsWith("Tutorial");
}
