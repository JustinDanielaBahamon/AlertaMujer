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

function HeaderWithTabs() {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <TabNavigator />
    </View>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { signOut, user } = useAuth();
  const { theme } = useTheme();
  const styles = obtenerEstilosDrawer(theme);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isDarkMode = theme.mode === "dark";

  // rosa, vino, magenta, Azul → iconos BLANCOS sobre círculo de color
  // light, dark → iconos MORADOS (theme.icono)
  const whiteIconThemes = ["rosa", "vino", "magenta", "Azul"];
  const cardIconColor = whiteIconThemes.includes(theme.mode) ? "#ffffff" : theme.icono;
  const cardIconBg    = whiteIconThemes.includes(theme.mode)
    ? theme.icono + "cc"
    : theme.icono + "22";

  // Botón Compartir: blanco con texto del tema o invertido en dark
  const shareButtonBg   = isDarkMode ? theme.icono : "#ffffff";
  const shareButtonText = isDarkMode ? "#ffffff" : theme.icono;

  // Botón Cerrar sesión: siempre headercolor2 con texto blanco
  const logoutButtonBg   = theme.headercolor2;
  const logoutButtonText = "#ffffff";

  // Línea de acento y borde avatar blancos en: dark, vino, Azul, magenta, rosa
  // Solo "light" usa el color icono del tema
  const whiteAccentThemes = ["dark", "vino", "Azul", "magenta", "rosa"];
  const accentLineColor = whiteAccentThemes.includes(theme.mode) ? "#ffffff" : theme.icono;

  const navigateToTab = (tabName: string) => {
    setIsSettingsOpen(false);
    props.navigation.closeDrawer();
    setTimeout(() => {
      props.navigation.dispatch(
        CommonActions.navigate({ name: "Inicio", params: { screen: tabName } })
      );
    }, 250);
  };

  const navigateTo = (route: string) => {
    setIsSettingsOpen(false);
    props.navigation.navigate(route as never);
  };

  return (
    <View style={styles.drawerFondo}>
      <SafeAreaView style={{ flex: 1 }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >

          {/* Perfil: mismo fondo que el drawer, sin capa diferente */}
          <View style={styles.headerZona}>
            <View style={styles.avatarFila}>
              <Image
                source={{ uri: "https://i.redd.it/f85dk8outnof1.png" }}
                style={[styles.avatar, { borderColor: accentLineColor }]}
              />
            </View>
            <Text style={styles.nombre}>Isabella Quintero</Text>
            <Text style={styles.correo}>{user?.correo || "isabella@gmail.com"}</Text>
            <View style={[styles.lineaAccento, { backgroundColor: accentLineColor }]} />
          </View>

          {/* Menú: tarjetas blancas (o translúcidas en dark) */}
          <View style={styles.listaMenu}>

            <TouchableOpacity style={styles.tarjetaItem} onPress={() => navigateTo("Inicio")} activeOpacity={0.7}>
              <View style={[styles.iconoCirculo, { backgroundColor: cardIconBg }]}>
                <Ionicons name="home-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.textoItem}>Inicio</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.tarjetaItem} onPress={() => navigateToTab("Contactos")} activeOpacity={0.7}>
              <View style={[styles.iconoCirculo, { backgroundColor: cardIconBg }]}>
                <Ionicons name="people-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.textoItem}>Contactos</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.tarjetaItem} onPress={() => navigateToTab("Historial")} activeOpacity={0.7}>
              <View style={[styles.iconoCirculo, { backgroundColor: cardIconBg }]}>
                <Ionicons name="time-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.textoItem}>Historial</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tarjetaItem}
              onPress={() => setIsSettingsOpen(!isSettingsOpen)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconoCirculo, { backgroundColor: cardIconBg }]}>
                <Ionicons name="settings-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.textoItem}>Configuración</Text>
              <Ionicons
                name={isSettingsOpen ? "chevron-down" : "chevron-forward"}
                size={16}
                color={cardIconColor}
                style={styles.chevron}
              />
            </TouchableOpacity>

            {isSettingsOpen && (
              <View style={styles.submenuContenedor}>
                <AjustesSubmenu navigation={props.navigation} />
              </View>
            )}

          </View>

          <View style={{ flex: 1, minHeight: 24 }} />

          {/* Footer */}
          <View style={styles.footer}>

            {/* Botón Compartir */}
            <TouchableOpacity
              style={[styles.btnCompartir, { backgroundColor: shareButtonBg }]}
              activeOpacity={0.8}
            >
              <View style={styles.btnInterior}>
                <View style={[styles.btnIconoFondo, {
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.25)" : theme.icono + "22"
                }]}>
                  <Ionicons name="share-social-outline" size={20} color={shareButtonText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.btnTitulo, { color: shareButtonText }]}>Compartir Enlace</Text>
                  <Text style={[styles.btnSubtitulo, { color: shareButtonText }]}>Invita a otras mujeres a unirse</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={shareButtonText} />
              </View>
            </TouchableOpacity>

            {/* Botón Cerrar sesión */}
            <TouchableOpacity
              style={[styles.btnCerrar, { backgroundColor: logoutButtonBg }]}
              onPress={signOut}
              activeOpacity={0.8}
            >
              <View style={styles.btnInterior}>
                <View style={[styles.btnIconoFondo, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                  <Ionicons name="log-out-outline" size={20} color={logoutButtonText} />
                </View>
                <Text style={[styles.btnTitulo, { flex: 1, color: logoutButtonText }]}>Cerrar sesión</Text>
                <Ionicons name="chevron-forward" size={16} color={logoutButtonText} />
              </View>
            </TouchableOpacity>

            {/* Branding */}
            <View style={styles.branding}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.headerText} />
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.brandingNombre, { color: theme.headerText }]}>Alerta Mujer</Text>
                <Text style={[styles.brandingSlogan, { color: theme.headerText }]}>Juntas somos más fuertes</Text>
              </View>
              <Ionicons name="heart" size={14} color={theme.headerText} style={{ marginLeft: 8 }} />
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
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Inicio" component={HeaderWithTabs} />
    </Drawer.Navigator>
  );
}