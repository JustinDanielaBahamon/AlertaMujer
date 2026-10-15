import React, { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

// Mismo morado que el splash nativo (app.json) para que el cambio no se note
export const COLOR_FONDO = "#2B0C3B";
const DORADO = "#E9C46A";
const TITULO = "ALERTA MUJER";
const LEMA = "SEGURIDAD PARA TODAS";

// Tamaño inicial del logo = tamaño de la pantera en el splash nativo (imageWidth 200 * 58%)
const LOGO_INICIAL = 116;

type Props = { onTerminar: () => void };

/**
 * Animación de apertura: la pantera sube, las letras de ALERTA MUJER aparecen una a una,
 * luego el lema, y todo se desvanece para mostrar la app (que ya cargó por debajo).
 */
export default function SplashAnimado({ onTerminar }: Props) {
  const letras = useMemo(() => TITULO.split(""), []);
  const fondo = useRef(new Animated.Value(1)).current;
  const logoEscala = useRef(new Animated.Value(1)).current;
  const logoSubida = useRef(new Animated.Value(0)).current;
  const brillo = useRef(new Animated.Value(0)).current;
  const lema = useRef(new Animated.Value(0)).current;
  const valoresLetras = useRef(letras.map(() => new Animated.Value(0))).current;

  const iniciada = useRef(false);

  const iniciar = async () => {
    // onLayout puede dispararse varias veces; la animación solo arranca una
    if (iniciada.current) return;
    iniciada.current = true;
    // El splash nativo se oculta justo cuando esta vista ya está dibujada encima
    await SplashScreen.hideAsync().catch(() => {});
    const reducir = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);

    if (reducir) {
      valoresLetras.forEach((v) => v.setValue(1));
      lema.setValue(1);
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(fondo, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(onTerminar);
      return;
    }

    Animated.sequence([
      Animated.delay(150),
      // 1) La pantera crece un poco y sube para dejar espacio al nombre
      Animated.parallel([
        Animated.timing(logoEscala, { toValue: 1.35, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoSubida, { toValue: -70, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(brillo, { toValue: 1, duration: 650, useNativeDriver: true }),
      ]),
      // 2) Letras una por una
      Animated.stagger(
        55,
        valoresLetras.map((v) =>
          Animated.timing(v, { toValue: 1, duration: 320, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true })
        )
      ),
      // 3) Lema
      Animated.timing(lema, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(550),
      // 4) Salida
      Animated.timing(fondo, { toValue: 0, duration: 380, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(onTerminar);
  };

  useEffect(() => {
    // Por si algo falla, la app nunca se queda tapada
    const seguro = setTimeout(onTerminar, 6000);
    return () => clearTimeout(seguro);
  }, [onTerminar]);

  return (
    <Animated.View
      style={[styles.contenedor, { opacity: fondo }]}
      onLayout={iniciar}
      accessible
      accessibilityLabel="Alerta Mujer, seguridad para todas"
    >
      <Animated.View style={{ transform: [{ translateY: logoSubida }, { scale: logoEscala }] }}>
        <Animated.View style={[styles.halo, { opacity: brillo }]} />
        <Image source={require("../../../../assets/images/splash-logo.png")} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <View style={styles.fila} importantForAccessibility="no-hide-descendants">
        {letras.map((letra, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.letra,
              letra === " " && styles.espacio,
              {
                opacity: valoresLetras[i],
                transform: [
                  { translateY: valoresLetras[i].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                  { scale: valoresLetras[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
                ],
              },
            ]}
          >
            {letra}
          </Animated.Text>
        ))}
      </View>

      <Animated.View
        style={{
          opacity: lema,
          transform: [{ translateY: lema.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        }}
      >
        <View style={styles.linea} />
        <Text style={styles.lema} importantForAccessibility="no">{LEMA}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: COLOR_FONDO,
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    alignSelf: "center",
    top: -LOGO_INICIAL * 0.15,
    width: LOGO_INICIAL * 1.3,
    height: LOGO_INICIAL * 1.3,
    borderRadius: LOGO_INICIAL,
    backgroundColor: "rgba(233, 196, 106, 0.10)",
  },
  logo: { width: LOGO_INICIAL, height: LOGO_INICIAL * 0.9 },
  fila: { flexDirection: "row", marginTop: -20 },
  letra: {
    color: DORADO,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 3,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  espacio: { width: 14 },
  linea: {
    alignSelf: "center",
    width: 64,
    height: 2,
    borderRadius: 1,
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: "rgba(233, 196, 106, 0.6)",
  },
  lema: { color: "#F3E6C4", fontSize: 13, fontWeight: "700", letterSpacing: 4, textAlign: "center" },
});
