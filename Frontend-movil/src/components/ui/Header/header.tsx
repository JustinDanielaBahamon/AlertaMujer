import { View, Image, TouchableOpacity, Text } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { styles } from "./header.style";

export default function AppHeader() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBackground, paddingTop: insets.top + 10 }]}>
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