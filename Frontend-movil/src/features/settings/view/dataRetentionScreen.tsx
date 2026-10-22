import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WEB_URL } from "../../../constants/links";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createSettingsScreenStyles } from "../styles/settingsScreen.styles";

type IonIcon = React.ComponentProps<typeof Ionicons>["name"];

/** Cuánto tiempo se guarda cada tipo de dato y qué puede hacer la usuaria con ellos. */
export default function DataRetentionScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLocale();
  const r = t.retencion;
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const accent = theme.icon;

  const periods: { icon: IonIcon; title: string; period: string; desc: string }[] = [
    { icon: "navigate-outline", title: r.rutas_titulo, period: r.rutas_plazo, desc: r.rutas_desc },
    { icon: "location-outline", title: r.diaria_titulo, period: r.diaria_plazo, desc: r.diaria_desc },
    { icon: "videocam-outline", title: r.evidencias_titulo, period: r.evidencias_plazo, desc: r.evidencias_desc },
    { icon: "person-outline", title: r.perfil_titulo, period: r.perfil_plazo, desc: r.perfil_desc },
  ];

  const actions: { icon: IonIcon; title: string; desc: string; onPress: () => void; external?: boolean }[] = [
    { icon: "bookmark-outline", title: r.accion_conservar, desc: r.accion_conservar_desc, onPress: () => Linking.openURL(WEB_URL), external: true },
    { icon: "mic-off-outline", title: r.accion_grabacion, desc: r.accion_grabacion_desc, onPress: () => navigation.navigate("Permissions") },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.returnBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>{r.titulo_header}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{r.intro}</Text>

        {/* Plazos: línea de tiempo con el tiempo de cada dato a la vista */}
        <View style={styles.card}>
          {periods.map((p, i) => (
            <View key={p.title} style={local.step}>
              <View style={local.lineColumn}>
                <View style={[local.point, { backgroundColor: accent }]}>
                  <Ionicons name={p.icon} size={16} color="#fff" />
                </View>
                {i < periods.length - 1 && <View style={[local.line, { backgroundColor: accent + "40" }]} />}
              </View>
              <View style={local.stepContent}>
                <View style={local.titleRow}>
                  <Text style={[local.title, { color: theme.text }]}>{p.title}</Text>
                  <View style={[local.period, { backgroundColor: accent + "22", borderColor: accent + "55" }]}>
                    <Text style={[local.periodText, { color: accent }]}>{p.period}</Text>
                  </View>
                </View>
                <Text style={[local.desc, { color: theme.text }]}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Qué puede hacer la usuaria */}
        <Text style={[local.section, { color: theme.headerText }]}>{r.seccion_control}</Text>
        <View style={styles.card}>
          {actions.map((ac, i) => (
            <View key={ac.title}>
              {i > 0 && <View style={styles.divisor} />}
              <TouchableOpacity style={local.action} onPress={ac.onPress} activeOpacity={0.7} accessibilityRole="button">
                <View style={[local.actionIcon, { backgroundColor: accent + "25" }]}>
                  <Ionicons name={ac.icon} size={18} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[local.title, { color: theme.text }]}>{ac.title}</Text>
                  <Text style={[local.desc, { color: theme.text }]}>{ac.desc}</Text>
                </View>
                <Ionicons name={ac.external ? "open-outline" : "chevron-forward"} size={16} color={accent} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={[styles.card, local.note, { borderColor: accent }]}>
          <Ionicons name="lock-closed-outline" size={18} color={accent} />
          <Text style={[local.desc, { color: theme.text, flex: 1, marginTop: 0 }]}>{r.nota_cuenta}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  step: { flexDirection: "row", gap: 12 },
  lineColumn: { alignItems: "center", width: 32 },
  point: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  line: { width: 2, flex: 1, marginVertical: 4 },
  stepContent: { flex: 1, paddingBottom: 18 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  title: { fontSize: 14, fontWeight: "700", flexShrink: 1 },
  period: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  periodText: { fontSize: 11, fontWeight: "800" },
  desc: { fontSize: 12, lineHeight: 18, opacity: 0.78, marginTop: 4 },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 1.3, opacity: 0.9, marginTop: 6 },
  action: { flexDirection: "row", alignItems: "center", gap: 12 },
  actionIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  note: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1.5 },
});
