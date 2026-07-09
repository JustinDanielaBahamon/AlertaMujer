import { StyleSheet } from "react-native";
import type { AppTheme } from "../../../contexts/ThemeContext";

export function createMetodosActivacionStyles(theme: AppTheme) {
  const accent      = theme.icono;
  const header1     = theme.headercolor1;
  const cardBg      = theme.containerBackground;
  const textPrimary = theme.text;
  const textHeader  = theme.headerText;

  const accentSoft = accent + "25";

  return StyleSheet.create({
    contenedor: {
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
    btnVolver: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    tituloHeader: {
      color: textHeader,
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
      color: cardBg === header1 ? textPrimary : "rgba(255,255,255,0.85)",
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 4,
    },

    tarjeta: {
      backgroundColor: cardBg,
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
    filaTitulo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
    },
    iconoWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: accentSoft,
    },
    tituloMetodo: {
      color: textPrimary,
      fontSize: 15,
      fontWeight: "700",
      flex: 1,
    },
    descripcionMetodo: {
      color: textPrimary,
      opacity: 0.75,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 12,
    },

    // Pasos
    pasoFila: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 8,
    },
    pasoNumero: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: accentSoft,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    pasoNumeroTexto: {
      color: textPrimary,
      fontSize: 11,
      fontWeight: "700",
    },
    pasoTexto: {
      color: textPrimary,
      opacity: 0.85,
      fontSize: 12.5,
      lineHeight: 18,
      flex: 1,
    },

    notaWrap: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: accentSoft,
      borderRadius: 14,
      padding: 12,
      marginTop: 4,
    },
    notaTexto: {
      color: textPrimary,
      fontSize: 12,
      lineHeight: 17,
      flex: 1,
      opacity: 0.85,
    },
  });
}