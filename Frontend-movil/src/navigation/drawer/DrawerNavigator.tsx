import React, { useState } from "react"; // 1. Agregamos useState
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import TabNavigator from "../TabNavigator";
import AppHeader from "../../components/ui/Header/header";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext"; 
import { useLocale } from "../../contexts/LocaleContext";
import { styles } from "../drawer/drawer.style";

// 2. Importamos el componente desde features (siguiendo tu patrón)
import AjustesSubmenu from "../../../features/settings/ajustesComponent";

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
  const { theme } = useTheme(); 
  
  // 3. Estado para controlar el menú tipo Facebook
  const [estaAbiertoAjustes, setEstaAbiertoAjustes] = useState(false);

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

      {/* 4. BOTÓN DESPLEGABLE TIPO FACEBOOK */}
      <DrawerItem
        label={estaAbiertoAjustes ? "🔽 Configuración" : "▶️ Configuración"}
        onPress={() => setEstaAbiertoAjustes(!estaAbiertoAjustes)}
      />

      {/* 5. MUESTRA EL SUBMENÚ SI ESTÁ ABIERTO */}
      {estaAbiertoAjustes && (
        <AjustesSubmenu navigation={props.navigation} />
      )}

      <View style={{ flex: 1 }} /> 

      <DrawerItem label="Cerrar sesión" onPress={() => signOut()} labelStyle={{ color: 'red' }}/>
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

