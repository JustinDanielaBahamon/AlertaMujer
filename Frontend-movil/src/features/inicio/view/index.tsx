import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, useIsFocused, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHomeViewModel } from "../viewModel/useInicioViewModel";
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { useLocale } from "../../../../src/contexts/LocaleContext";
import { useAuth } from "../../../../src/contexts/AuthContext";
import type { AlertRecord } from "../../../features/historial/models/Alerta";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import { createStyles } from "../styles/inicio.styles";
import OfflineNotice from "../../../components/ui/avisoSinConexion/AvisoSinConexion";
import { getAlertsByUser, transformAlert } from "../../../../src/services/alerts.service";

export default function Home() {
  const vm = useHomeViewModel();
  const { theme } = useTheme();
  const { t } = useLocale();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);

  //  Tamaño del botón ligeramente reducido para dar aire al texto
  const BUTTON_SIZE = width * 0.68;

  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  const loadAlerts = useCallback(async () => {
    if (!user?.id) {
      setAlerts([]);
      return;
    }

    try {
      const apiAlerts = await getAlertsByUser(user.id);
      const transformedAlerts = apiAlerts.map(transformAlert);
      setAlerts(transformedAlerts);
    } catch (error) {
      console.error("Error al cargar alertas:", error);
      setAlerts([]);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [loadAlerts]),
  );

  // Respaldo: vuelve a cargar cuando el componente está montado y gana foco visible.
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      loadAlerts();
    }
  }, [isFocused, loadAlerts]);

  //  Última alerta derivada del historial
  const lastAlert = useMemo(() => alerts[0], [alerts]);

  //  No usar calcularTiempoTranscurrido con formato de API
  //  Usar directamente el valor de tiempo de la API
  const elapsedTime = lastAlert?.date || t.inicio.sin_alertas;

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
      screen: "Home",
      params: { screen: "Map" },
    } as never);
  };

  //  Navegación al historial desde tarjeta ultima alerta 
  const goToHistory = () => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DrawerHome", {
      screen: "Home",
      params: { screen: "History" },
    } as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}>

      {/* Sin internet: una alerta no saldría ahora */}
      <OfflineNotice />

      {/* Zona segura */}
      <TouchableOpacity
        style={[
          styles.safeZoneCard,
          {
            backgroundColor: theme.containerBackground,
            borderColor: "#27ae60",
          },
        ]}
        activeOpacity={0.8}
        onPress={goToMap}
      >
        <MaterialIcons
          name="verified-user"
          size={26}
          color="#27ae60"
        />

        <View style={styles.safeZoneInfo}>
          <Text
            style={[
              styles.safeZoneTitle,
              {
                color: "#27ae60",
              },
            ]}
          >
            {t.inicio.zona_segura}
          </Text>

          <Text
            style={[
              styles.safeZoneSubtitle,
              {

              },
            ]}
            numberOfLines={1}
          >
            {t.inicio.sin_incidentes} •{" "}
            {vm.locationList ? t.inicio.gps_activo : "GPS inactivo"}
          </Text>

          <Text
            style={[
              styles.safeZoneLocation,
              {
                color: theme.text,
              },
            ]}
            numberOfLines={1}
          >
            {vm.locationName || "Ubicación no disponible"}
          </Text>
        </View>

        <MaterialIcons
          name="chevron-right"
          size={24}
          color={theme.text}
        />
      </TouchableOpacity>

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
            backgroundColor: theme.icon + "18",
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
            backgroundColor: theme.icon + "28",
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
            backgroundColor: theme.icon + "45",
            transform: [{ scale: glow1Scale }],
            opacity: glow1Opacity,
          }}
        />

        {/* Botón principal, imagen estática */}
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={vm.onButtonPressIn}
          onPressOut={vm.onButtonPressOut}
          onPress={vm.activateAlert}
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: theme.icon,
            shadowOffset: { width: 0, height: vm.pressed ? 2 : 10 },
            shadowOpacity: vm.pressed ? 0.2 : 0.6,
            shadowRadius: vm.pressed ? 4 : 20,
            elevation: vm.pressed ? 4 : 18,
            transform: [{ scale: vm.pressed ? 0.92 : 1 }],
            opacity: vm.pressed ? 0.85 : 1,
          }}
        >
          <Image
            source={theme.buttonImage}
            fadeDuration={0}
            style={{
              width: BUTTON_SIZE * 1.1,
              height: BUTTON_SIZE * 1.1,
              resizeMode: "contain",
            }}
          />
        </TouchableOpacity>

      </View>

      {/* Ultima alerta, (esta conectada al historial) */}
      <TouchableOpacity
        style={[
          styles.lastAlertCard,
          {
            backgroundColor: theme.containerBackground,
            borderColor: "#7B2CBF" + "20",
          },
        ]}
        activeOpacity={0.8}
        onPress={goToHistory}
      >
        <MaterialIcons name="history" size={24} color="#7B2CBF" />
        <View style={styles.lastAlertInfo}>
          <Text style={[styles.lastAlertTitle, { color: theme.text }]}>
            <Text style={{ fontWeight: "bold" }}>{t.inicio.ultima_alerta}</Text> {elapsedTime}
          </Text>
          <Text style={[styles.lastAlertSubtitle, { color: theme.text }]}>
            {t.inicio.ultima_ubicacion_enviada} {lastAlert?.time || ""} — {lastAlert?.location || t.inicio.sin_ubicacion}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={theme.text} />
      </TouchableOpacity>

    </View>
  );
}