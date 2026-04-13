import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import TabNavigator from "./TabNavigator";
import AppHeader from "../components/ui/Header/header";
import { useAuth } from "../contexts/AuthContext";
// IMPORTANTE: Asegúrate de que estas rutas sean correctas
import { useTheme } from "../contexts/ThemeContext"; 
import { useLocale } from "../contexts/LocaleContext";

const Drawer = createDrawerNavigator();

function ContenidoConCabecera() {
  return (
    <View style={styles.drawerBody}>
      <AppHeader />
      <TabNavigator />
    </View>
  );
}

function ContenidoDrawerPersonalizado(props: DrawerContentComponentProps) {
  const { signOut, user } = useAuth();
  
  // SOLUCIÓN AL ERROR: Debemos definir estas variables aquí dentro
  const { theme, toggleTheme } = useTheme(); 
  const { locale, toggleLocale } = useLocale();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Alerta Mujer</Text>
        {user ? (
          <Text style={styles.drawerSubtitle} numberOfLines={1}>
            {user.correo}
          </Text>
        ) : null}
      </View>

      <DrawerItem
        label="Inicio (tabs)"
        onPress={() => props.navigation.navigate("Inicio")}
      />

      {/* CÓDIGO DE LAS ACCIONES RECUPERADO Y FUNCIONAL */}
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

      <DrawerItem label="Cerrar sesión" onPress={() => signOut()} />
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <ContenidoDrawerPersonalizado {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Inicio" component={ContenidoConCabecera} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerBody: {
    flex: 1,
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  drawerSubtitle: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.7,
  },
  // ESTILOS NECESARIOS PARA QUE NO DE ERROR
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 10
  },
  chip: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  chipText: {
    fontSize: 16
  }
});