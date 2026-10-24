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
import { WEB_URL } from "../../constants/links";
import { useAuth } from "../../contexts/AuthContext";
import { getMe } from "../../services/users.service";
import { useTheme } from "../../contexts/ThemeContext";
import { useLocale } from "../../contexts/LocaleContext";
import { getDrawerStyles } from "./drawer.style";
import TabNavigator from "../TabNavigator";
import { getInitials } from "../../utils/initials";
import AjustesSubmenu from "../../features/settings/components/settingsComponent";

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

  // The profile photo is in the backend: fetched once per session if it is not there yet
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

  // Invites other people: the link goes to the website, where they can download the app
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
        CommonActions.navigate({ name: "Home", params: { screen: tabName } })
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

          {/* ✅ Tappable profile with the user's dynamic data */}
          <TouchableOpacity
            style={styles.zoneHeader}
            onPress={() => navigateTo("Profile")}
            activeOpacity={0.75}
          >
            <View style={styles.avatarRow}>
              {/* User's photo; without one, her initials (same as the profile screen) */}
              {user?.fotoPerfil ? (
                <Image
                  source={{ uri: user.fotoPerfil }}
                  style={[styles.avatar, { borderColor: accentLineColor }]}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarInitials,
                    { borderColor: accentLineColor, backgroundColor: theme.icon + "55" },
                  ]}
                >
                  <Text style={styles.avatarInitialsText}>{getInitials(user?.nombre ?? "")}</Text>
                </View>
              )}
            </View>
            <Text style={styles.name}>
              {user?.nombre || t.perfil.nombre_default}
            </Text>
            {!!user?.correo && <Text style={styles.email}>{user.correo}</Text>}
            <View style={[styles.accentLine, { backgroundColor: accentLineColor }]} />
          </TouchableOpacity>

          {/* Menu */}
          <View style={styles.menuList}>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateTo("DrawerHome")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="home-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.inicio}</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateToTab("Contacts")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="people-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.contactos}</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateToTab("History")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="time-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.historial}</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateTo("Trip")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="navigate-circle-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.trayecto}</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateTo("ReceivedAlerts")} activeOpacity={0.7}>
              <View style={[styles.circleIcon, { backgroundColor: cardIconBg }]}>
                <Ionicons name="notifications-circle-outline" size={20} color={cardIconColor} />
              </View>
              <Text style={styles.itemText}>{t.menu.alertas_recibidas}</Text>
              <Ionicons name="chevron-forward" size={16} color={cardIconColor} style={styles.chevron} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardItem} onPress={() => navigateTo("Permissions")} activeOpacity={0.7}>
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
      <Drawer.Screen name="Home" component={HeaderWithTabs} />
    </Drawer.Navigator>
  );
}