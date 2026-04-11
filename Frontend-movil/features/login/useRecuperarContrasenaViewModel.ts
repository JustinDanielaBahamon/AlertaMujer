import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../src/navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList, "RecuperarContrasena">;

export function useRecuperarContrasenaViewModel() {
  const navigation = useNavigation<Nav>();

  const volver = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return { volver };
}
