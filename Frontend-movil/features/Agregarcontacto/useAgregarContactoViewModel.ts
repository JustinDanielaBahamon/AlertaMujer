import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../src/navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useAgregarContactoViewModel() {
  const navigation = useNavigation<Nav>();
  const [nombre, setNombre] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [telefono, setTelefono] = useState("");

  const guardar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const cancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    nombre,
    setNombre,
    parentesco,
    setParentesco,
    telefono,
    setTelefono,
    guardar,
    cancelar,
  };
}
