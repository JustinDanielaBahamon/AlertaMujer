import { StyleSheet } from "react-native";
import { AppTheme } from "../../../contexts/ThemeContext";

export const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({

    // =====================================================
    // CONTENEDOR
    // =====================================================

    container: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom:42,
    },


    // =====================================================
    // HEADER
    // =====================================================

    header: {
      height: 125,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 17,
      paddingTop: 8,
    },

    backButton: {
      width: 38,
      height: 38,
      justifyContent: "center",
      alignItems: "center",
    },

    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
    },

    headerTitle: {
      fontSize: 21,
      fontWeight: "800",
    },

    securityHeaderIcon: {
      width: 45,
      height: 45,
      borderRadius: 30,
      backgroundColor: "#dfafff",
      justifyContent: "center",
      alignItems: "center",
    },


    // =====================================================
    // DESCRIPCIÓN
    // =====================================================

    description: {
      fontSize: 11,
      marginHorizontal :17,
      lineHeight: 17,
      textAlign: "center",
      marginBottom: 10,
    },


    // =====================================================
    // TÍTULOS
    // =====================================================

    sectionTitle: {
      fontSize: 15.7,
      fontWeight: "700",
      marginHorizontal: 18,
      marginTop: 13,
      marginBottom: 8,
    },


    // =====================================================
    // MAPA
    // =====================================================

    mapContainer: {
      height: 160,
      marginHorizontal: 18,
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
      borderWidth: 1,
      borderColor: "#eee",
    },

    map: {
      flex: 1,
    },

    mapCenterMarker: {
      position: "absolute",
      left: "50%",
      top: "50%",
      marginLeft: -18,
      marginTop: -18,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(123,29,178,0.15)",
      justifyContent: "center",
      alignItems: "center",
    },

    mapCenterDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#7B1DB2",
      borderWidth: 2,
      borderColor: "#fff",
    },

    mapLocationButton: {
      position: "absolute",
      right: 8,
      bottom: 8,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      elevation: 3,
    },


    // =====================================================
    // BOTÓN USAR UBICACIÓN
    // =====================================================

  // =====================================================
    // BOTÓN USAR UBICACIÓN
    // =====================================================

    useLocationButton: {
      height: 40,
      marginHorizontal: 18,
      marginTop: 8,
      borderWidth: 1,
      borderColor: "#7B1DB2",
      borderRadius: 6,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },

    // Estado cuando el usuario presiona el botón
    useLocationButtonActive: {
      backgroundColor: "#7B1DB2",
      borderColor: "#5A1387",
    },

    useLocationText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#7B1DB2",
    },

    // Texto cuando el botón está presionado
    useLocationTextActive: {
      color: "#FFFFFF",
    },

    

    // =====================================================
    // INPUTS
    // =====================================================

    inputLabel: {
      fontSize: 12.8,
      fontWeight: "600",
      marginHorizontal: 18,
      marginTop: 7,
      marginBottom: 4,
    },

    input: {
      height: 46,
      marginHorizontal: 18,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: "#E6E6E6",
      paddingHorizontal: 11,
      fontSize: 13,
    },

    selectInput: {
      height: 46,
      marginHorizontal: 18,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: "#E6E6E6",
      paddingHorizontal: 11,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    descriptionInput: {
      height: 70,
      marginHorizontal: 18,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: "#E6E6E6",
      paddingHorizontal: 11,
      paddingTop: 9,
      fontSize: 12.6,
    },

    characterCounter: {
      fontSize: 11.1,
      textAlign: "right",
      marginHorizontal: 20,
      marginTop: 2,
    },


    // =====================================================
    // SEGURIDAD
    // =====================================================

    securityDescription: {
      fontSize: 12.3,
      marginHorizontal: 20,
      marginBottom: 11,
    },

    securityGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginHorizontal: 18,
      gap: 6,
    },

    securityOption: {
      width: "31.8%",
      minHeight: 55,
      borderRadius: 8,
      paddingVertical: 7,
      paddingHorizontal: 5,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },

    selectedSecurity: {
      borderWidth: 2,
      borderColor: "#7B1DB2",
    },

    verySafe: {
      backgroundColor: "#E9F8EF",
      borderColor: "#D0EEDB",
    },

    safe: {
      backgroundColor: "#EDF9F0",
      borderColor: "#D2EEDA",
    },

    moderate: {
      backgroundColor: "#FFF8DF",
      borderColor: "#F4E6A7",
    },

    unsafe: {
      backgroundColor: "#FFF0DF",
      borderColor: "#F4D4AE",
    },

    veryUnsafe: {
      backgroundColor: "#FFEAEA",
      borderColor: "#F4C4C4",
    },

    notApplicable: {
      backgroundColor: "#F1F1F1",
      borderColor: "#DDDDDD",
    },

    verySafeText: {
      fontSize: 12.8,
      fontWeight: "700",
      color: "#27AE60",
      marginTop: 2,
    },

    safeText: {
      fontSize: 12.8,
      fontWeight: "700",
      color: "#27AE60",
      marginTop: 2,
    },

    moderateText: {
      fontSize: 12.8,
      fontWeight: "700",
      color: "#D89B00",
      marginTop: 2,
    },

    unsafeText: {
      fontSize: 12.8,
      fontWeight: "700",
      color: "#E67E22",
      marginTop: 2,
    },

    veryUnsafeText: {
      fontSize: 12.8,
      fontWeight: "700",
      color: "#E74C3C",
      marginTop: 2,
    },

    notApplicableText: {
      fontSize: 12.7,
      fontWeight: "700",
      color: "#777",
      marginTop: 2,
    },

    securitySmallText: {
      fontSize: 8.6,
      color: "#777",
      marginTop: 2,
    },

    // =====================================================
    // ENVIAR
    // =====================================================

    submitButton: {
      height: 43,
      marginHorizontal: 15,
      marginTop: 22,
      borderRadius: 7,
      backgroundColor: "#6F1BB5",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 7,
    },

    submitButtonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },

    footerText: {
      fontSize: 9.3,
      textAlign: "center",
      marginTop: 8,
    },

    // =====================================================
    // CAMPOS DE NOMBRE
    // =====================================================

    fieldLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 6,
    },

    inputError: {
      borderColor: "#D81B60",
      backgroundColor: "#FFF5F5",
    },

    errorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
      marginHorizontal: 18,
    },

    errorText: {
      fontSize: 9,
      fontWeight: "500",
      color: "#D81B60",
    },

    chipsRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 10,
      marginHorizontal: 18,
    },

    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#7B1DB2",
      borderRadius: 14,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },

    chipText: {
      fontSize: 10,
      fontWeight: "600",
      color: "#7B1DB2",
    },
    

    // =====================================================
    // LOADING
    // =====================================================

    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },

    loadingText: {
      fontSize: 14,
      fontWeight: "500",
    },

  });
};