import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { MainStackParamList } from "../../src/navigation/types";

export function useContactosTabViewModel() {
  const navigation = useNavigation();

  const irAgregarContacto = useCallback(() => {
    const stackNav = navigation.getParent()?.getParent();
    if (stackNav && "navigate" in stackNav) {
      (stackNav as { navigate: (name: keyof MainStackParamList) => void }).navigate(
        "AgregarContacto",
      );
      return;
    }
    (navigation as { navigate: (name: keyof MainStackParamList) => void }).navigate(
      "AgregarContacto",
    );
  }, [navigation]);

  return { irAgregarContacto };
}
