import { StyleSheet } from "react-native";
import { AppTheme } from "../../../../src/contexts/ThemeContext";


export function getEmergenciaColors(theme: AppTheme) {
  if (theme.mode === "light") {
    return {
      border:    "#4A148C",
      iconBg:    "#EEEBFF",
      iconTint:  "#4A148C",
      text:      "#4A148C",
      badgeBg:   "#EDE7F6",
      badgeText: "#6A1B9A",
      line:      "#4A148C",
      hora:      "#9e83cf",
    };
  }
  return {
    border:    theme.contactAccent,
    iconBg:    theme.contactIconCallBg,
    iconTint:  theme.contactAccent,
    text:      theme.contactAccent,
    badgeBg:   theme.contactBadgeBg,
    badgeText: theme.contactBadgeText,
    line:      theme.contactAccent,
    hora:      theme.contactAccent,
  };
}

export function getAsistenciaColors(theme: AppTheme) {
  // light → rojo original
  if (theme.mode === "light") {
    return {
      border:    "#C62828",
      iconBg:    "#FFEBEE",
      iconTint:  "#D32F2F",
      text:      "#C62828",
      badgeBg:   "#FFEBEE",
      badgeText: "#D32F2F",
      line:      "#C62828",
      hora:      "#9e83cf",
    };
  }
  // rosa → morado
  if (theme.mode === "rosa") {
    return {
      border:    "#7B1FA2",
      iconBg:    "#F3E5F5",
      iconTint:  "#7B1FA2",
      text:      "#7B1FA2",
      badgeBg:   "#F3E5F5",
      badgeText: "#6A1B9A",
      line:      "#7B1FA2",
      hora:      "#AB47BC",
    };
  }
  // Azul → morado
  if (theme.mode === "Azul") {
    return {
      border:    "#6A1B9A",
      iconBg:    "#F3E5F5",
      iconTint:  "#7B1FA2",
      text:      "#6A1B9A",
      badgeBg:   "#EDE7F6",
      badgeText: "#4A148C",
      line:      "#6A1B9A",
      hora:      "#9C27B0",
    };
  }
  // dark → azul más bonito (celeste vibrante)
  if (theme.mode === "dark") {
    return {
      border:    "#29B6F6",
      iconBg:    "#0D2137",
      iconTint:  "#29B6F6",
      text:      "#29B6F6",
      badgeBg:   "#0D2137",
      badgeText: "#4FC3F7",
      line:      "#29B6F6",
      hora:      "#29B6F6",
    };
  }
  // magenta → rosado/morado claro
  if (theme.mode === "magenta") {
    return {
      border:    "#E040FB",
      iconBg:    "#FCE4FC",
      iconTint:  "#E040FB",
      text:      "#CE93D8",
      badgeBg:   "#F8E8FF",
      badgeText: "#AB47BC",
      line:      "#E040FB",
      hora:      "#CE93D8",
    };
  }
  // vino → fucsia oscuro
  if (theme.mode === "vino") {
    return {
      border:    "#7b04aa",
      iconBg:    "#FCE4EC",
      iconTint:  "#7a0cd4",
      text:      "#8808f1",
      badgeBg:   "#FCE4EC",
      badgeText: "#900cfc",
      line:      "#900dc4",
      hora:      "#bc0af1",
    };
  }
  // fallback genérico
  return {
    border:    theme.contactIconLocColor,
    iconBg:    theme.contactIconLocBg,
    iconTint:  theme.contactIconLocColor,
    text:      theme.contactIconLocColor,
    badgeBg:   theme.contactIconLocBg,
    badgeText: theme.contactIconLocColor,
    line:      theme.contactIconLocColor,
    hora:      theme.contactIconLocColor,
  };
}

// ─── Fábrica de estilos ───────────────────────────────────────────────────────

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({

    mainContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },

    header: {
      marginBottom: 0,
    },

    gradient: {
      paddingTop: 0.1,
      paddingHorizontal: 15,
      paddingBottom: 45,
      borderBottomLeftRadius: 41,
      borderBottomRightRadius: 41,
    },

    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#FFFFFF",
      width: 220,
    },

    headerSubtitle: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.8)",
      marginTop: 8,
      lineHeight: 20,
      width: 220,
    },

    legendRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 24,
      marginTop: 12,
      marginBottom: 4,
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    legendText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#FFFFFF",
    },

    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.containerBackground,
      borderRadius: 16,
      paddingHorizontal: 15,
      height: 52,
      marginHorizontal: 20,
      marginTop: 10,
      marginBottom: 15,
      elevation: 5,
      shadowColor: theme.headercolor2,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },

    searchIcon: {
      marginRight: 10,
    },

    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      padding: 0,
    },

    statsCard: {
      flexDirection: "row",
      backgroundColor: theme.containerBackground,
      borderRadius: 18,
      marginHorizontal: 20,
      marginBottom: 18,
      paddingVertical: 16,
      paddingHorizontal: 8,
      elevation: 3,
      shadowColor: theme.headercolor2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },

    statItem: {
      flex: 1,
      alignItems: "center",
    },

    statLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 4,
      color: theme.text,
    },

    statNumber: {
      fontSize: 26,
      fontWeight: "bold",
    },

    statSublabel: {
      fontSize: 11,
      color: theme.contactSubtext,
      marginTop: 2,
    },

    statDivider: {
      width: 1,
      backgroundColor: theme.contactDivider,
      marginVertical: 4,
    },

    cardWrapper: {
      paddingHorizontal: 20,
      marginBottom: 14,
    },

    card: {
      backgroundColor: theme.contactCardBg,
      borderRadius: 20,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      borderWidth: 1,
      borderColor: theme.contactCardBorder,
      borderLeftWidth: 5,
      elevation: 3,
      shadowColor: theme.headercolor2,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },

    leftColumn: {
      marginRight: 14,
      alignItems: "center",
    },

    iconContainer: {
      padding: 6,
      borderRadius: 30,
    },

    icon: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },

    decorativeLine: {
      width: 2,
      flex: 1,
      marginTop: 6,
      borderRadius: 1,
    },

    rightColumn: {
      flex: 1,
    },

    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    // Pill del tipo — sin punto, solo texto
    typePill: {
      flexDirection: "row",
      alignItems: "center",
    },

    alertType: {
      fontSize: 18,
      fontWeight: "bold",
    },

    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },

    timeText: {
      fontSize: 12,
      fontWeight: "600",
    },

    dateText: {
      fontSize: 13,
      color: theme.contactSubtext,
      marginTop: 5,
    },

    locationRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 2,
    },

    locationText: {
      fontSize: 13,
      color: theme.contactSubtext,
    },

    statusBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 20,
      marginTop: 10,
    },

    statusText: {
      fontSize: 11,
      fontWeight: "bold",
    },

    emptyText: {
      textAlign: "center",
      color: theme.contactSubtext,
      fontSize: 14,
    },
  });