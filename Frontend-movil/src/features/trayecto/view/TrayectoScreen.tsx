import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createAjustesPantallaStyles } from "../../settings/styles/ajustesPantalla.styles";
import { MINUTOS_RAPIDOS, useTrayectoViewModel } from "../viewModel/useTrayectoViewModel";

const dos = (n: number) => String(n).padStart(2, "0");
const hora = (d: Date) => {
  const h = d.getHours();
  return `${h % 12 || 12}:${dos(d.getMinutes())} ${h < 12 ? "a. m." : "p. m."}`;
};

export default function TrayectoScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const tr = t.trayecto;
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const vm = useTrayectoViewModel();
  const accent = theme.icono;

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />
      <View style={styles.header}>
        <TouchableOpacity onPress={vm.volver} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>{tr.titulo}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {vm.cargando ? (
          <ActivityIndicator color={theme.headerText} style={{ marginTop: 32 }} />
        ) : vm.trayecto ? (
          /* ── Trayecto en curso ── */
          <>
            <View style={[styles.tarjeta, local.enCurso, { borderColor: accent }]}>
              <Text style={[local.etiqueta, { color: theme.text }]}>{tr.vas_a}</Text>
              <Text style={[local.destino, { color: theme.text }]} numberOfLines={2}>{vm.trayecto.destino}</Text>
              <View style={[local.reloj, { backgroundColor: accent + "18" }]}>
                <Text style={[local.minutos, { color: accent }]}>
                  {vm.minutosRestantes > 0 ? vm.minutosRestantes : 0}
                </Text>
                <Text style={[local.minutosTexto, { color: theme.text }]}>
                  {vm.minutosRestantes > 0 ? tr.minutos_para_llegar : tr.hora_cumplida}
                </Text>
              </View>
              <Text style={[local.detalle, { color: theme.text }]}>
                {tr.llegada_esperada.replace("{hora}", hora(vm.trayecto.llegada))}
              </Text>
              <Text style={[local.aviso, { color: theme.text }]}>{tr.si_no_confirmas}</Text>
            </View>

            <TouchableOpacity
              onPress={vm.llegue}
              disabled={vm.ocupado}
              style={[local.botonGrande, { backgroundColor: accent }, vm.ocupado && { opacity: 0.5 }]}
              accessibilityRole="button"
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={local.botonGrandeTexto}>{tr.ya_llegue}</Text>
            </TouchableOpacity>

            <View style={local.fila}>
              {[15, 30].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => vm.alargar(m)}
                  disabled={vm.ocupado}
                  style={[local.botonSecundario, { borderColor: theme.headerText }]}
                >
                  <Ionicons name="time-outline" size={16} color={theme.headerText} />
                  <Text style={[local.botonSecundarioTexto, { color: theme.headerText }]}>+{m} min</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={vm.cancelar} disabled={vm.ocupado} style={local.cancelar}>
              <Text style={[local.cancelarTexto, { color: theme.headerText }]}>{tr.cancelar}</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* ── Nuevo trayecto ── */
          <>
            <Text style={styles.intro}>{tr.intro}</Text>

            <View style={styles.tarjeta}>
              <Text style={[local.etiqueta, { color: theme.text }]}>{tr.a_donde}</Text>
              <TextInput
                value={vm.destino}
                onChangeText={vm.cambiarDestino}
                placeholder={tr.destino_placeholder}
                placeholderTextColor={accent + "70"}
                maxLength={120}
                style={[local.input, { borderColor: accent + "50", color: theme.text }]}
              />
              {vm.lugares.length > 0 && (
                <View style={local.chips}>
                  {vm.lugares.slice(0, 6).map((l) => (
                    <TouchableOpacity
                      key={l.id}
                      onPress={() => vm.elegirLugar(l)}
                      style={[local.chip, { borderColor: accent }, vm.lugar?.id === l.id && { backgroundColor: accent }]}
                    >
                      <Ionicons name="bookmark" size={12} color={vm.lugar?.id === l.id ? "#fff" : accent} />
                      <Text style={[local.chipTexto, { color: vm.lugar?.id === l.id ? "#fff" : accent }]} numberOfLines={1}>
                        {l.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={[local.etiqueta, { color: theme.text, marginTop: 16 }]}>{tr.en_cuanto}</Text>
              <View style={local.chips}>
                {MINUTOS_RAPIDOS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => vm.setMinutos(m)}
                    style={[local.chip, { borderColor: accent }, vm.minutos === m && { backgroundColor: accent }]}
                  >
                    <Text style={[local.chipTexto, { color: vm.minutos === m ? "#fff" : accent }]}>
                      {m < 60 ? `${m} min` : m === 60 ? "1 h" : "1 h 30"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.tarjeta, local.como]}>
              {[tr.paso_1, tr.paso_2, tr.paso_3].map((p, i) => (
                <View key={p} style={local.paso}>
                  <View style={[local.numero, { backgroundColor: accent }]}>
                    <Text style={local.numeroTexto}>{i + 1}</Text>
                  </View>
                  <Text style={[local.pasoTexto, { color: theme.text }]}>{p}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={vm.empezar}
              disabled={!vm.destino.trim() || vm.ocupado}
              style={[local.botonGrande, { backgroundColor: accent }, (!vm.destino.trim() || vm.ocupado) && { opacity: 0.5 }]}
              accessibilityRole="button"
            >
              {vm.ocupado ? <ActivityIndicator color="#fff" /> : <Ionicons name="navigate" size={20} color="#fff" />}
              <Text style={local.botonGrandeTexto}>{tr.empezar}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  enCurso: { borderWidth: 2, alignItems: "center" },
  etiqueta: { fontSize: 12, fontWeight: "700", opacity: 0.7, letterSpacing: 0.4, textTransform: "uppercase", alignSelf: "stretch" },
  destino: { fontSize: 20, fontWeight: "800", textAlign: "center", marginTop: 4 },
  reloj: { alignItems: "center", borderRadius: 20, paddingVertical: 14, paddingHorizontal: 28, marginTop: 14 },
  minutos: { fontSize: 44, fontWeight: "900" },
  minutosTexto: { fontSize: 13, opacity: 0.75 },
  detalle: { fontSize: 13, marginTop: 12, opacity: 0.8 },
  aviso: { fontSize: 12, lineHeight: 18, opacity: 0.7, textAlign: "center", marginTop: 8 },
  botonGrande: { flexDirection: "row", gap: 8, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  botonGrandeTexto: { color: "#fff", fontSize: 16, fontWeight: "800" },
  fila: { flexDirection: "row", gap: 10 },
  botonSecundario: { flex: 1, flexDirection: "row", gap: 6, height: 44, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  botonSecundarioTexto: { fontSize: 14, fontWeight: "700" },
  cancelar: { alignItems: "center", paddingVertical: 8 },
  cancelarTexto: { fontSize: 13, fontWeight: "600", opacity: 0.85, textDecorationLine: "underline" },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginTop: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, maxWidth: 170 },
  chipTexto: { fontSize: 13, fontWeight: "700" },
  como: { gap: 10 },
  paso: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  numero: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  numeroTexto: { color: "#fff", fontSize: 12, fontWeight: "800" },
  pasoTexto: { flex: 1, fontSize: 13, lineHeight: 19 },
});
