import {
  createDrawerNavigator,
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, Share, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../../components/ui/Header/header";
import { WEB_URL } from "../../constants/enlaces";
import { useAuth } from "../../contexts/AuthContext";
import { getMe } from "../../services/users.service";
import { useTheme } from "../../contexts/ThemeContext";
import { useLocale } from "../../contexts/LocaleContext";
import { getDrawerStyles } from "../drawer/drawer.style";
import TabNavigator from "../TabNavigator";
import AjustesSubmenu from "../../features/settings/components/ajustesComponent";

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
  const { signOut, user, updateUser } = useAuth();
  const { theme } = useTheme();

  // La foto de perfil está en el backend: se trae una vez por sesión si aún no se tiene
  const userId = user?.id;
  const hasPhoto = !!user?.fotoPerfil;
  useEffect(() => {
    if (!userId || hasPhoto) return;
    getMe()
      .then((me) => {
        if (me.profilePhoto) updateUser({ fotoPerfil: me.profilePhoto });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  const { t } = useLocale();
  const styles = getDrawerStyles(theme);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isDarkMode = theme.mode === "dark";

  // Invita a otras personas: el enlace lleva a la web, donde pueden descargar la app
  const shareLink = () => {
    Share.share({ message: `${t.menu.compartir_mensaje}\n${WEB_URL}` }).catch(() => {});
  };

  const whiteIconThemes = ["rosa", "vino", "magenta", "Azul"];
  const cardIconColor = whiteIconThemes.includes(theme.mode) ? "#ffffff" : theme.icon;
  const cardIconBg    = whiteIconThemes.includes(theme.mode)
    ? theme.icon + "cc"
    : theme.icon + "22";

  const shareButtonBg   = isDarkMode ? theme.icon : "#ffffff";
  const shareButtonText = isDarkMode ? "#ffffff" : theme.icon;

  const logoutButtonBg   = theme.headercolor2;
  const logoutButtonText = "#ffffff";

  const whiteAccentThemes = ["dark", "vino", "Azul", "magenta", "rosa"];
  const accentLineColor = whiteAccentThemes.includes(theme.mode) ? "#ffffff" : theme.icon;

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
    props.navigation.closeDrawer();
    setTimeout(() => {
      props.navigation.getParent()?.navigate(route as never);
    }, 250);
  };

  return (
    <View style={styles.drawerBackground}>
      <SafeAreaView style={{ flex: 1 }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >

          {/* ✅ Perfil tappable con datos dinámicos del usuario */}
          <TouchableOpacity
            style={styles.zoneHeader}
            onPress={() => navigateTo("Perfil")}
            activeOpacity={0.75}
          >
            <View style={styles.avatarRow}>
              {/* ✅ Foto dinámica: usa la del usuario o la imagen por defecto */}
              <Image
                source={
                  user?.fotoPerfil
                    ? { uri: user.fotoPerfil }
                    : { uri: "https://i.redd.it/f85dk8outnof1.png" }
                }
                style={[styles.avatar, { borderColor: accentLineColor }]}
              />
            </View>
            {/* ✅ Nombre dinámico */}
            <Text style={styles.name}>
              {user?.nombre || "Isabella Quintero"}
            </Text>
            {/* ✅ Correo dinámico */}
            <Text style={styles.email}>
              {user?.correo || "isabella@gmail.com"}
            </Text>
            <View style={[styles.accentLine, { backgroundColor: accentLineColor }]} />
          </TouchableOpacity>

          {/* Menú */}
          <View style={styles.menuList}>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateTo("DrawerHome")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="home-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.inicio}</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateToTab("Contactos")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="people-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.contactos}</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateToTab("Historial")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="time-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.historial}</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateTo("Trayecto")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="navigate-circle-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.trayecto}</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateTo("AlertasRecibidas")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="notifications-circle-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.alertas_recibidas}</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateTo("Permisos")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>Permisos y protección</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => setIsSettingsOpen(!isSettingsOpen)}
              activeOpacity={0.7}
            >
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="settings-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.configuracion}</Text>
              <Ionicons
                name={isSettingsOpen ? "chevron-down" : "chevron-forward"}
                size={16}
                color={cardIconColor}
                style={styles.chevron}
              />
            </TouchableOpacity>

            {isSettingsOpen && (
              <View style={styles.submenuContainer}>
                <AjustesSubmenu navigation={props.navigation} />
              </View>
            )}

          </View>

          <View style={{ flex: 1, minHeight: 24 }} />

          {/* Footer */}
          <View style={styles.footer}>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: shareButtonBg }]}
              activeOpacity={0.8}
              onPress={shareLink}
            >
              <View style={styles.btnInner}>
                <View style={[styles.btnIconBackground, {
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.25)" : theme.icon + "22"
                }]}>
                  <Ionicons name="share-social-outline" size={20} color={shareButtonText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.btnTitle, { color: shareButtonText }]}>{t.menu.compartir_titulo}</Text>
                  <Text style={[styles.btnSubtitle, { color: shareButtonText }]}>{t.menu.compartir_desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={shareButtonText} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: logoutButtonBg }]}
              onPress={signOut}
              activeOpacity={0.8}
            >
              <View style={styles.btnInner}>
                <View style={[styles.btnIconBackground, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                  <Ionicons name="log-out-outline" size={20} color={logoutButtonText} />
                </View>
                <Text style={[styles.btnTitle, { flex: 1, color: logoutButtonText }]}>{t.menu.cerrar_sesion}</Text>
                <Ionicons name="chevron-forward" size={16} color={logoutButtonText} />
              </View>
            </TouchableOpacity>

            <View style={styles.branding}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.headerText} />
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.brandingName, { color: theme.headerText }]}>Alerta Mujer</Text>
                <Text style={[styles.brandingSlogan, { color: theme.headerText }]}>{t.menu.slogan}</Text>
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