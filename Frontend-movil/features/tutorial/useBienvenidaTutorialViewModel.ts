import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../src/navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useBienvenidaTutorialViewModel() {
  const navigation = useNavigation<Nav>();

  const continuar = useCallback(() => {
    navigation.navigate("TutorialBoton");
  }, [navigation]);

  return { continuar };
}
