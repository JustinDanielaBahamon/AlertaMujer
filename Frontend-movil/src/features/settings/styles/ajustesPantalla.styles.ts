import { StyleSheet } from "react-native";
import type { AppTheme } from "../../../contexts/ThemeContext";

export function createAjustesPantallaStyles(theme: AppTheme) {
  const accent = theme.icono;
  const accentSoft = accent + "25";

  return StyleSheet.create({
    contenedor: {
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
    btnVolver: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    tituloHeader: {
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
    tarjeta: {
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
    filaTitulo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconoWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: accentSoft,
    },
    titulo: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
      flex: 1,
    },
    descripcion: {
      color: theme.text,
      opacity: 0.75,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 10,
    },
    deshabilitado: {
      opacity: 0.4,
    },
    divisor: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: "rgba(0,0,0,0.12)",
      marginVertical: 14,
    },
    filaHora: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
    },
    etiquetaHora: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "500",
    },
    selectorHora: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    btnHora: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    textoHora: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
      minWidth: 52,
      textAlign: "center",
    },
  });
}
