import { useVideoPlayer } from 'expo-video';

export function useBienvenidaTutorialViewModel() {
  const videoSource = require("../../assets/imagesAlertaMujer/ScTutorial/bienvenida.mp4");

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;      
    p.play();          
    p.muted = true;    
  });

  return { 
    player 
  };
}