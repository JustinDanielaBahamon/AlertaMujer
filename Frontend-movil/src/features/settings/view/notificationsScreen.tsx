import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createSettingsScreenStyles } from "../styles/settingsScreen.styles";
import { useNotificationsViewModel } from "../viewModel/useNotificationsViewModel";

type IonIcon = React.ComponentProps<typeof Ionicons>["name"];

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const vm = useNotificationsViewModel();
  const n = t.notificaciones;
  const accent = theme.icon;

  // Tarjeta de estado: lo que el celular debe permitir para que la alarma llegue
  const renderStatus = (
    icon: IonIcon,
    title: string,
    ready: boolean | null,
    okText: string,
    missingText: string,
    onActivatePress: () => void,
    opensSettings = false,
  ) => (
    <View style={[styles.card, ready === false && { borderColor: accent, borderWidth: 1.5 }]}>
      <View style={styles.titleRow}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={accent} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {ready !== null && (
          <View style={[local.chip, { borderColor: accent }, ready && { backgroundColor: accent }]}>
            {ready && <Ionicons name="checkmark" size={12} color="#fff" />}
            <Text style={[local.chipText, { color: ready ? "#fff" : accent }]}>{ready ? n.activo : n.falta}</Text>
          </View>
        )}
      </View>
      <Text style={styles.description}>{ready === false ? missingText : okText}</Text>
      {ready === false && (
        <TouchableOpacity onPress={onActivatePress} style={[local.button, { backgroundColor: accent }]} accessibilityRole="button">
          <Ionicons name={opensSettings ? "settings-outline" : "checkmark-circle-outline"} size={16} color="#fff" />
          <Text style={local.buttonText}>{opensSettings ? n.abrir_ajustes : n.activar}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const types: { icon: IonIcon; title: string; desc: string; badge: string }[] = [
    { icon: "alert-circle-outline", title: n.tipo_sos_titulo, desc: n.tipo_sos_desc, badge: n.badge_siempre },
    { icon: "checkmark-done-outline", title: n.tipo_fin_titulo, desc: n.tipo_fin_desc, badge: n.badge_siempre },
    { icon: "timer-outline", title: n.tipo_agitar_titulo, desc: n.tipo_agitar_desc, badge: n.badge_agitar },
    { icon: "phone-portrait-outline", title: n.tipo_cuenta_titulo, desc: n.tipo_cuenta_desc, badge: n.badge_seguridad },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      <View style={styles.header}>
        <TouchableOpacity onPress={vm.goBack} style={styles.returnBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>{n.titulo_header}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{n.intro}</Text>

        {renderStatus("notifications-outline", n.permiso_titulo, vm.permission, n.permiso_ok, n.permiso_falta, vm.grantPermission)}
        {renderStatus(
          "expand-outline",
          n.pantalla_titulo,
          vm.fullScreen,
          n.pantalla_ok,
          n.pantalla_falta,
          vm.enableFullScreen,
          true,
        )}

        {/* Tipos de aviso: las emergencias no se pueden silenciar */}
        <Text style={[local.section, { color: theme.headerText }]}>{n.seccion_tipos}</Text>
        <View style={styles.card}>
          {types.map((type, i) => (
            <View key={type.title}>
              {i > 0 && <View style={styles.divisor} />}
              <View style={local.typeRow}>
                <View style={[local.typeIcon, { backgroundColor: accent + "25" }]}>
                  <Ionicons name={type.icon} size={18} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={local.typeTitleRow}>
                    <Text style={[local.typeTitle, { color: theme.text }]}>{type.title}</Text>
                    <View style={[local.badge, { backgroundColor: accent + "20" }]}>
                      <Text style={[local.badgeText, { color: accent }]}>{type.badge}</Text>
                    </View>
                  </View>
                  <Text style={[local.typeDesc, { color: theme.text }]}>{type.desc}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={[local.section, { color: theme.headerText }]}>{n.seccion_preferencias}</Text>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="pulse-outline" size={22} color={accent} />
            </View>
            <Text style={styles.title}>{n.vibracion}</Text>
            <Switch
              value={vm.config.vibracion}
              onValueChange={vm.setVibration}
              trackColor={{ false: "#ccc", true: theme.tabActiveColor }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.description}>{n.vibracion_desc}</Text>

          <View style={styles.divisor} />
          <TouchableOpacity onPress={vm.test} style={local.actionRow} accessibilityRole="button">
            <Ionicons name="paper-plane-outline" size={18} color={accent} />
            <Text style={[local.actionTextValue, { color: theme.text }]}>{n.probar}</Text>
            <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
          </TouchableOpacity>
          <View style={styles.divisor} />
          <TouchableOpacity onPress={vm.openAdvanced} style={local.actionRow} accessibilityRole="button">
            <Ionicons name="options-outline" size={18} color={accent} />
            <Text style={[local.actionTextValue, { color: theme.text }]}>{n.avanzado}</Text>
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
  chipText: { fontSize: 11, fontWeight: "800" },
  button: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 1.3, opacity: 0.9, marginTop: 6 },
  typeRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  typeIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  typeTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  typeTitle: { fontSize: 14, fontWeight: "700" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  typeDesc: { fontSize: 12, lineHeight: 17, opacity: 0.75, marginTop: 3 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  actionTextValue: { flex: 1, fontSize: 14, fontWeight: "600" },
});
