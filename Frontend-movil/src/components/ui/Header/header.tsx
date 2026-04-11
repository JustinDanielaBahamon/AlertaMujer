import { View, Image, TouchableOpacity, Text, StyleSheet } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";

export default function AppHeader() {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useLocale();

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBackground }]}>
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
      >
        <Text style={[styles.menuIcon, { color: theme.headerText }]}>☰</Text>
      </TouchableOpacity>

      <Image
        source={require("../../../../assets/imagesAlertaMujer/logoAlertaMujer.png")}
        style={styles.logo}
      />

      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleTheme} style={styles.chip}>
          <Text style={[styles.chipText, { color: theme.headerText }]}>
            {theme.mode === "dark" ? "🌙" : "☀️"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLocale} style={styles.chip}>
          <Text style={[styles.chipText, { color: theme.headerText }]}>
            {locale === "es" ? "🌍 ES" : "🌍 EN"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 36,
  },
  menuIcon: {
    fontSize: 24,
  },
  logo: {
    width: 72,
    height: 72,
    resizeMode: "contain",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
