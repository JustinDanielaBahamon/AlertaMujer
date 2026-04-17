import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../src/navigation/types";
// Importación esencial para el video
import { useVideoPlayer } from 'expo-video';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function useBotonTutorialViewModel() {
  const navigation = useNavigation<Nav>();

  // --- Lógica del Video ---
  const videoSource = require("../../assets/imagesAlertaMujer/ScTutorial/boton.mp4");

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.play();
    p.muted = true;
  });

  // Retornamos el player para que la vista pueda usarlo
  return { 
    player 
  };
}
