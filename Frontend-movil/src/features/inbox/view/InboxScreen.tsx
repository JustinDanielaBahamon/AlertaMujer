import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ScreenHeader from "../../../components/ui/ScreenHeader/ScreenHeader";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import type { InboxEntry, InboxKind } from "../../../notifications/inbox";
import { createSettingsScreenStyles } from "../../settings/styles/settingsScreen.styles";
import { useInboxViewModel } from "../viewModel/useInboxViewModel";

// Emergencies in red; everything else in the app palette
const KIND_ICON: Record<InboxKind, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  alert: { icon: "alert-circle", color: "#C62828" },
  warning: { icon: "warning", color: "#C62828" },
  alert_ended: { icon: "checkmark-circle", color: "#7B1DB2" },
  trip: { icon: "navigate", color: "#9333EA" },
  evidence: { icon: "folder-open", color: "#6D28D9" },
  phone: { icon: "phone-portrait", color: "#A855F7" },
  zone: { icon: "location", color: "#E67E22" },
};

function when(at: number, t: ReturnType<typeof useLocale>["t"]): string {
  const minutes = Math.round((Date.now() - at) / 60000);
  if (minutes < 1) return t.bandeja.ahora;
  if (minutes < 60) return t.bandeja.hace_min.replace("{n}", String(minutes));
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t.bandeja.hace_horas.replace("{n}", String(hours));
  return new Date(at).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export default function InboxScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const b = t.bandeja;
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const vm = useInboxViewModel();

  const confirmClear = () =>
    Alert.alert(b.borrar_todo, b.borrar_pregunta, [
      { text: t.modal.cerrar, style: "cancel" },
      { text: b.borrar_todo, style: "destructive", onPress: () => void vm.clear() },
    ]);

  const row = (e: InboxEntry) => {
    const kind = KIND_ICON[e.kind];
    return (
      <TouchableOpacity
        key={e.id}
        onPress={() => vm.open(e)}
        disabled={!e.target}
        activeOpacity={0.8}
        style={[local.row, { backgroundColor: theme.containerBackground }]}
        accessibilityRole={e.target ? "button" : undefined}
      >
        <View style={[local.icon, { backgroundColor: `${kind.color}1F` }]}>
          <Ionicons name={kind.icon} size={22} color={kind.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={local.titleRow}>
            <Text style={[local.title, { color: theme.text }]} numberOfLines={1}>{e.title}</Text>
            {!e.read && <View style={[local.dot, { backgroundColor: theme.tabActiveColor }]} />}
          </View>
          <Text style={[local.body, { color: theme.text }]} numberOfLines={3}>{e.body}</Text>
          <Text style={[local.time, { color: theme.contactSubtext }]}>{when(e.at, t)}</Text>
        </View>
        {!!e.target && <Ionicons name="chevron-forward" size={18} color={theme.contactSubtext} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={b.titulo} subtitle={b.subtitulo} icon="notifications" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {vm.entries.length === 0 ? (
          <View style={local.empty}>
            <View style={[local.emptyIcon, { backgroundColor: `${theme.tabActiveColor}22` }]}>
              <Ionicons name="notifications-off-outline" size={34} color={theme.tabActiveColor} />
            </View>
            <Text style={[local.emptyText, { color: theme.headerText }]}>{b.vacio}</Text>
          </View>
        ) : (
          <>
            {vm.entries.map(row)}
            <TouchableOpacity onPress={confirmClear} style={local.clear} accessibilityRole="button">
              <Ionicons name="trash-outline" size={16} color={theme.headerText} />
              <Text style={[local.clearText, { color: theme.headerText }]}>{b.borrar_todo}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, marginBottom: 10 },
  icon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { flex: 1, fontSize: 15, fontWeight: "700" },
  dot: { width: 9, height: 9, borderRadius: 5 },
  body: { fontSize: 13, opacity: 0.85, marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, marginTop: 4 },
  empty: { alignItems: "center", marginTop: 48, gap: 14, paddingHorizontal: 24 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  clear: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", padding: 12, marginTop: 4 },
  clearText: { fontSize: 13, fontWeight: "600" },
});
