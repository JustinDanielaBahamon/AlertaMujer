import { View, Text, TouchableOpacity, ActivityIndicator, Image, Animated } from "react-native";
import { styles } from "./inicio.styles";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useInicioViewModel } from "../../../../features/inicio/useInicioViewModel";
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { useState, useRef } from "react";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Inicio() {
  const vm = useInicioViewModel();
  const { theme } = useTheme();
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
  <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}>

    {/* Ubicación */}
    <View style={[
      styles.containerUbicacion,
      {
        backgroundColor: theme.containerBackground,
        borderColor: theme.icono,
      }
    ]}>
      <MaterialIcons name="location-on" size={24} color={theme.icono} />
      <View style={styles.infoUbicacion}>
        <Text style={[styles.tituloUbicacion, { color: theme.text }]}>
          Ubicación actual
        </Text>
        <Text style={[styles.textoUbicacion, { color: theme.text }]} numberOfLines={1}>
          {vm.ubicacionNombre}
        </Text>
      </View>
      <TouchableOpacity onPress={vm.obtenerUbicacion} disabled={vm.cargando}>
        {vm.cargando ? (
          <ActivityIndicator size="small" color={theme.icono} />
        ) : (
          <MaterialIcons name="refresh" size={24} color={theme.icono} />
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

    {/* Botón + texto juntos, sin flex */}
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
        <Image
          source={theme.imagenBoton}
          style={styles.imagen}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* ✅ texto pegado al botón dentro del mismo View */}
      <Text style={[styles.texto, { color: theme.text }]}>
        Presiona en caso de{"\n"}Emergencia
      </Text>
    </View>

  </View>
  
);
}