import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createSettingsScreenStyles } from "../../settings/styles/settingsScreen.styles";
import { QUICK_MINUTES, useTripViewModel } from "../viewModel/useTripViewModel";

const dos = (n: number) => String(n).padStart(2, "0");
const time = (d: Date) => {
  const h = d.getHours();
  return `${h % 12 || 12}:${dos(d.getMinutes())} ${h < 12 ? "a. m." : "p. m."}`;
};

export default function TripScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const tr = t.trayecto;
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const vm = useTripViewModel();
  const accent = theme.icon;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />
      <View style={styles.header}>
        <TouchableOpacity onPress={vm.goBack} style={styles.returnBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>{tr.titulo}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {vm.loading ? (
          <ActivityIndicator color={theme.headerText} style={{ marginTop: 32 }} />
        ) : vm.trip ? (
          /* ── Trip in progress ── */
          <>
            <View style={[styles.card, local.inProgress, { borderColor: accent }]}>
              <Text style={[local.label, { color: theme.text }]}>{tr.vas_a}</Text>
              <Text style={[local.destination, { color: theme.text }]} numberOfLines={2}>{vm.trip.destination}</Text>
              <View style={[local.clock, { backgroundColor: accent + "18" }]}>
                <Text style={[local.minutes, { color: accent }]}>
                  {vm.minutesLeft > 0 ? vm.minutesLeft : 0}
                </Text>
                <Text style={[local.minutesText, { color: theme.text }]}>
                  {vm.minutesLeft > 0 ? tr.minutos_para_llegar : tr.hora_cumplida}
                </Text>
              </View>
              <Text style={[local.detail, { color: theme.text }]}>
                {tr.llegada_esperada.replace("{hora}", time(vm.trip.arrival))}
              </Text>
              <Text style={[local.notice, { color: theme.text }]}>{tr.si_no_confirmas}</Text>
            </View>

            <TouchableOpacity
              onPress={vm.arrived}
              disabled={vm.busy}
              style={[local.bigButton, { backgroundColor: accent }, vm.busy && { opacity: 0.5 }]}
              accessibilityRole="button"
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={local.bigButtonText}>{tr.ya_llegue}</Text>
            </TouchableOpacity>

            <View style={local.row}>
              {[15, 30].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => vm.extend(m)}
                  disabled={vm.busy}
                  style={[local.secondaryButton, { borderColor: theme.headerText }]}
                >
                  <Ionicons name="time-outline" size={16} color={theme.headerText} />
                  <Text style={[local.secondaryButtonText, { color: theme.headerText }]}>+{m} min</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={vm.cancel} disabled={vm.busy} style={local.cancel}>
              <Text style={[local.cancelText, { color: theme.headerText }]}>{tr.cancelar}</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* ── New trip ── */
          <>
            <Text style={styles.intro}>{tr.intro}</Text>

            <View style={styles.card}>
              <Text style={[local.label, { color: theme.text }]}>{tr.a_donde}</Text>
              <TextInput
                value={vm.destination}
                onChangeText={vm.changeDestination}
                placeholder={tr.destino_placeholder}
                placeholderTextColor={accent + "70"}
                maxLength={120}
                style={[local.input, { borderColor: accent + "50", color: theme.text }]}
              />
              {vm.places.length > 0 && (
                <View style={local.chips}>
                  {vm.places.slice(0, 6).map((l) => (
                    <TouchableOpacity
                      key={l.id}
                      onPress={() => vm.choosePlace(l)}
                      style={[local.chip, { borderColor: accent }, vm.place?.id === l.id && { backgroundColor: accent }]}
                    >
                      <Ionicons name="bookmark" size={12} color={vm.place?.id === l.id ? "#fff" : accent} />
                      <Text style={[local.chipText, { color: vm.place?.id === l.id ? "#fff" : accent }]} numberOfLines={1}>
                        {l.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={[local.label, { color: theme.text, marginTop: 16 }]}>{tr.en_cuanto}</Text>
              <View style={local.chips}>
                {QUICK_MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => vm.setMinutes(m)}
                    style={[local.chip, { borderColor: accent }, vm.minutes === m && { backgroundColor: accent }]}
                  >
                    <Text style={[local.chipText, { color: vm.minutes === m ? "#fff" : accent }]}>
                      {m < 60 ? `${m} min` : m === 60 ? "1 h" : "1 h 30"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.card, local.como]}>
              {[tr.paso_1, tr.paso_2, tr.paso_3].map((p, i) => (
                <View key={p} style={local.step}>
                  <View style={[local.number, { backgroundColor: accent }]}>
                    <Text style={local.numberText}>{i + 1}</Text>
                  </View>
                  <Text style={[local.stepText, { color: theme.text }]}>{p}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={vm.start}
              disabled={!vm.destination.trim() || vm.busy}
              style={[local.bigButton, { backgroundColor: accent }, (!vm.destination.trim() || vm.busy) && { opacity: 0.5 }]}
              accessibilityRole="button"
            >
              {vm.busy ? <ActivityIndicator color="#fff" /> : <Ionicons name="navigate" size={20} color="#fff" />}
              <Text style={local.bigButtonText}>{tr.empezar}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  inProgress: { borderWidth: 2, alignItems: "center" },
  label: { fontSize: 12, fontWeight: "700", opacity: 0.7, letterSpacing: 0.4, textTransform: "uppercase", alignSelf: "stretch" },
  destination: { fontSize: 20, fontWeight: "800", textAlign: "center", marginTop: 4 },
  clock: { alignItems: "center", borderRadius: 20, paddingVertical: 14, paddingHorizontal: 28, marginTop: 14 },
  minutes: { fontSize: 44, fontWeight: "900" },
  minutesText: { fontSize: 13, opacity: 0.75 },
  detail: { fontSize: 13, marginTop: 12, opacity: 0.8 },
  notice: { fontSize: 12, lineHeight: 18, opacity: 0.7, textAlign: "center", marginTop: 8 },
  bigButton: { flexDirection: "row", gap: 8, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  bigButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  row: { flexDirection: "row", gap: 10 },
  secondaryButton: { flex: 1, flexDirection: "row", gap: 6, height: 44, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { fontSize: 14, fontWeight: "700" },
  cancel: { alignItems: "center", paddingVertical: 8 },
  cancelText: { fontSize: 13, fontWeight: "600", opacity: 0.85, textDecorationLine: "underline" },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginTop: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, maxWidth: 170 },
  chipText: { fontSize: 13, fontWeight: "700" },
  como: { gap: 10 },
  step: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  number: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  numberText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  stepText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
