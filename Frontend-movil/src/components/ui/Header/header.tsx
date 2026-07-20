import { View, Image, TouchableOpacity, Text } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { styles } from "./header.style";

export default function AppHeader() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useLocale();

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBackground }]}>
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        accessibilityRole="button"
        accessibilityLabel={t.menu.abrir_menu}
      >
        <Text style={[styles.menuIcon, { color: theme.headerText }]}>☰</Text>
      </TouchableOpacity>

      {/* ✅ theme.logo ya trae el logo correcto según el tema activo */}
      <Image
        source={theme.logo}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}