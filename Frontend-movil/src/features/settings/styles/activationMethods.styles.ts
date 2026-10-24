import { StyleSheet } from "react-native";
import type { AppTheme } from "../../../contexts/ThemeContext";

// Header colors: the same as the sidebar in its normal state
export function getHeaderColors(theme: AppTheme): {
  background: string;
  text: string;
} {
  return { background: theme.headerBackground, text: theme.headerText };
}

export function createActivationMethodsStyles(theme: AppTheme) {
  const accent = theme.icon;
  const accentSoft = accent + "25";
  const { background, text } = getHeaderColors(theme);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Header (same flat color as the sidebar)
    header: {
      backgroundColor: background,
      paddingHorizontal: 20,
      paddingBottom: 22,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      gap: 16,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    returnBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: text + "26",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTexts: { flex: 1 },
    headerTitleText: {
      color: text,
      fontSize: 20,
      fontWeight: "700",
    },
    headerSubtitleText: {
      color: text,
      opacity: 0.85,
      fontSize: 12.5,
      marginTop: 2,
    },
    headerIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: text + "26",
      alignItems: "center",
      justifyContent: "center",
    },
    summaryRow: { gap: 8 },
    summaryText: {
      color: "#FFFFFF",
      fontSize: 12.5,
      fontWeight: "600",
    },
    barBackground: {
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(255,255,255,0.3)",
      overflow: "hidden",
    },
    barFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: "#FFFFFF",
    },

    // Content
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 48,
      gap: 14,
    },
    intro: {
      color: theme.text,
      opacity: 0.8,
      fontSize: 13,
      lineHeight: 19,
    },

    // Method card
    card: {
      backgroundColor: theme.containerBackground,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: accentSoft,
      shadowColor: accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    inactiveCard: { opacity: 0.8 },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: accentSoft,
    },
    titleWrap: { flex: 1, gap: 4 },
    methodTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
    },
    statusChip: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: accentSoft,
    },
    activeStatusChip: { backgroundColor: accent },
    chipText: {
      color: theme.text,
      fontSize: 10.5,
      fontWeight: "700",
    },
    activeChipText: { color: "#ffffff" },
    methodDescription: {
      color: theme.text,
      opacity: 0.75,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 12,
    },

    // Steps
    steps: { opacity: 1 },
    inactiveSteps: { opacity: 0.55 },
    stepRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 8,
    },
    stepNumber: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: accentSoft,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    stepNumberText: {
      color: theme.text,
      fontSize: 11,
      fontWeight: "700",
    },
    stepText: {
      color: theme.text,
      opacity: 0.85,
      fontSize: 12.5,
      lineHeight: 18,
      flex: 1,
    },

    // Notice inside the card (methods coming in a future version)
    recommendationsWrap: {
      backgroundColor: accentSoft,
      borderRadius: 12,
      padding: 10,
      marginTop: 4,
      gap: 6,
    },
    recommendationsTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    recommendationsTitle: {
      color: theme.text,
      fontSize: 12.5,
      fontWeight: "700",
    },
    brandRecommendation: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      backgroundColor: "#fef3c7",
      borderRadius: 8,
      padding: 8,
    },
    brandRecommendationText: {
      color: "#78350f",
      fontSize: 11.5,
      lineHeight: 16,
      flex: 1,
    },
    recommendationRow: {
      flexDirection: "row",
      gap: 6,
    },
    recommendationBullet: {
      color: theme.icon,
      fontSize: 12,
      lineHeight: 16,
    },
    recommendationText: {
      color: theme.text,
      fontSize: 11.5,
      lineHeight: 16,
      flex: 1,
      opacity: 0.85,
    },

    methodAction: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.icon,
      borderRadius: 12,
      paddingVertical: 11,
      marginTop: 6,
    },
    methodActionText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "700",
    },

    noticeWrap: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: accentSoft,
      borderRadius: 12,
      padding: 10,
      marginTop: 4,
    },
    noticeText: {
      color: theme.text,
      fontSize: 11.5,
      lineHeight: 16,
      flex: 1,
      opacity: 0.85,
    },

    noteWrap: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: accentSoft,
      borderRadius: 14,
      padding: 12,
      marginTop: 4,
    },
    noteText: {
      color: theme.text,
      fontSize: 12,
      lineHeight: 17,
      flex: 1,
      opacity: 0.85,
    },
  });
}