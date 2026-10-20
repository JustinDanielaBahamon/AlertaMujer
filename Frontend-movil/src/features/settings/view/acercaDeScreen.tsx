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
import { createAjustesPantallaStyles } from "../styles/ajustesPantalla.styles";

type IconoIon = React.ComponentProps<typeof Ionicons>["name"];

/** Acerca de: qué es la app, cómo cuida tu información y sus documentos legales. */
export default function AcercaDeScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLocale();
  const a = t.acercaDe;
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const accent = theme.icono;

  // Se lee de "version" en app.json
  const version = Constants.expoConfig?.version ?? "-";

  const filaEnlace = (icono: IconoIon, titulo: string, desc: string | null, onPress: () => void, externo = false) => (
    <TouchableOpacity style={local.fila} activeOpacity={0.7} onPress={onPress} accessibilityRole="button">
      <View style={[local.iconoFila, { backgroundColor: accent + "25" }]}>
        <Ionicons name={icono} size={18} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[local.tituloFila, { color: theme.text }]}>{titulo}</Text>
        {desc && <Text style={[local.descFila, { color: theme.text }]}>{desc}</Text>}
      </View>
      <Ionicons name={externo ? "open-outline" : "chevron-forward"} size={16} color={accent} />
    </TouchableOpacity>
  );

  const puntosPrivacidad: { icono: IconoIon; texto: string }[] = [
    { icono: "hand-left-outline", texto: a.privacidad_punto_venta },
    { icono: "videocam-outline", texto: a.privacidad_punto_grabacion },
    { icono: "time-outline", texto: a.privacidad_punto_borrado },
  ];

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>{a.titulo_header}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Presentación de la app */}
        <View style={[styles.tarjeta, { padding: 0, overflow: "hidden" }]}>
          <LinearGradient colors={[accent + "30", accent + "08"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={local.hero}>
            <Image source={require("../../../../assets/images/icon.png")} style={local.logo} />
            <Text style={[local.nombre, { color: theme.text }]}>AlertaMujer</Text>
            <Text style={[local.lema, { color: theme.text }]}>{a.descripcion}</Text>
            <View style={[local.chipVersion, { backgroundColor: accent }]}>
              <Text style={local.chipVersionTexto}>
                {a.version} {version}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Privacidad */}
        <Text style={[local.seccion, { color: theme.headerText }]}>{a.seccion_privacidad}</Text>
        <View style={styles.tarjeta}>
          {puntosPrivacidad.map((p) => (
            <View key={p.icono} style={local.punto}>
              <Ionicons name={p.icono} size={18} color={accent} />
              <Text style={[local.textoPunto, { color: theme.text }]}>{p.texto}</Text>
            </View>
          ))}
          <View style={styles.divisor} />
          {filaEnlace("server-outline", a.retencion_titulo, a.retencion_desc, () => navigation.navigate("RetencionDatos"))}
          <View style={styles.divisor} />
          {filaEnlace("shield-checkmark-outline", a.politica_privacidad, null, () => navigation.navigate("PoliticaPrivacidad"))}
          <View style={styles.divisor} />
          {filaEnlace("document-text-outline", a.terminos, null, () => navigation.navigate("PoliticaTerminos"))}
        </View>

        {/* La app en la web */}
        <Text style={[local.seccion, { color: theme.headerText }]}>{a.seccion_app}</Text>
        <View style={styles.tarjeta}>
          {filaEnlace("globe-outline", a.web, a.web_desc, () => Linking.openURL(WEB_URL), true)}
        </View>

        <Text style={[local.creditos, { color: theme.headerText }]}>{a.proyecto}</Text>
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  hero: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 20 },
  logo: { width: 76, height: 76, borderRadius: 20 },
  nombre: { fontSize: 22, fontWeight: "800", marginTop: 12 },
  lema: { fontSize: 13, lineHeight: 19, opacity: 0.8, textAlign: "center", marginTop: 6 },
  chipVersion: { marginTop: 14, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  chipVersionTexto: { color: "#fff", fontSize: 12, fontWeight: "700" },
  seccion: { fontSize: 11, fontWeight: "800", letterSpacing: 1.3, opacity: 0.9, marginTop: 6 },
  punto: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  textoPunto: { flex: 1, fontSize: 13, lineHeight: 19 },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconoFila: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  tituloFila: { fontSize: 14, fontWeight: "700" },
  descFila: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  creditos: { fontSize: 12, textAlign: "center", opacity: 0.75, marginTop: 8 },
});
