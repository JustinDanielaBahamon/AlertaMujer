import { StyleSheet } from "react-native";
import { AppTheme } from "../../../../src/contexts/ThemeContext";

export const createStyles = (theme: AppTheme, width: number, height: number) => {
  const BUTTON_SIZE = width * 0.68; // reducido de 0.75 a 0.68 para dar espacio al texto

  return StyleSheet.create({

    //  CONTENEDOR
    container: {
      flex: 1,
      justifyContent: "flex-start",
    },

    //  UBICACIÓN
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

    //  INDICADORES
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

    //  SECCIÓN CENTRAL
    centerSection: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },

    //  TEXTO INSTRUCCIÓN — reducido para evitar que se pegue al botón
    instructionText: {
      fontSize: width * 0.038,       // antes 0.045 — ahora más pequeño
      fontWeight: "800",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      lineHeight: 24,                // antes 28
      marginTop: 6,                  // pequeño espacio sobre el texto
      marginBottom: height * 0.015,  // más espacio abajo hacia la tarjeta
      paddingHorizontal: 10,
    },

    //  ZONA SEGURA
    safeZoneCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      marginHorizontal: 20,
      marginTop: 15,
      borderWidth: 1.5,
      borderRadius: 10,
      gap: 10,
    },

    safeZoneInfo: {
      flex: 1,
    },

    safeZoneTitle: {
      fontSize: 13,
      fontWeight: "700",
    },

    safeZoneSubtitle: {
      fontSize: 11,
      opacity: 0.7,
      marginTop: 1,
    },

    // GPS ACTIVO
    gpsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 3,
    },

    gpsDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#27ae60",
      shadowColor: "#27ae60",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 4,
      elevation: 4,
    },

    gpsText: {
      fontSize: 11,
      color: "#27ae60",
      fontWeight: "600",
    },

    //  ÚLTIMA ALERTA — con más margen arriba para bajarla un poco
    lastAlertCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      marginHorizontal: 20,              // antes no tenía marginTop explícito
      marginBottom: -20,                 // más espacio abajo hacia el botón
      borderWidth: 1,
      borderRadius: 10,
      gap: 10,
    },

    lastAlertInfo: {
      flex: 1,
    },

    lastAlertTitle: {
      fontSize: 13,
    },

    lastAlertSubtitle: {
      fontSize: 11,
      opacity: 0.6,
      marginTop: 2,
    },
  });
};
