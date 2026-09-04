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
      paddingBottom: 35,
    },


    // =====================================================
    // HEADER
    // =====================================================

    header: {
      height: 75,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
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
      fontSize: 17,
      fontWeight: "700",
    },

    securityHeaderIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#E8D5F5",
      justifyContent: "center",
      alignItems: "center",
    },


    // =====================================================
    // DESCRIPCIÓN
    // =====================================================

    description: {
      fontSize: 11,
      lineHeight: 17,
      marginHorizontal: 18,
      marginBottom: 15,
    },


    // =====================================================
    // TÍTULOS
    // =====================================================

    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      marginHorizontal: 18,
      marginTop: 13,
      marginBottom: 8,
    },


    // =====================================================
    // MAPA
    // =====================================================

    mapContainer: {
      height: 110,
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

    useLocationButton: {
      height: 32,
      marginHorizontal: 18,
      marginTop: 8,
      borderWidth: 1,
      borderColor: "#7B1DB2",
      borderRadius: 6,
      justifyContent: "center",
      alignItems: "center",
    },

    useLocationText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#7B1DB2",
    },


    // =====================================================
    // INPUTS
    // =====================================================

    inputLabel: {
      fontSize: 10,
      fontWeight: "600",
      marginHorizontal: 18,
      marginTop: 7,
      marginBottom: 4,
    },

    input: {
      height: 36,
      marginHorizontal: 18,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: "#E6E6E6",
      paddingHorizontal: 11,
      fontSize: 11,
    },

    selectInput: {
      height: 36,
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
      fontSize: 11,
    },

    characterCounter: {
      fontSize: 8,
      textAlign: "right",
      marginHorizontal: 20,
      marginTop: 2,
    },


    // =====================================================
    // SEGURIDAD
    // =====================================================

    securityDescription: {
      fontSize: 9,
      marginHorizontal: 18,
      marginBottom: 7,
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
      fontSize: 9,
      fontWeight: "700",
      color: "#27AE60",
      marginTop: 2,
    },

    safeText: {
      fontSize: 9,
      fontWeight: "700",
      color: "#27AE60",
      marginTop: 2,
    },

    moderateText: {
      fontSize: 9,
      fontWeight: "700",
      color: "#D89B00",
      marginTop: 2,
    },

    unsafeText: {
      fontSize: 9,
      fontWeight: "700",
      color: "#E67E22",
      marginTop: 2,
    },

    veryUnsafeText: {
      fontSize: 9,
      fontWeight: "700",
      color: "#E74C3C",
      marginTop: 2,
    },

    notApplicableText: {
      fontSize: 9,
      fontWeight: "700",
      color: "#777",
      marginTop: 2,
    },

    securitySmallText: {
      fontSize: 7,
      color: "#777",
      marginTop: 2,
    },


    // =====================================================
    // FOTO
    // =====================================================

    photoDescription: {
      fontSize: 9,
      marginHorizontal: 18,
      marginBottom: 7,
    },

    photoButton: {
      height: 62,
      marginHorizontal: 18,
      borderRadius: 9,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: "#D9BDE8",
      backgroundColor: "#FBF5FF",
      justifyContent: "center",
      alignItems: "center",
    },

    photoButtonText: {
      fontSize: 10,
      fontWeight: "600",
      color: "#7B1DB2",
      marginTop: 2,
    },

    photoFormats: {
      fontSize: 8,
      color: "#999",
      marginTop: 2,
    },


    // =====================================================
    // ENVIAR
    // =====================================================

    submitButton: {
      height: 35,
      marginHorizontal: 15,
      marginTop: 10,
      borderRadius: 7,
      backgroundColor: "#6F1BB5",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 7,
    },

    submitButtonText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700",
    },

    footerText: {
      fontSize: 8,
      textAlign: "center",
      marginTop: 5,
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