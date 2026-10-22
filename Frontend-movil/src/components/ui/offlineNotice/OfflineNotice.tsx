import { Ionicons } from "@expo/vector-icons";
import { useNetworkState } from "expo-network";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";

/**
 * Notice when the phone has no internet: an alert activated at that moment will not go out. It is
 * shown before the emergency, while she can still connect to Wi‑Fi or top up data.
 */
export default function OfflineNotice() {
  const red = useNetworkState();
  const { t } = useLocale();
  const { theme } = useTheme();
  // isInternetReachable may be null while it is being checked: only warn on a certain "no"
  const sinInternet = red.isConnected === false || red.isInternetReachable === false;
  if (!sinInternet) return null;
  return (
    <View
      style={[styles.box, { borderColor: theme.icon, backgroundColor: theme.icon + "1F" }]}
      accessibilityRole="alert"
    >
      <Ionicons name="cloud-offline-outline" size={22} color={theme.icon} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.text }]}>{t.conexion.titulo}</Text>
        <Text style={[styles.text, { color: theme.text }]}>{t.conexion.texto}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1.5, borderRadius: 14, padding: 12, marginHorizontal: 16, marginTop: 8 },
  title: { fontSize: 13, fontWeight: "800" },
  text: { fontSize: 12, lineHeight: 17, opacity: 0.85, marginTop: 2 },
});
