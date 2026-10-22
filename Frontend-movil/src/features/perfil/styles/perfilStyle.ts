import { StyleSheet } from "react-native";
import type { AppTheme } from "../../../contexts/ThemeContext";

export function createProfileStyles(theme: AppTheme) {
  const accent      = theme.icon;
  const header1     = theme.headercolor1;
  const bg          = theme.background;
  const cardBg      = theme.containerBackground;
  const textPrimary = theme.text;
  const textHeader  = theme.headerText;

  const accentSoft = accent + "25";
  const accentMid  = accent + "55";
  const inputBg    = accent + "0d";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: header1,
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
      color: textHeader,
      fontSize: 20,
      fontWeight: "600",
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 48,
    },

    // ── Zona avatar ───────────────────────────────────────────────
    photoContainer: {
      alignItems: "center",
      paddingTop: 12,
      paddingBottom: 32,
      gap: 5,
    },
    avatarWrap: {
      position: "relative",
    },
    photoCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 3.5,
      borderColor: "rgba(255,255,255,0.88)",
      overflow: "hidden",
      backgroundColor: accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    photo: {
      width: "100%",
      height: "100%",
    },
    initialsText: {
      fontSize: 34,
      fontWeight: "700",
      color: "rgba(255,255,255,0.92)",
    },
    cameraIcon: {
      position: "absolute",
      bottom: 2,
      right: 2,
      backgroundColor: accent,
      borderRadius: 14,
      padding: 5,
      borderWidth: 2,
      borderColor: "#fff",
    },
    userNameValue: {
      fontSize: 17,
      fontWeight: "600",
      color: textHeader,
      marginTop: 8,
    },
    userEmail: {
      fontSize: 12,
      color: "rgba(255,255,255,0.70)",
    },

    // ── Cuerpo ────────────────────────────────────────────────────
    body: {
      backgroundColor: bg,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingTop: 24,
      paddingHorizontal: 18,
      paddingBottom: 40,
      minHeight: 500,
      gap: 14,
    },

    // ── Tarjeta ───────────────────────────────────────────────────
    card: {
      backgroundColor: cardBg,
      borderRadius: 18,
      padding: 18,
      gap: 10,
      borderWidth: 1,
      borderColor: accentSoft,
      shadowColor: accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: "700",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 0.9,
      marginBottom: 4,
    },

    // ── Campo individual ──────────────────────────────────────────
    fieldWrap: {
      gap: 3,
    },
    inputLabel: {
      fontSize: 11,
      color: accent,
      fontWeight: "600",
      marginLeft: 2,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: accentMid,
      borderRadius: 13,
      paddingHorizontal: 12,
      height: 46,
      backgroundColor: inputBg,
      gap: 8,
    },
    readonlyInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: accentSoft,
      borderRadius: 13,
      paddingHorizontal: 12,
      height: 46,
      backgroundColor: bg,
      gap: 8,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: textPrimary,
    },
    inputReadonly: {
      flex: 1,
      fontSize: 14,
      color: textPrimary,
      opacity: 0.65,
    },
    fixedBadge: {
      backgroundColor: accentSoft,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    fixedBadgeText: {
      fontSize: 10,
      color: accent,
      fontWeight: "700",
    },
    hintText: {
      fontSize: 10,
      color: accent,
      opacity: 0.65,
      marginLeft: 2,
    },

    // ── Botones ───────────────────────────────────────────────────
    saveBtn: {
      backgroundColor: accent,
      borderRadius: 15,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.32,
      shadowRadius: 10,
      elevation: 6,
    },
    saveText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: 0.3,
    },

    // ── Mensajes ──────────────────────────────────────────────────
    successMessage: {
      textAlign: "center",
      color: "#27ae60",
      fontSize: 13,
      fontWeight: "600",
      paddingVertical: 4,
    },
    errorText: {
      textAlign: "center",
      color: "#C026D3",
      fontSize: 13,
      fontWeight: "600",
      paddingVertical: 4,
    },
  });
}