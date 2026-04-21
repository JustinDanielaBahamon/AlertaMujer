import {
  createDrawerNavigator,
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../../components/ui/Header/header";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";        // ← NUEVO
import { obtenerEstilosDrawer } from "../drawer/drawer.style"; // ← NUEVO
import TabNavigator from "../TabNavigator";
import AjustesSubmenu from "../../../features/settings/ajustesComponent";

const Drawer = createDrawerNavigator();

function ContenidoConCabecera() {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <TabNavigator />
    </View>
  );
}

function ContenidoDrawerPersonalizado(props: DrawerContentComponentProps) {
  const { signOut, user } = useAuth();
  const { theme } = useTheme();                          // ← leemos el tema
  const styles = obtenerEstilosDrawer(theme);            // ← estilos dinámicos
  const [estaAbiertoAjustes, setEstaAbiertoAjustes] = useState(false);

  // Colores del gradiente según el tema activo
  const gradientColors = getGradientColors(theme.headerBackground);

  const irA = (ruta: string) => {
    setEstaAbiertoAjustes(false);
    props.navigation.navigate(ruta as never);
  };

  return (
    <LinearGradient
      colors={gradientColors}   // ← gradiente dinámico
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.cardContainer}>
          <DrawerContentScrollView
            {...props}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <Image
                source={{ uri: "https://i.redd.it/f85dk8outnof1.png" }}
                style={styles.avatar}
              />
              <Text style={styles.name}>Isabella Quintero</Text>
              <Text style={styles.email}>
                {user?.correo || "Isabella@gmail.com"}
              </Text>
            </View>

            {/* MENÚ */}
            <View style={styles.innerCard}>
              <TouchableOpacity onPress={() => irA("Inicio")}>
                <Text style={styles.item}>🏡 Inicio</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => irA("Contactos")}>
                <Text style={styles.item}>📲 Contactos</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => irA("Historial")}>
                <Text style={styles.item}>📖 Historial</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEstaAbiertoAjustes(!estaAbiertoAjustes)}
              >
                <Text style={styles.item}>
                  🔧 Configuración {estaAbiertoAjustes ? "▼" : "▶"}
                </Text>
              </TouchableOpacity>

              {estaAbiertoAjustes && (
                <View style={{ paddingLeft: 15 }}>
                  <AjustesSubmenu navigation={props.navigation} />
                </View>
              )}
            </View>

            <View style={{ flex: 1 }} />

            {/* FOOTER */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.shareBtn}>
                <Text style={styles.btnText}>➤ Compartir Enlace</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                <Text style={styles.btnText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>

          </DrawerContentScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Genera los colores del gradiente a partir del color primario ─────────────
function getGradientColors(primary: string): [string, string] {
  // Oscurece ligeramente el color para el segundo stop del gradiente
  return [primary, primary + "cc"];
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