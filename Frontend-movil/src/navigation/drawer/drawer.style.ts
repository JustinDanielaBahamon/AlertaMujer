import { StyleSheet } from "react-native";
import { AppTheme } from "../../contexts/ThemeContext";

export const getDrawerStyles = (theme: AppTheme) => {

  const isDarkMode = theme.mode === "dark";

  // Dark mode → dark translucent cards, light text
  // Other themes → WHITE cards, always dark text for maximum contrast
  const cardBg     = isDarkMode ? "rgba(255,255,255,0.10)" : "#ffffff";
  const cardBorder  = isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";
  const cardText  = isDarkMode ? "#ffffff" : "#1a1a1a";

  // Icons inside the circle: in dark mode it uses theme.icono, in light mode too
  const iconColor = theme.icon;

  return StyleSheet.create({

    // Background = exactly headerBackground, with no layers on top
    drawerBackground: {
      flex: 1,
      backgroundColor: theme.headerBackground,
    },

    // Profile area = same headerBackground, no different backgroundColor
    zoneHeader: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 24,
      alignItems: "center",
      // NO backgroundColor so it matches the drawer background
    },

    backgroundDecoration: {
      position: "absolute",
      right: -20,
      top: -10,
      zIndex: 0,
    },

    avatarRow: {
      alignItems: "center",
      marginBottom: 12,
    },

    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 3,
      // inline borderColor: theme.icono
    },

    avatarInitials: {
      alignItems: "center",
      justifyContent: "center",
    },

    avatarInitialsText: {
      color: "#ffffff",
      fontSize: 26,
      fontWeight: "700",
    },

    name: {
      color: theme.headerText,
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      zIndex: 1,
    },

    email: {
      color: theme.headerText,
      fontSize: 13,
      opacity: 0.8,
      marginTop: 2,
      textAlign: "center",
      zIndex: 1,
    },

    accentLine: {
      width: 40,
      height: 3,
      borderRadius: 2,
      marginTop: 10,
      // inline backgroundColor: theme.icono
    },

    menuList: {
      paddingHorizontal: 16,
      gap: 8,
    },

    // WHITE cards in every theme except dark
    cardItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: cardBg,
      borderRadius: 14,
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: cardBorder,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.10,
      shadowRadius: 6,
      elevation: 3,
    },

    circleIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
      // inline backgroundColor: theme.icono + "22"
    },

    // Text always readable for the card background
    itemText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: cardText,
    },

    chevron: {
      marginLeft: 4,
      opacity: 0.7,
    },

    submenuContainer: {
      marginTop: 2,
    },

    footer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 8,
      gap: 10,
    },

    shareButton: {
      borderRadius: 16,
      overflow: "hidden",
    },

    closeBtn: {
      borderRadius: 16,
      overflow: "hidden",
    },

    btnInner: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },

    btnIconBackground: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
    },

    btnTitle: {
      fontWeight: "bold",
      fontSize: 15,
    },

    btnSubtitle: {
      fontSize: 11,
      marginTop: 1,
      opacity: 0.85,
    },

    // Branding with a semi-transparent background so it is always visible
    branding: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginHorizontal: 16,
      marginBottom: 4,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
    },

    brandingName: {
      fontWeight: "bold",
      fontSize: 13,
      // color inline: theme.headerText
    },

    brandingSlogan: {
      fontSize: 10,
      // color inline: theme.headerText
    },

    // Legacy
    drawerBody: { flex: 1 },
    cardContainer: { flex: 1 },
    header: { alignItems: "center" },
    innerCard: {},
    item: { color: theme.headerText, fontSize: 16 },
    itemRow: { flexDirection: "row", alignItems: "center" },
    iconBackground: { width: 34, height: 34, borderRadius: 10 },
    separator: { height: StyleSheet.hairlineWidth },
    shareBtn: { backgroundColor: "#0088ff93", padding: 12, borderRadius: 12 },
    logoutBtn: { backgroundColor: "#ff00009f", padding: 12, borderRadius: 12 },
    btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
    drawerHeader: { paddingHorizontal: 16, paddingVertical: 24 },
    drawerTitle: { fontSize: 18, fontWeight: "700" },
    drawerSubtitle: { marginTop: 6, fontSize: 13, opacity: 0.7 },
  });
};