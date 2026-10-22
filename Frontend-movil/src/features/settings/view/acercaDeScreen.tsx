import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WEB_URL } from "../../../constants/enlaces";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createSettingsScreenStyles } from "../styles/ajustesPantalla.styles";

type IonIcon = React.ComponentProps<typeof Ionicons>["name"];

/** Acerca de: qué es la app, cómo cuida tu información y sus documentos legales. */
export default function AboutScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLocale();
  const a = t.acercaDe;
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const accent = theme.icon;

  // Se lee de "version" en app.json
  const version = Constants.expoConfig?.version ?? "-";

  const linkRow = (icon: IonIcon, title: string, desc: string | null, onPress: () => void, external = false) => (
    <TouchableOpacity style={local.row} activeOpacity={0.7} onPress={onPress} accessibilityRole="button">
      <View style={[local.rowIcon, { backgroundColor: accent + "25" }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[local.rowTitle, { color: theme.text }]}>{title}</Text>
        {desc && <Text style={[local.descRow, { color: theme.text }]}>{desc}</Text>}
      </View>
      <Ionicons name={external ? "open-outline" : "chevron-forward"} size={16} color={accent} />
    </TouchableOpacity>
  );

  const privacyPoints: { icon: IonIcon; text: string }[] = [
    { icon: "hand-left-outline", text: a.privacidad_punto_venta },
    { icon: "videocam-outline", text: a.privacidad_punto_grabacion },
    { icon: "time-outline", text: a.privacidad_punto_borrado },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.returnBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>{a.titulo_header}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Presentación de la app */}
        <View style={[styles.card, { padding: 0, overflow: "hidden" }]}>
          <LinearGradient colors={[accent + "30", accent + "08"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={local.hero}>
            <Image source={require("../../../../assets/images/icon.png")} style={local.logo} />
            <Text style={[local.name, { color: theme.text }]}>AlertaMujer</Text>
            <Text style={[local.motto, { color: theme.text }]}>{a.descripcion}</Text>
            <View style={[local.chipVersion, { backgroundColor: accent }]}>
              <Text style={local.versionChipText}>
                {a.version} {version}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Privacidad */}
        <Text style={[local.section, { color: theme.headerText }]}>{a.seccion_privacidad}</Text>
        <View style={styles.card}>
          {privacyPoints.map((p) => (
            <View key={p.icon} style={local.point}>
              <Ionicons name={p.icon} size={18} color={accent} />
              <Text style={[local.pointText, { color: theme.text }]}>{p.text}</Text>
            </View>
          ))}
          <View style={styles.divisor} />
          {linkRow("server-outline", a.retencion_titulo, a.retencion_desc, () => navigation.navigate("RetencionDatos"))}
          <View style={styles.divisor} />
          {linkRow("shield-checkmark-outline", a.politica_privacidad, null, () => navigation.navigate("PoliticaPrivacidad"))}
          <View style={styles.divisor} />
          {linkRow("document-text-outline", a.terminos, null, () => navigation.navigate("PoliticaTerminos"))}
        </View>

        {/* La app en la web */}
        <Text style={[local.section, { color: theme.headerText }]}>{a.seccion_app}</Text>
        <View style={styles.card}>
          {linkRow("globe-outline", a.web, a.web_desc, () => Linking.openURL(WEB_URL), true)}
        </View>

        <Text style={[local.credits, { color: theme.headerText }]}>{a.proyecto}</Text>
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  hero: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 20 },
  logo: { width: 76, height: 76, borderRadius: 20 },
  name: { fontSize: 22, fontWeight: "800", marginTop: 12 },
  motto: { fontSize: 13, lineHeight: 19, opacity: 0.8, textAlign: "center", marginTop: 6 },
  chipVersion: { marginTop: 14, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  versionChipText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 1.3, opacity: 0.9, marginTop: 6 },
  point: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  pointText: { flex: 1, fontSize: 13, lineHeight: 19 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 14, fontWeight: "700" },
  descRow: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  credits: { fontSize: 12, textAlign: "center", opacity: 0.75, marginTop: 8 },
});
