import { View, Text, TouchableOpacity, ActivityIndicator, Image, Animated, ImageSourcePropType } from "react-native";
import { styles } from "./inicio.styles";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useInicioViewModel } from "../../../../features/inicio/useInicioViewModel";
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { AppMode } from "../../../../src/contexts/ThemeContext";
import { useState, useRef } from "react";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Temporal: mismo botón para todos los temas ───────────────────────────────
// Cuando tengas los botones, reemplaza cada require con su imagen correspondiente
const botonActual = require("../../../../assets/imagesAlertaMujer/ScInicio/boton2.png");

const BOTONES_ALERTA: Record<AppMode, ImageSourcePropType> = {
  light:   botonActual,
  dark:    botonActual,   // → reemplazar por boton-dark.png
  rosa:    botonActual,   // → reemplazar por boton-rosa.png
  vino:    botonActual,   // → reemplazar por boton-vino.png
  fucsia:  botonActual,   // → reemplazar por boton-fucsia.png
  magenta: botonActual,   // → reemplazar por boton-magenta.png
};

export default function Inicio() {
  const vm = useInicioViewModel();
  const { theme } = useTheme(); // ✅ accedemos al tema actual
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [microfonoActivo, setMicrofonoActivo] = useState(false);
  const insets = useSafeAreaInsets();

  const scaleInicio    = useRef(new Animated.Value(1)).current;
  const scaleMapa      = useRef(new Animated.Value(1)).current;
  const scaleAlerta    = useRef(new Animated.Value(1)).current;
  const scaleContactos = useRef(new Animated.Value(1)).current;
  const scaleHistorial = useRef(new Animated.Value(1)).current;

  const animarBoton = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1,   duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const toggleCamara = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") setCamaraActiva(prev => !prev);
  };

  const toggleMicrofono = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status === "granted") setMicrofonoActivo(prev => !prev);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>

      <View style={{ flex: 1 }}>

        {/* Ubicación */}
        <View style={styles.containerUbicacion}>
          <MaterialIcons name="location-on" size={24} color="#7B2CBF" />
          <View style={styles.infoUbicacion}>
            <Text style={styles.tituloUbicacion}>Ubicación actual</Text>
            <Text style={styles.textoUbicacion} numberOfLines={1}>
              {vm.ubicacionNombre}
            </Text>
          </View>
          <TouchableOpacity onPress={vm.obtenerUbicacion} disabled={vm.cargando}>
            {vm.cargando ? (
              <ActivityIndicator size="small" color="#7B2CBF" />
            ) : (
              <MaterialIcons name="refresh" size={24} color="#7B2CBF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Indicadores */}
        <View style={styles.indicadoresContainer}>
          <TouchableOpacity
            style={[styles.indicador, camaraActiva ? styles.indicadorActivo : styles.indicadorInactivo]}
            onPress={toggleCamara}
          >
            <View style={[styles.luz, camaraActiva ? styles.luzVerde : styles.luzRoja]} />
            <Ionicons name="camera" size={20} color={camaraActiva ? "#2ecc71" : "#e74c3c"} />
            <Text style={[styles.indicadorTexto, camaraActiva ? styles.textoVerde : styles.textoRojo]}>
              Cámara
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.indicador, microfonoActivo ? styles.indicadorActivo : styles.indicadorInactivo]}
            onPress={toggleMicrofono}
          >
            <View style={[styles.luz, microfonoActivo ? styles.luzVerde : styles.luzRoja]} />
            <Ionicons name="mic" size={20} color={microfonoActivo ? "#2ecc71" : "#e74c3c"} />
            <Text style={[styles.indicadorTexto, microfonoActivo ? styles.textoVerde : styles.textoRojo]}>
              Micrófono
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón central */}
        <View style={styles.centerSection}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={vm.onPressInBoton}
            onPressOut={vm.onPressOutBoton}
            onPress={vm.activarAlerta}
            style={[
              styles.botonAlerta,
              {
                transform: [{ scale: vm.pressed ? 0.92 : 1 }],
                opacity: vm.pressed ? 0.85 : 1,
                shadowOffset: { width: 0, height: vm.pressed ? 2 : 10 },
                shadowOpacity: vm.pressed ? 0.2 : 0.5,
                elevation: vm.pressed ? 4 : 12,
              },
            ]}
          >
            {/* ✅ Botón cambia automáticamente con el tema */}
            <Image
              source={BOTONES_ALERTA[theme.mode]}
              style={styles.imagen}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

      </View>

      <Text style={[styles.texto, { marginBottom: insets.bottom + 20 }]}>
        Presiona en caso de{"\n"}Emergencia
      </Text>

    </View>
  );
}