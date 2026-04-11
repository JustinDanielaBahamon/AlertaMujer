import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as SMS from "expo-sms";
import type { MainStackParamList } from "../../src/navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useMensajesTutorialViewModel() {
  const navigation = useNavigation<Nav>();
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoPermiso, setTipoPermiso] = useState<"sms" | "llamada">("sms");

  const iniciarFlujoPermisos = useCallback(() => {
    setTipoPermiso("sms");
    setModalVisible(true);
  }, []);

  const confirmarModal = useCallback(async () => {
    if (tipoPermiso === "sms") {
      try {
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
          await SMS.sendSMSAsync(
            ["3001234567"],
            "🚨 ALERTA: Necesito ayuda. Ubicación: https://www.google.com/maps",
          );
        }
      } catch (e) {
        console.log("Error SMS:", e);
      }
      setTipoPermiso("llamada");
    } else {
      setModalVisible(false);
      navigation.navigate("TutorialUbicacion");
    }
  }, [tipoPermiso, navigation]);

  const cancelarModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const regresar = useCallback(() => {
    navigation.navigate("TutorialBoton");
  }, [navigation]);

  return {
    modalVisible,
    tipoPermiso,
    iniciarFlujoPermisos,
    confirmarModal,
    cancelarModal,
    regresar,
  };
}
