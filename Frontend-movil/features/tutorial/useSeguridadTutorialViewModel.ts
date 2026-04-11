import { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import type { MainStackParamList } from "../../src/navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useSeguridadTutorialViewModel() {
  const navigation = useNavigation<Nav>();

  const solicitarPermisosCamaraAudio = useCallback(async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: audioStatus } = await Audio.requestPermissionsAsync();

    if (cameraStatus === "granted" && audioStatus === "granted") {
      navigation.navigate("TutorialNotificacion");
      return;
    }

    Alert.alert(
      "Permisos necesarios",
      "Para tu protección, necesitamos acceder a la cámara y micrófono. Esto permite generar evidencia en video si te encuentras en peligro.",
      [
        {
          text: "Reintentar",
          onPress: () => {
            void (async () => {
              const { status: c } = await Camera.requestCameraPermissionsAsync();
              const { status: a } = await Audio.requestPermissionsAsync();
              if (c === "granted" && a === "granted") {
                navigation.navigate("TutorialNotificacion");
              }
            })();
          },
        },
        { text: "Cancelar", style: "cancel" },
      ],
    );
  }, [navigation]);

  const regresar = useCallback(() => {
    navigation.navigate("TutorialContacto");
  }, [navigation]);

  return { solicitarPermisosCamaraAudio, regresar };
}
