import { StyleSheet } from "react-native";
import { AppTheme } from "../../../../src/contexts/ThemeContext";
import { black } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

export const createStyles = (
  theme: AppTheme,
  width: number,
  height: number
) => {
  const BUTTON_SIZE = width * 0.68;

  return StyleSheet.create({

    // =====================================================
    // CONTENEDOR
    // =====================================================

    container: {
      flex: 1,
      justifyContent: "flex-start",

    },


    // =====================================================
    // ZONA SEGURA
    // =====================================================

    safeZoneCard: {
      flexDirection: "row",
      alignItems: "center",

      marginHorizontal: 20,
      marginTop: 8,

      minHeight: 92,

      paddingHorizontal: 18,

      borderWidth: 1.5,
      borderRadius: 20,
    },

    safeZoneInfo: {
      flex: 1,
      marginLeft: 14,
      marginRight: 8,
    },

    safeZoneTitle: {
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 5,
    },

    safeZoneSubtitle: {
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 3,
      color : "#000000"
    },

    safeZoneLocation: {
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 18,
    },


    // =====================================================
    // UBICACIÓN
    // =====================================================

    locationCard: {
      flexDirection: "row",
      alignItems: "center",

      marginHorizontal: 20,
      marginTop: 14,

      minHeight: 92,

      paddingLeft: 18,
      paddingVertical: 14,

      borderWidth: 1.5,
      borderRadius: 20,
    },

    locationMain: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    locationInfo: {
      flex: 1,
      marginLeft: 14,
      marginRight: 8,
    },

    locationLabel: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 5,
    },

    locationValue: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },

    refreshButton: {
      width: 50,
      height: 50,

      justifyContent: "center",
      alignItems: "center",

      marginRight: 6,
    },


    // =====================================================
    // GPS
    // =====================================================

    gpsRow: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 3,
    },

    gpsDot: {
      width: 8,
      height: 8,

      borderRadius: 999,

      backgroundColor: "#27ae60",

      marginRight: 6,

      shadowColor: "#27ae60",
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.9,
      shadowRadius: 4,

      elevation: 4,
    },

    gpsText: {
      fontSize: 12,
      color: "#27ae60",
      fontWeight: "600",
    },


    // =====================================================
    // INDICADORES
    // =====================================================

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

      paddingHorizontal: 4,
      paddingVertical: 6,
    },

    dot: {
      width: 9,
      height: 9,
      borderRadius: 5,
    },

    dotPurple: {
      backgroundColor: "#7B2FBE",

      shadowColor: "#7B2FBE",
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.9,
      shadowRadius: 4,

      elevation: 4,
    },

    dotRed: {
      backgroundColor: "#e74c3c",

      shadowColor: "#e74c3c",
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.9,
      shadowRadius: 4,

      elevation: 4,
    },

    indicatorText: {
      fontSize: 13,
      fontWeight: "700",
    },


    // =====================================================
    // SECCIÓN CENTRAL
    // =====================================================

    centerSection: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      marginTop: -95,
    },

    instructionText: {
      fontSize: width * 0.038,

      fontWeight: "800",

      textAlign: "center",
      textTransform: "uppercase",

      letterSpacing: 0.8,

      lineHeight: 24,

      marginTop: 6,
      marginBottom: height * 0.015,

      paddingHorizontal: 10,
    },


    // =====================================================
    // ÚLTIMA ALERTA
    // =====================================================

    lastAlertCard: {
      flexDirection: "row",
      alignItems: "center",

      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,

      padding: 9,

      borderWidth: 1,
      borderRadius: 20,

      gap: 12,

      shadowColor: "#7B2CBF",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 10,
    },

    lastAlertInfo: {
      flex: 1,
    },

    lastAlertTitle: {
      fontSize: 15,
      fontWeight: "600",
    },

    lastAlertSubtitle: {
      fontSize: 13,

      opacity: 0.7,

      marginTop: 4,
    },

  });
};