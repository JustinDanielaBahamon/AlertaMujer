import { StyleSheet } from "react-native";
import { AppTheme } from "../../../../src/contexts/ThemeContext";

export const createStyles = (theme: AppTheme, width: number, height: number) => {
  const BUTTON_SIZE = width * 0.75; // tamaño original

  return StyleSheet.create({

    // ── CONTENEDOR ────────────────────────────────────────────────────────────
    container: {
      flex: 1,
      justifyContent: "flex-start",
    },

    // ── UBICACIÓN ─────────────────────────────────────────────────────────────
    locationCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 10,
      marginHorizontal: 20,
      marginTop: 15,
      borderWidth: 2,
      borderRadius: 10,
    },

    locationInfo: {
      flex: 1,
      marginLeft: 10,
    },

    locationLabel: {
      fontSize: 12,
    },

    locationValue: {
      fontSize: 14,
      fontWeight: "bold",
    },

    // ── INDICADORES ───────────────────────────────────────────────────────────
    indicatorsRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      marginTop: 16,
      marginBottom: 4,
      paddingHorizontal: 20,
    },

    indicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 25,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderWidth: 1.5,
    },

    indicatorOn: {
      backgroundColor: "#eaffea",
      borderColor: "#2ecc71",
    },

    indicatorOff: {
      backgroundColor: "#fff0f0",
      borderColor: "#e74c3c",
    },

    dot: {
      width: 9,
      height: 9,
      borderRadius: 5,
    },

    dotGreen: {
      backgroundColor: "#2ecc71",
      shadowColor: "#2ecc71",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 4,
      elevation: 4,
    },

    dotRed: {
      backgroundColor: "#e74c3c",
      shadowColor: "#e74c3c",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 4,
      elevation: 4,
    },

    indicatorText: {
      fontSize: 13,
      fontWeight: "700",
    },

    // ── SECCIÓN CENTRAL ───────────────────────────────────────────────────────
    centerSection: {
      flex: 1,                    // ocupa el espacio restante entre indicadores y texto
      alignItems: "center",
      justifyContent: "center",
      marginTop: 15,// centra el botón verticalmente en ese espacio
    },

    // ── TEXTO INSTRUCCIÓN — igual al original ─────────────────────────────────
    instructionText: {
      fontSize: width * 0.045,
      fontWeight: "800",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      lineHeight: 28,
      marginBottom: height * 0.01,
      paddingHorizontal: 10,
    },
  });
};