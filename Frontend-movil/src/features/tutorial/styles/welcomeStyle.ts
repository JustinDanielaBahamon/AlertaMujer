import { StyleSheet } from "react-native";
import { COLORS } from "./universalStyle";

const welcomeStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    
  },
  page: {
    flex: 1,
    alignItems: 'center',
    
  },
  bgGradient: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  bgCircle1: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: COLORS.purpleLight, top: -80, left: -60, opacity: 0.6,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: COLORS.purpleSoft, top: 60, right: -50, opacity: 0.4,
  },
  bgCircle3: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: COLORS.purplePale, bottom: 200, left: -30, opacity: 0.15,
  },
  lottieSection: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: '100%',
    height: 220,
  },
});