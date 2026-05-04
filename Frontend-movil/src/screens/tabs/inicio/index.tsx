// src/screens/tabs/inicio/index.tsx
import {View, Text, TouchableOpacity, ActivityIndicator,Animated, Easing, useWindowDimensions, Image,
} from "react-native";
import { createStyles } from "./inicio.styles";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useInicioViewModel } from "../../../../features/inicio/useInicioViewModel";
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { useState, useRef, useEffect, useMemo } from "react";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";

export default function Inicio() {
  const vm = useInicioViewModel();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);

  const BUTTON_SIZE = width * 0.75;

  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive]       = useState(false);

  // ── Animaciones glow expansivo (pulseAnim eliminado) ──────────────────────
  const glow1Scale   = useRef(new Animated.Value(1)).current;
  const glow1Opacity = useRef(new Animated.Value(0.6)).current;
  const glow2Scale   = useRef(new Animated.Value(1)).current;
  const glow2Opacity = useRef(new Animated.Value(0.3)).current;
  const glow3Scale   = useRef(new Animated.Value(1)).current;
  const glow3Opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    const loopGlow1 = () => {
      glow1Scale.setValue(1);
      glow1Opacity.setValue(0.65);
      Animated.parallel([
        Animated.timing(glow1Scale,   { toValue: 1.28, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow1Opacity, { toValue: 0,    duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start(() => loopGlow1());
    };

    const loopGlow2 = () => {
      glow2Scale.setValue(1);
      glow2Opacity.setValue(0.45);
      Animated.parallel([
        Animated.timing(glow2Scale,   { toValue: 1.55, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow2Opacity, { toValue: 0,    duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start(() => loopGlow2());
    };

    const loopGlow3 = () => {
      glow3Scale.setValue(1);
      glow3Opacity.setValue(0.25);
      Animated.parallel([
        Animated.timing(glow3Scale,   { toValue: 1.85, duration: 2500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow3Opacity, { toValue: 0,    duration: 2500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start(() => loopGlow3());
    };

    loopGlow1();
    setTimeout(() => loopGlow2(), 600);
    setTimeout(() => loopGlow3(), 1200);
  }, []);

  // ── Navegación a mapa ─────────────────────────────────────────────────────
  const goToMap = () => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DrawerHome", {
      screen: "Inicio",
      params: { screen: "Mapa" },
    } as never);
  };

  // ── Permisos ──────────────────────────────────────────────────────────────
  const toggleCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") setCameraActive(prev => !prev);
  };

  const toggleMic = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status === "granted") setMicActive(prev => !prev);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}>

      {/* Ubicación */}
      <TouchableOpacity
        style={[styles.locationCard, { backgroundColor: theme.containerBackground, borderColor: theme.icono }]}
        onPress={goToMap}
        activeOpacity={0.8}
      >
        <MaterialIcons name="location-on" size={24} color={theme.icono} />
        <View style={styles.locationInfo}>
          <Text style={[styles.locationLabel, { color: theme.text }]}>Ubicación actual</Text>
          <Text style={[styles.locationValue, { color: theme.text }]} numberOfLines={1}>
            {vm.ubicacionNombre}
          </Text>
        </View>
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); vm.obtenerUbicacion(); }}
          disabled={vm.cargando}
        >
          {vm.cargando ? (
            <ActivityIndicator size="small" color={theme.icono} />
          ) : (
            <MaterialIcons name="refresh" size={24} color={theme.icono} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Indicadores cámara / micrófono — sin cápsula, solo dot + texto */}
      {/* Indicadores cámara / micrófono */}
      <View style={styles.indicatorsRow}>
        <TouchableOpacity style={styles.indicator} onPress={toggleCamera} activeOpacity={0.7}>
          <View style={[styles.dot, cameraActive ? { backgroundColor: theme.icono } : styles.dotRed]} />
          <Ionicons
            name="camera"
            size={20}
            color={cameraActive ? theme.icono : "#e74c3c"}
          />
          <Text style={[styles.indicatorText, { color: cameraActive ? theme.icono : "#e74c3c" }]}>
            Cámara
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.indicator} onPress={toggleMic} activeOpacity={0.7}>
          <View style={[styles.dot, micActive ? { backgroundColor: theme.icono } : styles.dotRed]} />
          <Ionicons
            name="mic"
            size={20}
            color={micActive ? theme.icono : "#e74c3c"}
          />
          <Text style={[styles.indicatorText, { color: micActive ? theme.icono : "#e74c3c" }]}>
            Micrófono
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botón central con glow expansivo */}
      <View style={[styles.centerSection, { paddingVertical: BUTTON_SIZE * 0.45 }]}>

        {/* Anillo glow 3 — exterior */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            backgroundColor: theme.icono + "18",
            transform: [{ scale: glow3Scale }],
            opacity: glow3Opacity,
          }}
        />

        {/* Anillo glow 2 — medio */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            backgroundColor: theme.icono + "28",
            transform: [{ scale: glow2Scale }],
            opacity: glow2Opacity,
          }}
        />

        {/* Anillo glow 1 — interior */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            backgroundColor: theme.icono + "45",
            transform: [{ scale: glow1Scale }],
            opacity: glow1Opacity,
          }}
        />

        {/* Botón principal — imagen estática, sin pulso */}
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={vm.onPressInBoton}
          onPressOut={vm.onPressOutBoton}
          onPress={vm.activarAlerta}
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: theme.icono,
            shadowOffset: { width: 0, height: vm.pressed ? 2 : 10 },
            shadowOpacity: vm.pressed ? 0.2 : 0.6,
            shadowRadius: vm.pressed ? 4 : 20,
            elevation: vm.pressed ? 4 : 18,
            transform: [{ scale: vm.pressed ? 0.92 : 1 }],
            opacity: vm.pressed ? 0.85 : 1,
          }}
        >
          <Image
            source={theme.imagenBoton}
            style={{
              width: BUTTON_SIZE * 1.1,
              height: BUTTON_SIZE * 1.1,
              resizeMode: "contain",
            }}
          />
        </TouchableOpacity>

      </View>

      {/* Texto de instrucción */}
      <Text style={[styles.instructionText, { color: theme.text }]}>
        Presiona en caso de{"\n"}Emergencia
      </Text>

    </View>
  );
}