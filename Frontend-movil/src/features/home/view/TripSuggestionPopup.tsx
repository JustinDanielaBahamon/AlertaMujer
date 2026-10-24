import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";

// It appears a moment after the screen opens and hides itself if she does nothing
const SHOW_AFTER_MS = 1200;
const HIDE_AFTER_MS = 10000;

type Props = { visible: boolean; onStart: () => void; onLater: () => void; onTimeout: () => void };

/** "¿Vas a algún lado?" as a small notification that slides down over the home screen. */
export default function TripSuggestionPopup({ visible, onStart, onLater, onTimeout }: Props) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const offset = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    if (!visible) return;
    const slide = (to: number, done?: () => void) =>
      Animated.timing(offset, { toValue: to, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(
        done,
      );
    const showId = setTimeout(() => slide(0), SHOW_AFTER_MS);
    const hideId = setTimeout(() => slide(-160, onTimeout), SHOW_AFTER_MS + HIDE_AFTER_MS);
    return () => {
      clearTimeout(showId);
      clearTimeout(hideId);
      offset.setValue(-160);
    };
  }, [visible]);

  if (!visible) return null;

  const close = (then: () => void) =>
    Animated.timing(offset, { toValue: -160, duration: 220, useNativeDriver: true }).start(then);

  return (
    <Animated.View
      style={[local.popup, { backgroundColor: theme.containerBackground, transform: [{ translateY: offset }] }]}
      accessibilityLiveRegion="polite"
    >
      <View style={local.row}>
        <View style={[local.icon, { backgroundColor: theme.icon + "20" }]}>
          <MaterialIcons name="directions-walk" size={22} color={theme.icon} />
        </View>
        <View style={local.body}>
          <Text style={[local.title, { color: theme.text }]}>{t.inicio.vas_a_algun_lado}</Text>
          <Text style={[local.text, { color: theme.text }]}>{t.inicio.vas_a_algun_lado_texto}</Text>
        </View>
      </View>
      <View style={local.actions}>
        <TouchableOpacity onPress={() => close(onLater)} style={local.later} accessibilityRole="button">
          <Text style={[local.laterText, { color: theme.text }]}>{t.inicio.cerrar_sugerencia}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => close(onStart)}
          style={[local.start, { backgroundColor: theme.icon }]}
          accessibilityRole="button"
        >
          <Text style={local.startText}>{t.inicio.iniciar_trayecto}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const local = StyleSheet.create({
  popup: {
    position: "absolute",
    top: 8,
    left: 14,
    right: 14,
    zIndex: 20,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: "800" },
  text: { fontSize: 12.5, lineHeight: 17, opacity: 0.8, marginTop: 2 },
  actions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8 },
  later: { paddingHorizontal: 12, paddingVertical: 8 },
  laterText: { fontSize: 13, fontWeight: "700", opacity: 0.75 },
  start: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14 },
  startText: { color: "#fff", fontSize: 13, fontWeight: "800" },
});
