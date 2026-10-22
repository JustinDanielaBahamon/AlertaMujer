import React, { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

// Same purple as the native splash (app.json) so the switch is not noticed
export const BACKGROUND_COLOR = "#2B0C3B";
const GOLD = "#E9C46A";
const TITLE = "ALERTA MUJER";
const MOTTO = "SEGURIDAD PARA TODAS";

// Initial logo size = size of the panther in the native splash (imageWidth 200 * 58%)
const INITIAL_LOGO = 116;

type Props = { onFinish: () => void };

/**
 * Opening animation: the panther rises, the letters of ALERTA MUJER appear one by one,
 * then the motto, and everything fades out to show the app (already loaded underneath).
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
    // onLayout may fire several times; the animation starts only once
    if (started.current) return;
    started.current = true;
    // The native splash hides right when this view is already drawn on top
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
      // 1) The panther grows a little and rises to make room for the name
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 1.35, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoRise, { toValue: -70, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(brillo, { toValue: 1, duration: 650, useNativeDriver: true }),
      ]),
      // 2) Letters one by one
      Animated.stagger(
        55,
        letterValues.map((v) =>
          Animated.timing(v, { toValue: 1, duration: 320, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true })
        )
      ),
      // 3) Motto
      Animated.timing(motto, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(550),
      // 4) Exit
      Animated.timing(background, { toValue: 0, duration: 380, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(onFinish);
  };

  useEffect(() => {
    // In case something fails, the app is never left covered
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
