import { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../src/navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useNotificacionTutorialViewModel() {
  const navigation = useNavigation<Nav>();

  const finalizarDemo = useCallback(() => {
    Alert.alert(
      "Modo Demo",
      "En la versión final, aquí se solicitarán permisos de notificación. Por ahora continuamos al home.",
      [
        {
          text: "Continuar",
          onPress: () => navigation.replace("DrawerHome"),
        },
      ],
    );
  }, [navigation]);

  const regresar = useCallback(() => {
    navigation.navigate("TutorialSeguridad");
  }, [navigation]);

  return { finalizarDemo, regresar };
}
