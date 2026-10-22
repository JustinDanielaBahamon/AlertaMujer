import React, { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

// Mismo morado que el splash nativo (app.json) para que el cambio no se note
export const BACKGROUND_COLOR = "#2B0C3B";
const GOLD = "#E9C46A";
const TITLE = "ALERTA MUJER";
const MOTTO = "SEGURIDAD PARA TODAS";

// Tamaño inicial del logo = tamaño de la pantera en el splash nativo (imageWidth 200 * 58%)
const INITIAL_LOGO = 116;

type Props = { onFinish: () => void };

/**
 * Animación de apertura: la pantera sube, las letras de ALERTA MUJER aparecen una a una,
 * luego el lema, y todo se desvanece para mostrar la app (que ya cargó por debajo).
 */
export default function AnimatedSplash({ onFinish }: Props) {
  const letters = useMemo(() => TITLE.split(""), []);
  const background = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoRise = useRef(new Animated.Value(0)).current;
  const brillo = useRef(new Animated.Value(0)).current;
  const motto = useRef(new Animated.Value(0)).current;
  const letterValues = useRef(letters.map(() => new Animated.Value(0))).current;

  const started = useRef(false);

  const start = async () => {
    // onLayout puede dispararse varias veces; la animación solo arranca una
    if (started.current) return;
    started.current = true;
    // El splash nativo se oculta justo cuando esta vista ya está dibujada encima
    await SplashScreen.hideAsync().catch(() => {});
    const reduce = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);

    if (reduce) {
      letterValues.forEach((v) => v.setValue(1));
      motto.setValue(1);
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(background, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(onFinish);
      return;
    }

    Animated.sequence([
      Animated.delay(150),
      // 1) La pantera crece un poco y sube para dejar espacio al nombre
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 1.35, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoRise, { toValue: -70, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(brillo, { toValue: 1, duration: 650, useNativeDriver: true }),
      ]),
      // 2) Letras una por una
      Animated.stagger(
        55,
        letterValues.map((v) =>
          Animated.timing(v, { toValue: 1, duration: 320, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true })
        )
      ),
      // 3) Lema
      Animated.timing(motto, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(550),
      // 4) Salida
      Animated.timing(background, { toValue: 0, duration: 380, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(onFinish);
  };

  useEffect(() => {
    // Por si algo falla, la app nunca se queda tapada
    const safe = setTimeout(onFinish, 6000);
    return () => clearTimeout(safe);
  }, [onFinish]);

  return (
    <Animated.View
      style={[styles.container, { opacity: background }]}
      onLayout={start}
      accessible
      accessibilityLabel="Alerta Mujer, seguridad para todas"
    >
      <Animated.View style={{ transform: [{ translateY: logoRise }, { scale: logoScale }] }}>
        <Animated.View style={[styles.halo, { opacity: brillo }]} />
        <Image source={require("../../../../assets/images/splash-logo.png")} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <View style={styles.row} importantForAccessibility="no-hide-descendants">
        {letters.map((letter, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.letter,
              letter === " " && styles.space,
              {
                opacity: letterValues[i],
                transform: [
                  { translateY: letterValues[i].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                  { scale: letterValues[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
                ],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>

      <Animated.View
        style={{
          opacity: motto,
          transform: [{ translateY: motto.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        }}
      >
        <View style={styles.line} />
        <Text style={styles.motto} importantForAccessibility="no">{MOTTO}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: BACKGROUND_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    alignSelf: "center",
    top: -INITIAL_LOGO * 0.15,
    width: INITIAL_LOGO * 1.3,
    height: INITIAL_LOGO * 1.3,
    borderRadius: INITIAL_LOGO,
    backgroundColor: "rgba(233, 196, 106, 0.10)",
  },
  logo: { width: INITIAL_LOGO, height: INITIAL_LOGO * 0.9 },
  row: { flexDirection: "row", marginTop: -20 },
  letter: {
    color: GOLD,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 3,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  space: { width: 14 },
  line: {
    alignSelf: "center",
    width: 64,
    height: 2,
    borderRadius: 1,
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: "rgba(233, 196, 106, 0.6)",
  },
  motto: { color: "#F3E6C4", fontSize: 13, fontWeight: "700", letterSpacing: 4, textAlign: "center" },
});
