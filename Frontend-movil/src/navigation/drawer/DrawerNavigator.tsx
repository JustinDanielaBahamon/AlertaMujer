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
import { styles } from "../drawer/drawer.style";
import TabNavigator from "../TabNavigator";

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
  const [estaAbiertoAjustes, setEstaAbiertoAjustes] = useState(false);

  const irA = (ruta: string) => {
    setEstaAbiertoAjustes(false);
    props.navigation.navigate(ruta as never);
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <LinearGradient colors={["#bc9ce0d2", "#bc9ce0d2"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* TARJETA PRINCIPAL */}
        <View style={styles.cardContainer}>
          <DrawerContentScrollView
            {...props}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <Image
                source={{
                  uri: "https://i.redd.it/f85dk8outnof1.png",
                }}
                style={styles.avatar}
              />
              <Text style={styles.name}>
                Isabella Quintero
              </Text>
              <Text style={styles.email}>
                {user?.correo || "Isabella@gmail.com"}
              </Text>
            </View>

            {/* MENÚ EN CUADRO */}
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

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.btnText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </DrawerContentScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
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
