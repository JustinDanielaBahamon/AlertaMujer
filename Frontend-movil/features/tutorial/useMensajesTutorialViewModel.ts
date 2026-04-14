import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as SMS from "expo-sms";
import * as Linking from 'expo-linking'; // Importamos Linking para llamadas
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
          // Aquí abres el SMS (en el tutorial es una prueba)
          await SMS.sendSMSAsync(
            ["3001234567"],
            "🚨 ALERTA: Necesito ayuda. Ubicación: http://maps.google.com/..."
          );
        }
      } catch (e) {
        console.log("Error SMS:", e);
      }
      // CAMBIO AUTOMÁTICO AL SIGUIENTE PERMISO
      setTipoPermiso("llamada");
    } else {
      // LÓGICA DE LLAMADA
      try {
        // Esto abre el marcador del teléfono con el número
        Linking.openURL('tel:3001234567'); 
      } catch (e) {
        console.log("Error Llamada:", e);
      }
      
      // FINALIZAR Y NAVEGAR
      setModalVisible(false);
      // navigation.navigate("TutorialUbicacion"); // Descomenta cuando quieras pasar a la siguiente
    }
  }, [tipoPermiso, navigation]);

  const cancelarModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  return {
    modalVisible,
    tipoPermiso,
    iniciarFlujoPermisos,
    confirmarModal,
    cancelarModal,
  };
}