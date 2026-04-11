import { View, StyleSheet, Text } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import TabNavigator from "./TabNavigator";
import AppHeader from "../components/ui/Header/header";
import { useAuth } from "../contexts/AuthContext";

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
});
