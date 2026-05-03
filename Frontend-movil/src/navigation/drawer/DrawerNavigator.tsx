import {
  createDrawerNavigator,
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../../components/ui/Header/header";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { obtenerEstilosDrawer } from "../drawer/drawer.style";
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
  const { theme } = useTheme();
  const styles = obtenerEstilosDrawer(theme);
  const [estaAbiertoAjustes, setEstaAbiertoAjustes] = useState(false);

  const irATab = (nombreTab: string) => {
    setEstaAbiertoAjustes(false);
    props.navigation.closeDrawer();
    setTimeout(() => {
      props.navigation.dispatch(
        CommonActions.navigate({ name: "Inicio", params: { screen: nombreTab } })
      );
    }, 250);
  };

  const irA = (ruta: string) => {
    setEstaAbiertoAjustes(false);
    props.navigation.navigate(ruta as never);
  };

  return (
    <View style={styles.drawerFondo}>
      <SafeAreaView style={{ flex: 1 }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >

          {/* heater centrado */}
          <View style={styles.headerZona}>
            <View style={styles.avatarFila}>
              <Image
                source={{ uri: "https://i.redd.it/f85dk8outnof1.png" }}
                style={[styles.avatar, { borderColor: theme.icono }]}
              />
            </View>
            <Text style={styles.nombre}>Isabella Quintero</Text>
            <Text style={styles.correo}>{user?.correo || "isabella@gmail.com"}</Text>
            <View style={[styles.lineaAccento, { backgroundColor: theme.icono }]} />
          </View>

          {/* opciones del menu */}
          <View style={styles.listaMenu}>

            <TouchableOpacity style={styles.tarjetaItem} onPress={() => irA("Inicio")} activeOpacity={0.7}>
              <View style={[styles.iconoCirculo, { backgroundColor: theme.icono + "22" }]}>
                <Ionicons name="home-outline" size={20} color={theme.icono} />
              </View>
              <Text style={[styles.textoItem, { color: theme.text }]}>Inicio</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.icono} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.tarjetaItem} onPress={() => irATab("Contactos")} activeOpacity={0.7}>
              <View style={[styles.iconoCirculo, { backgroundColor: theme.icono + "22" }]}>
                <Ionicons name="people-outline" size={20} color={theme.icono} />
              </View>
              <Text style={[styles.textoItem, { color: theme.text }]}>Contactos</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.icono} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.tarjetaItem} onPress={() => irATab("Historial")} activeOpacity={0.7}>
              <View style={[styles.iconoCirculo, { backgroundColor: theme.icono + "22" }]}>
                <Ionicons name="time-outline" size={20} color={theme.icono} />
              </View>
              <Text style={[styles.textoItem, { color: theme.text }]}>Historial</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.icono} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tarjetaItem}
              onPress={() => setEstaAbiertoAjustes(!estaAbiertoAjustes)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconoCirculo, { backgroundColor: theme.icono + "22" }]}>
                <Ionicons name="settings-outline" size={20} color={theme.icono} />
              </View>
              <Text style={[styles.textoItem, { color: theme.text }]}>Configuración</Text>
              <Ionicons
                name={estaAbiertoAjustes ? "chevron-down" : "chevron-forward"}
                size={16}
                color={theme.icono}
                style={styles.chevron}
              />
            </TouchableOpacity>

            {estaAbiertoAjustes && (
              <View style={styles.submenuContenedor}>
                <AjustesSubmenu navigation={props.navigation} />
              </View>
            )}

          </View>

          <View style={{ flex: 1, minHeight: 24 }} />

          {/*  footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btnCompartir, { backgroundColor: theme.headercolor1 }]}
              activeOpacity={0.8}
            >
              <View style={styles.btnInterior}>
                <View style={styles.btnIconoFondo}>
                  <Ionicons name="share-social-outline" size={20} color={theme.headerText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.btnTitulo, { color: theme.headerText }]}>Compartir Enlace</Text>
                  <Text style={[styles.btnSubtitulo, { color: theme.headerText }]}>Invita a otras mujeres a unirse</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.headerText} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnCerrar, { backgroundColor: theme.headercolor2 }]}
              onPress={signOut}
              activeOpacity={0.8}
            >
              <View style={styles.btnInterior}>
                <View style={styles.btnIconoFondo}>
                  <Ionicons name="log-out-outline" size={20} color={theme.headerText} />
                </View>
                <Text style={[styles.btnTitulo, { flex: 1, color: theme.headerText }]}>Cerrar sesión</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.headerText} />
              </View>
            </TouchableOpacity>

            {/* Branding */}
            <View style={styles.branding}>
              <Ionicons name="shield-checkmark-outline" size={22} color={theme.icono} />
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.brandingNombre, { color: theme.icono }]}>Alerta Mujer</Text>
                <Text style={[styles.brandingSlogan, { color: theme.icono }]}>Juntas somos más fuertes</Text>
              </View>
              <Ionicons name="heart" size={14} color={theme.icono} style={{ marginLeft: 8 }} />
            </View>
          </View>

        </DrawerContentScrollView>
      </SafeAreaView>
    </View>
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