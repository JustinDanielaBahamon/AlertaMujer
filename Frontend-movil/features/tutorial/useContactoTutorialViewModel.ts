import { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import type { MainStackParamList } from "../../src/navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useContactoTutorialViewModel() {
  const navigation = useNavigation<Nav>();

  const solicitarPermisoContactos = useCallback(async () => {
    const { status } = await Contacts.requestPermissionsAsync();

    if (status === "granted") {
      navigation.navigate("TutorialSeguridad");
    } else {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tus contactos para que puedas elegirlos como personas de confianza en caso de emergencia.",
        [{ text: "Entendido" }],
      );
    }
  }, [navigation]);

  const regresar = useCallback(() => {
    navigation.navigate("TutorialUbicacion");
  }, [navigation]);

  return { solicitarPermisoContactos, regresar };
}
