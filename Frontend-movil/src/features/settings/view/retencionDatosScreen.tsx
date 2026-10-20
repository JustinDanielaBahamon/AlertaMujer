import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WEB_URL } from "../../../constants/enlaces";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createAjustesPantallaStyles } from "../styles/ajustesPantalla.styles";

type IconoIon = React.ComponentProps<typeof Ionicons>["name"];

/** Cuánto tiempo se guarda cada tipo de dato y qué puede hacer la usuaria con ellos. */
export default function RetencionDatosScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLocale();
  const r = t.retencion;
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const accent = theme.icono;

  const plazos: { icono: IconoIon; titulo: string; plazo: string; desc: string }[] = [
    { icono: "navigate-outline", titulo: r.rutas_titulo, plazo: r.rutas_plazo, desc: r.rutas_desc },
    { icono: "location-outline", titulo: r.diaria_titulo, plazo: r.diaria_plazo, desc: r.diaria_desc },
    { icono: "videocam-outline", titulo: r.evidencias_titulo, plazo: r.evidencias_plazo, desc: r.evidencias_desc },
    { icono: "person-outline", titulo: r.perfil_titulo, plazo: r.perfil_plazo, desc: r.perfil_desc },
  ];

  const acciones: { icono: IconoIon; titulo: string; desc: string; onPress: () => void; externo?: boolean }[] = [
    { icono: "bookmark-outline", titulo: r.accion_conservar, desc: r.accion_conservar_desc, onPress: () => Linking.openURL(WEB_URL), externo: true },
    { icono: "mic-off-outline", titulo: r.accion_grabacion, desc: r.accion_grabacion_desc, onPress: () => navigation.navigate("Permisos") },
  ];

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>{r.titulo_header}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{r.intro}</Text>

        {/* Plazos: línea de tiempo con el tiempo de cada dato a la vista */}
        <View style={styles.tarjeta}>
          {plazos.map((p, i) => (
            <View key={p.titulo} style={local.paso}>
              <View style={local.columnaLinea}>
                <View style={[local.punto, { backgroundColor: accent }]}>
                  <Ionicons name={p.icono} size={16} color="#fff" />
                </View>
                {i < plazos.length - 1 && <View style={[local.linea, { backgroundColor: accent + "40" }]} />}
              </View>
              <View style={local.contenidoPaso}>
                <View style={local.filaTitulo}>
                  <Text style={[local.titulo, { color: theme.text }]}>{p.titulo}</Text>
                  <View style={[local.plazo, { backgroundColor: accent + "22", borderColor: accent + "55" }]}>
                    <Text style={[local.plazoTexto, { color: accent }]}>{p.plazo}</Text>
                  </View>
                </View>
                <Text style={[local.desc, { color: theme.text }]}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Qué puede hacer la usuaria */}
        <Text style={[local.seccion, { color: theme.headerText }]}>{r.seccion_control}</Text>
        <View style={styles.tarjeta}>
          {acciones.map((ac, i) => (
            <View key={ac.titulo}>
              {i > 0 && <View style={styles.divisor} />}
              <TouchableOpacity style={local.accion} onPress={ac.onPress} activeOpacity={0.7} accessibilityRole="button">
                <View style={[local.iconoAccion, { backgroundColor: accent + "25" }]}>
                  <Ionicons name={ac.icono} size={18} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[local.titulo, { color: theme.text }]}>{ac.titulo}</Text>
                  <Text style={[local.desc, { color: theme.text }]}>{ac.desc}</Text>
                </View>
                <Ionicons name={ac.externo ? "open-outline" : "chevron-forward"} size={16} color={accent} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={[styles.tarjeta, local.nota, { borderColor: accent }]}>
          <Ionicons name="lock-closed-outline" size={18} color={accent} />
          <Text style={[local.desc, { color: theme.text, flex: 1, marginTop: 0 }]}>{r.nota_cuenta}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  paso: { flexDirection: "row", gap: 12 },
  columnaLinea: { alignItems: "center", width: 32 },
  punto: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  linea: { width: 2, flex: 1, marginVertical: 4 },
  contenidoPaso: { flex: 1, paddingBottom: 18 },
  filaTitulo: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  titulo: { fontSize: 14, fontWeight: "700", flexShrink: 1 },
  plazo: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  plazoTexto: { fontSize: 11, fontWeight: "800" },
  desc: { fontSize: 12, lineHeight: 18, opacity: 0.78, marginTop: 4 },
  seccion: { fontSize: 11, fontWeight: "800", letterSpacing: 1.3, opacity: 0.9, marginTop: 6 },
  accion: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconoAccion: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  nota: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1.5 },
});
