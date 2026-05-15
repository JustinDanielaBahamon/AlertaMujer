
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import { useEffect, useMemo, useRef, useState } from "react";
import {ActivityIndicator,Animated, Easing,Image,Text, TouchableOpacity,useWindowDimensions,View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useInicioViewModel } from "../viewModel/useInicioViewModel";
import { useTheme } from "../../../../src/contexts/ThemeContext";
import type { Alerta, EstadoAlerta } from "../../../features/historial/models/Alerta";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import { createStyles } from "../styles/inicio.styles";

//  Mock de alertas (igual al historial) 
const mockAlerts: Alerta[] = [
  { id: "1", tipo: "Emergencia", fecha: "30 Mar, 2026", hora: "14:32", ubicacion: "Neiva, Huila",   estado: "Enviada"   as EstadoAlerta },
  { id: "2", tipo: "Asistencia", fecha: "29 Mar, 2026", hora: "20:10", ubicacion: "Campoalegre",    estado: "Cancelada" as EstadoAlerta },
  { id: "3", tipo: "Emergencia", fecha: "28 Mar, 2026", hora: "09:15", ubicacion: "Neiva, Huila",   estado: "Enviada"   as EstadoAlerta },
  { id: "4", tipo: "Asistencia", fecha: "27 Mar, 2026", hora: "18:40", ubicacion: "Palermo, Huila", estado: "Cancelada" as EstadoAlerta },
  { id: "5", tipo: "Asistencia", fecha: "26 Mar, 2026", hora: "11:05", ubicacion: "Rivera, Huila",  estado: "En curso"  as EstadoAlerta },
];

//  Utilidad: calcula "hace N días" desde la fecha del historial 
function calcularTiempoTranscurrido(fechaStr: string): string {
  // Formato esperado: "30 Mar, 2026"
  const meses: Record<string, number> = {
    Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5,
    Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11,
  };
  const partes = fechaStr.replace(",", "").split(" "); // ["30", "Mar", "2026"]
  const dia = parseInt(partes[0], 10);
  const mes = meses[partes[1]] ?? 0;
  const anio = parseInt(partes[2], 10);

  const fechaAlerta = new Date(anio, mes, dia);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diffMs = hoy.getTime() - fechaAlerta.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return "Hoy";
  if (diffDias === 1) return "Hace 1 día";
  return `Hace ${diffDias} días`;
}

export default function Inicio() {
  const vm = useInicioViewModel();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);

  //  Tamaño del botón ligeramente reducido para dar aire al texto 
  const BUTTON_SIZE = width * 0.68;

  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive]       = useState(false);

  //  Última alerta derivada del historial 
  const ultimaAlerta = useMemo(() => mockAlerts[0], []);
  const tiempoTranscurrido = useMemo(
    () => calcularTiempoTranscurrido(ultimaAlerta.fecha),
    [ultimaAlerta.fecha]
  );

  //  Animaciones glow expansivo
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

  //  Navegación a mapa
  const goToMap = () => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DrawerHome", {
      screen: "Inicio",
      params: { screen: "Mapa" },
    } as never);
  };

  //  Navegación al historial desde tarjeta ultima alerta 
  const goToHistorial = () => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DrawerHome", {
      screen: "Inicio",
      params: { screen: "Historial" },
    } as never);
  };

  // Permisos 
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

      {/* Zona segura */}
      <TouchableOpacity
        style={[
          styles.safeZoneCard,
          { backgroundColor: theme.containerBackground, borderColor: "#27ae60" }
        ]}
        activeOpacity={0.8}
      >
        <MaterialIcons name="verified-user" size={22} color="#27ae60" />
        <View style={styles.safeZoneInfo}>
          <Text style={[styles.safeZoneTitle, { color: "#27ae60" }]}>Zona segura</Text>
          <Text style={[styles.safeZoneSubtitle, { color: theme.text }]}>
            No se han reportado incidentes cerca de ti
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={theme.text} />
      </TouchableOpacity>

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
            {!vm.cargando && vm.ubicacionNombre !== "Obteniendo ubicación..." && vm.ubicacionNombre !== "Permiso denegado" && vm.ubicacionNombre !== "Error al actualizar" && (
              <View style={styles.gpsRow}>
                <View style={styles.gpsDot} />
                <Text style={styles.gpsText}>GPS activo</Text>
              </View>
            )}
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
      <View style={[styles.centerSection, { paddingVertical: BUTTON_SIZE * 0.40 }]}>

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

        {/* Anillo glow 1 */}
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

        {/* Botón principal, imagen estática */}
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

      {/* Texto de instrucción — fuente reducida para no pegarse al botón */}
      <Text style={[styles.instructionText, { color: theme.text }]}>
        Presiona en caso de Emergencia
      </Text>

      {/* Ultima alerta, (esta conectada al historial) */}
      <TouchableOpacity
        style={[
          styles.lastAlertCard,
          { backgroundColor: theme.containerBackground, borderColor: theme.icono + "30" }
        ]}
        activeOpacity={0.8}
        onPress={goToHistorial}
      >
        <MaterialIcons name="history" size={22} color={theme.icono} />
        <View style={styles.lastAlertInfo}>
          <Text style={[styles.lastAlertTitle, { color: theme.text }]}>
            <Text style={{ fontWeight: "bold" }}>Última alerta:</Text> {tiempoTranscurrido}
          </Text>
          <Text style={[styles.lastAlertSubtitle, { color: theme.text }]}>
            Última ubicación enviada: {ultimaAlerta.hora} — {ultimaAlerta.ubicacion}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={theme.text} />
      </TouchableOpacity>

    </View>
  );
}
