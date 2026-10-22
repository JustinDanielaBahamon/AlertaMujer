import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import type { ReceivedAlert } from "../../../services/received-alerts.service";
import { createSettingsScreenStyles } from "../../settings/styles/settingsScreen.styles";
import { useReceivedAlertsViewModel } from "../viewModel/useReceivedAlertsViewModel";

const dos = (n: number) => String(n).padStart(2, "0");
const time = (d: Date) => {
  const h = d.getHours();
  return `${h % 12 || 12}:${dos(d.getMinutes())} ${h < 12 ? "a. m." : "p. m."}`;
};
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function duration(startTime: Date | null, end: Date | null): string | null {
  if (!startTime || !end) return null;
  const minutes = Math.max(1, Math.round((end.getTime() - startTime.getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${dos(minutes % 60)} min`;
}

const initial = (name: string) => (name.trim().charAt(0) || "?").toUpperCase();

export default function ReceivedAlertsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const r = t.alertasRecibidas;
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const vm = useReceivedAlertsViewModel();
  const accent = theme.icon;

  // Anteriores agrupadas por día: "Hoy", "Ayer" o la fecha
  const groups = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    const map = new Map<string, ReceivedAlert[]>();
    for (const a of vm.previousOnes) {
      const d = a.startTime ?? new Date(0);
      const key = sameDay(d, today)
        ? r.hoy
        : sameDay(d, yesterday)
          ? r.ayer
          : d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return [...map.entries()];
  }, [vm.previousOnes, r]);

  const statusLabel = (a: ReceivedAlert) =>
    a.status === "resolved" ? r.estado_atendida : a.status === "cancelled" ? r.estado_cancelada : r.estado_terminada;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />
      <View style={styles.header}>
        <TouchableOpacity onPress={vm.goBack} style={styles.returnBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>{r.titulo_header}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={vm.reload} tintColor={theme.headerText} colors={[accent]} />}
      >
        {/* Qué es esta pantalla: no son las alertas propias */}
        <View style={[local.explanation, { backgroundColor: "rgba(255,255,255,0.14)" }]}>
          <Ionicons name="people" size={20} color={theme.headerText} />
          <Text style={[local.explanationText, { color: theme.headerText }]}>{r.intro}</Text>
        </View>

        {vm.loading && <ActivityIndicator color={theme.headerText} style={{ marginTop: 24 }} />}

        {vm.error && (
          <View style={styles.card}>
            <Text style={[styles.description, { marginTop: 0 }]}>{r.error_carga}</Text>
            <TouchableOpacity onPress={vm.reload} style={[local.button, { backgroundColor: accent }]}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={local.buttonText}>{r.reintentar}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* En curso: tarjeta de emergencia grande */}
        {vm.activeOnes.map((a) => {
          const name = a.name || r.un_contacto;
          return (
            <View key={a.id} style={[local.emergency, { backgroundColor: accent }]}>
              <View style={local.emergencyRow}>
                <View style={local.emergencyAvatar}>
                  <Text style={[local.avatarText, { color: accent }]}>{initial(name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={local.live}>
                    <View style={local.liveDot} />
                    <Text style={local.liveText}>{r.estado_activa}</Text>
                  </View>
                  <Text style={local.emergencyName} numberOfLines={1}>{name}</Text>
                  <Text style={local.emergencyText}>
                    {r.pide_ayuda}
                    {a.startTime ? ` · ${r.desde} ${time(a.startTime)}` : ""}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => vm.open(a)}
                disabled={vm.opening === a.id}
                style={local.emergencyButton}
                accessibilityRole="button"
              >
                {vm.opening === a.id ? (
                  <ActivityIndicator size="small" color={accent} />
                ) : (
                  <Ionicons name="navigate" size={18} color={accent} />
                )}
                <Text style={[local.emergencyButtonText, { color: accent }]}>{r.ver_ubicacion}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Vacío */}
        {!vm.loading && !vm.error && vm.activeOnes.length === 0 && vm.previousOnes.length === 0 && (
          <View style={[styles.card, local.empty]}>
            <View style={[local.emptyIcon, { backgroundColor: accent + "22" }]}>
              <Ionicons name="shield-checkmark-outline" size={34} color={accent} />
            </View>
            <Text style={[styles.title, { flex: 0, textAlign: "center" }]}>{r.vacio_titulo}</Text>
            <Text style={[styles.description, { textAlign: "center" }]}>{r.vacio_desc}</Text>
          </View>
        )}

        {/* Anteriores por día */}
        {groups.map(([day, list]) => (
          <View key={day}>
            <Text style={[local.day, { color: theme.headerText }]}>{day}</Text>
            <View style={[styles.card, { paddingVertical: 6 }]}>
              {list.map((a, i) => {
                const name = a.name || r.un_contacto;
                const dur = duration(a.startTime, a.end);
                return (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => vm.open(a)}
                    disabled={!a.trackingAvailable || vm.opening === a.id}
                    activeOpacity={0.7}
                    style={[local.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: accent + "33" }]}
                  >
                    <View style={[local.avatar, { backgroundColor: accent + "22" }]}>
                      <Text style={[local.avatarSmallText, { color: accent }]}>{initial(name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[local.name, { color: theme.text }]} numberOfLines={1}>{name}</Text>
                      <Text style={[local.meta, { color: theme.text }]}>
                        {a.startTime ? time(a.startTime) : ""}
                        {dur ? ` · ${r.duro} ${dur}` : ""}
                      </Text>
                    </View>
                    <View style={[local.status, { borderColor: accent }]}>
                      <Text style={[local.statusText, { color: accent }]}>{statusLabel(a)}</Text>
                    </View>
                    {a.trackingAvailable ? (
                      vm.opening === a.id ? (
                        <ActivityIndicator size="small" color={accent} />
                      ) : (
                        <Ionicons name="chevron-forward" size={18} color={accent} />
                      )
                    ) : (
                      <Ionicons name="lock-closed-outline" size={15} color={theme.text} style={{ opacity: 0.4 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        {vm.previousOnes.length > 0 && (
          <Text style={[local.note, { color: theme.headerText }]}>{r.nota_cerradas}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  explanation: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 14, padding: 12 },
  explanationText: { flex: 1, fontSize: 13, lineHeight: 19 },
  emergency: { borderRadius: 20, padding: 16, gap: 14 },
  emergencyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  emergencyAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "900" },
  live: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  liveText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },
  emergencyName: { color: "#fff", fontSize: 19, fontWeight: "900", marginTop: 2 },
  emergencyText: { color: "#fff", fontSize: 13, opacity: 0.9, marginTop: 1 },
  emergencyButton: { flexDirection: "row", gap: 8, height: 46, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  emergencyButtonText: { fontSize: 15, fontWeight: "800" },
  button: { marginTop: 12, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  day: { fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", opacity: 0.9, marginTop: 6, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarSmallText: { fontSize: 16, fontWeight: "800" },
  name: { fontSize: 14, fontWeight: "700" },
  meta: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  status: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: "800" },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  note: { fontSize: 12, opacity: 0.75, textAlign: "center", marginTop: 4 },
});
