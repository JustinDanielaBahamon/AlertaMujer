import { Ionicons } from "@expo/vector-icons";
import { View, Image, TouchableOpacity, Text } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { styles } from "./header.style";

/**
 * Top bar with the logo. Inside the drawer it shows the menu button; on screens outside it
 * (pushed on top, like adding a contact) it shows a back arrow, because the menu cannot open there.
 */
export default function AppHeader({ back = false }: { back?: boolean }) {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  const handleMenuPress = () => {
    try {
      navigation.dispatch(DrawerActions.toggleDrawer());
    } catch (error) {
      console.warn('No se puede toggleDrawer - pantalla no está en un Drawer Navigator');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBackground, paddingTop: insets.top + 10 }]}>
      {back ? (
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={28} color={theme.headerText} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleMenuPress}
          accessibilityRole="button"
          accessibilityLabel={t.menu.abrir_menu}
        >
          <Text style={[styles.menuIcon, { color: theme.headerText }]}>☰</Text>
        </TouchableOpacity>
      )}

      {/* ✅ theme.logo already has the right logo for the active theme */}
      <Image
        source={theme.logo}
        style={styles.logo}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
}