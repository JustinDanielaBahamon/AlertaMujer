import { View, Image, TouchableOpacity, Text, ImageSourcePropType } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../contexts/ThemeContext";
import { AppMode } from "../../../contexts/ThemeContext";
import { styles } from "./header.style";

// ─── Temporal: mismo logo para todos los temas ────────────────────────────────
// Cuando tengas los logos, reemplaza cada require con su imagen correspondiente
const logoActual = require("../../../../assets/imagesAlertaMujer/logoAlertaMujer.png");

const LOGOS: Record<AppMode, ImageSourcePropType> = {
  light:   logoActual,
  dark:    logoActual,   // → reemplazar por logo-dark.png
  rosa:    logoActual,   // → reemplazar por logo-rosa.png
  vino:    logoActual,   // → reemplazar por logo-vino.png
  fucsia:  logoActual,   // → reemplazar por logo-fucsia.png
  magenta: logoActual,   // → reemplazar por logo-magenta.png
};

export default function AppHeader() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBackground }]}>
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
      >
        <Text style={[styles.menuIcon, { color: theme.headerText }]}>☰</Text>
      </TouchableOpacity>

      {/* ✅ Logo cambia automáticamente con el tema */}
      <Image
        source={LOGOS[theme.mode]}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}