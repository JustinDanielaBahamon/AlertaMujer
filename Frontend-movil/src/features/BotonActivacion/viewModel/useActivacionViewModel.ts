import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useActivacionViewModel() {
  const navigation = useNavigation<Nav>();
  const [contador, setContador] = useState(3);

  useEffect(() => {
    if (contador > 0) {
      const timer = setTimeout(() => setContador((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [contador]);

  const cancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return { contador, cancelar };
}
