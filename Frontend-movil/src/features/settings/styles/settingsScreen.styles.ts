import { StyleSheet } from "react-native";
import type { AppTheme } from "../../../contexts/ThemeContext";

export function createSettingsScreenStyles(theme: AppTheme) {
  const accent = theme.icon;
  const accentSoft = accent + "25";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.headercolor1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      gap: 12,
    },
    returnBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitleText: {
      color: theme.headerText,
      fontSize: 20,
      fontWeight: "600",
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 48,
      paddingTop: 4,
      gap: 14,
    },
    intro: {
      color: theme.headerText,
      opacity: 0.85,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 4,
    },
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
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: accentSoft,
    },
    title: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
      flex: 1,
    },
    description: {
      color: theme.text,
      opacity: 0.75,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 10,
    },
    disabled: {
      opacity: 0.4,
    },
    divisor: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: "rgba(0,0,0,0.12)",
      marginVertical: 14,
    },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
    },
    timeLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "500",
    },
    timePicker: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    timeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    timeText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
      minWidth: 52,
      textAlign: "center",
    },
  });
}
