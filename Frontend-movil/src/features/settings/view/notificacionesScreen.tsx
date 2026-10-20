import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createAjustesPantallaStyles } from "../styles/ajustesPantalla.styles";
import { useNotificacionesViewModel } from "../viewModel/useNotificacionesViewModel";

type IconoIon = React.ComponentProps<typeof Ionicons>["name"];

export default function NotificacionesScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const vm = useNotificacionesViewModel();
  const n = t.notificaciones;
  const accent = theme.icono;

  // Tarjeta de estado: lo que el celular debe permitir para que la alarma llegue
  const renderEstado = (
    icono: IconoIon,
    titulo: string,
    listo: boolean | null,
    textoOk: string,
    textoFalta: string,
    onActivar: () => void,
    abreAjustes = false,
  ) => (
    <View style={[styles.tarjeta, listo === false && { borderColor: accent, borderWidth: 1.5 }]}>
      <View style={styles.filaTitulo}>
        <View style={styles.iconoWrap}>
          <Ionicons name={icono} size={22} color={accent} />
        </View>
        <Text style={styles.titulo}>{titulo}</Text>
        {listo !== null && (
          <View style={[local.chip, { borderColor: accent }, listo && { backgroundColor: accent }]}>
            {listo && <Ionicons name="checkmark" size={12} color="#fff" />}
            <Text style={[local.chipTexto, { color: listo ? "#fff" : accent }]}>{listo ? n.activo : n.falta}</Text>
          </View>
        )}
      </View>
      <Text style={styles.descripcion}>{listo === false ? textoFalta : textoOk}</Text>
      {listo === false && (
        <TouchableOpacity onPress={onActivar} style={[local.boton, { backgroundColor: accent }]} accessibilityRole="button">
          <Ionicons name={abreAjustes ? "settings-outline" : "checkmark-circle-outline"} size={16} color="#fff" />
          <Text style={local.botonTexto}>{abreAjustes ? n.abrir_ajustes : n.activar}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const tipos: { icono: IconoIon; titulo: string; desc: string; badge: string }[] = [
    { icono: "alert-circle-outline", titulo: n.tipo_sos_titulo, desc: n.tipo_sos_desc, badge: n.badge_siempre },
    { icono: "checkmark-done-outline", titulo: n.tipo_fin_titulo, desc: n.tipo_fin_desc, badge: n.badge_siempre },
    { icono: "timer-outline", titulo: n.tipo_agitar_titulo, desc: n.tipo_agitar_desc, badge: n.badge_agitar },
    { icono: "phone-portrait-outline", titulo: n.tipo_cuenta_titulo, desc: n.tipo_cuenta_desc, badge: n.badge_seguridad },
  ];

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      <View style={styles.header}>
        <TouchableOpacity onPress={vm.volver} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>{n.titulo_header}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{n.intro}</Text>

        {renderEstado("notifications-outline", n.permiso_titulo, vm.permiso, n.permiso_ok, n.permiso_falta, vm.activarPermiso)}
        {renderEstado(
          "expand-outline",
          n.pantalla_titulo,
          vm.pantallaCompleta,
          n.pantalla_ok,
          n.pantalla_falta,
          vm.activarPantallaCompleta,
          true,
        )}

        {/* Tipos de aviso: las emergencias no se pueden silenciar */}
        <Text style={[local.seccion, { color: theme.headerText }]}>{n.seccion_tipos}</Text>
        <View style={styles.tarjeta}>
          {tipos.map((tipo, i) => (
            <View key={tipo.titulo}>
              {i > 0 && <View style={styles.divisor} />}
              <View style={local.filaTipo}>
                <View style={[local.iconoTipo, { backgroundColor: accent + "25" }]}>
                  <Ionicons name={tipo.icono} size={18} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={local.filaTituloTipo}>
                    <Text style={[local.tituloTipo, { color: theme.text }]}>{tipo.titulo}</Text>
                    <View style={[local.badge, { backgroundColor: accent + "20" }]}>
                      <Text style={[local.badgeTexto, { color: accent }]}>{tipo.badge}</Text>
                    </View>
                  </View>
                  <Text style={[local.descTipo, { color: theme.text }]}>{tipo.desc}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={[local.seccion, { color: theme.headerText }]}>{n.seccion_preferencias}</Text>
        <View style={styles.tarjeta}>
          <View style={styles.filaTitulo}>
            <View style={styles.iconoWrap}>
              <Ionicons name="pulse-outline" size={22} color={accent} />
            </View>
            <Text style={styles.titulo}>{n.vibracion}</Text>
            <Switch
              value={vm.config.vibracion}
              onValueChange={vm.cambiarVibracion}
              trackColor={{ false: "#ccc", true: theme.tabActiveColor }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.descripcion}>{n.vibracion_desc}</Text>

          <View style={styles.divisor} />
          <TouchableOpacity onPress={vm.probar} style={local.filaAccion} accessibilityRole="button">
            <Ionicons name="paper-plane-outline" size={18} color={accent} />
            <Text style={[local.textoAccion, { color: theme.text }]}>{n.probar}</Text>
            <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
          </TouchableOpacity>
          <View style={styles.divisor} />
          <TouchableOpacity onPress={vm.abrirAvanzado} style={local.filaAccion} accessibilityRole="button">
            <Ionicons name="options-outline" size={18} color={accent} />
            <Text style={[local.textoAccion, { color: theme.text }]}>{n.avanzado}</Text>
            <Ionicons name="open-outline" size={15} color={theme.tabActiveColor} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipTexto: { fontSize: 11, fontWeight: "800" },
  boton: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  botonTexto: { color: "#fff", fontWeight: "700", fontSize: 13 },
  seccion: { fontSize: 11, fontWeight: "800", letterSpacing: 1.3, opacity: 0.9, marginTop: 6 },
  filaTipo: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  iconoTipo: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  filaTituloTipo: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  tituloTipo: { fontSize: 14, fontWeight: "700" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeTexto: { fontSize: 10, fontWeight: "800" },
  descTipo: { fontSize: 12, lineHeight: 17, opacity: 0.75, marginTop: 3 },
  filaAccion: { flexDirection: "row", alignItems: "center", gap: 10 },
  textoAccion: { flex: 1, fontSize: 14, fontWeight: "600" },
});
