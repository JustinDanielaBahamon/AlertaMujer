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
import { useHomeViewModel } from "../viewModel/useHomeViewModel";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useAuth } from "../../../contexts/AuthContext";
import type { AlertRecord } from "../../history/models/AlertRecord";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import { createStyles } from "../styles/home.styles";
import OfflineNotice from "../../../components/ui/offlineNotice/OfflineNotice";
import { getAlertsByUser, transformAlert } from "../../../services/alerts.service";
import { useZoneStatus } from "../viewModel/useZoneStatus";
import { useTripSuggestion } from "../viewModel/useTripSuggestion";
import TripSuggestionPopup from "./TripSuggestionPopup";

// Zone card colors: safe, near a risk zone, inside one, or no location
const ZONE_COLORS = { safe: "#27ae60", near: "#E67E22", inside: "#C62828" } as const;
const ZONE_ICONS = { safe: "verified-user", near: "warning", inside: "report" } as const;

export default function Home() {
  const vm = useHomeViewModel();
  const { theme } = useTheme();
  const { t } = useLocale();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);

  // Button size slightly reduced to give the text room
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

  // Fallback: reload when the component is mounted and becomes visible.
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      loadAlerts();
    }
  }, [isFocused, loadAlerts]);

  // Last alert derived from the history
  const lastAlert = useMemo(() => alerts[0], [alerts]);
  const hasActiveAlert = alerts.some((a) => a.status === "En curso");

  // Real zone status from her position and the risk zones
  const here = useMemo(
    () =>
      vm.detailedLocation
        ? { latitude: vm.detailedLocation.latitudeValue, longitude: vm.detailedLocation.longitudeValue }
        : null,
    [vm.detailedLocation],
  );
  const zone = useZoneStatus(here);
  const tripSuggestion = useTripSuggestion(hasActiveAlert);
  const zoneColor = zone ? ZONE_COLORS[zone.kind] : theme.icon;
  const zoneTitle = !zone
    ? t.inicio.ubicacion_desconocida
    : zone.kind === "inside"
      ? t.inicio.zona_dentro
      : zone.kind === "near"
        ? t.inicio.zona_cerca
        : t.inicio.zona_segura;
  const gpsText = vm.locationList ? t.inicio.gps_activo : t.inicio.gps_inactivo;
  const zoneSubtitle = !zone || zone.kind === "safe"
    ? `${zone ? t.inicio.zona_sin_riesgo : t.inicio.sin_incidentes} • ${gpsText}`
    : zone.kind === "near"
      ? t.inicio.zona_cerca_detalle.replace("{zona}", zone.zone?.name ?? "").replace("{metros}", String(zone.distanceM ?? 0))
      : t.inicio.zona_dentro_detalle.replace("{zona}", zone.zone?.name ?? "");

  // Do not use the elapsed-time calculation with the API format
  // Use the API time value directly
  const elapsedTime = lastAlert?.date || t.inicio.sin_alertas;

  // Expanding glow animations
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

  // Navigation to the map
  const goToMap = () => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DrawerHome", {
      screen: "Home",
      params: { screen: "Map" },
    } as never);
  };

  const goToTrip = () => getMainStackNavigation(navigation)?.navigate("Trip" as never);

  // Navigation to the history from the last alert card
  const goToHistory = () => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DrawerHome", {
      screen: "Home",
      params: { screen: "History" },
    } as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}>

      {/* No internet: an alert would not go out now */}
      <OfflineNotice />

      {/* "¿Vas a algún lado?": a small notification over the screen, not a fixed card */}
      <TripSuggestionPopup
        visible={tripSuggestion.visible}
        isNews={tripSuggestion.isNews}
        onStart={() => {
          tripSuggestion.markSeen();
          goToTrip();
        }}
        onLater={tripSuggestion.dismiss}
        // Hidden by itself: the news is shown again next time (she may not have read it)
        onTimeout={() => tripSuggestion.markSeen(false)}
      />

      {/* Zone: safe, near a risk zone or inside one */}
      <TouchableOpacity
        style={[
          styles.safeZoneCard,
          {
            backgroundColor: theme.containerBackground,
            borderColor: zoneColor,
          },
        ]}
        activeOpacity={0.8}
        onPress={zone && zone.kind !== "safe" ? goToTrip : goToMap}
      >
        <MaterialIcons
          name={zone ? ZONE_ICONS[zone.kind] : "location-searching"}
          size={26}
          color={zoneColor}
        />

        <View style={styles.safeZoneInfo}>
          <Text
            style={[
              styles.safeZoneTitle,
              {
                color: zoneColor,
              },
            ]}
          >
            {zoneTitle}
          </Text>

          <Text
            style={[
              styles.safeZoneSubtitle,
              { color: theme.text },
            ]}
            numberOfLines={2}
          >
            {zoneSubtitle}
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

      {/* Central button with an expanding glow */}
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

        {/* Glow ring 2 — middle */}
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

        {/* Main button, static image */}
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

      {/* Last alert (connected to the history) */}
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
          <Text style={[styles.lastAlertSubtitle, { color: theme.text }]} numberOfLines={2}>
            {t.inicio.ultima_ubicacion_enviada} {lastAlert?.time || ""} — {lastAlert?.location || t.inicio.sin_ubicacion}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={theme.text} />
      </TouchableOpacity>

    </View>
  );
}