import { StyleSheet } from "react-native";
import { AppTheme } from "../../src/contexts/ThemeContext";

// Recibe el tema activo y devuelve los estilos con los colores correctos
export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({

    // --- CONTENEDOR PRINCIPAL ---

    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      paddingBottom: 40,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 14,
    },

    // --- HEADER GRADIENTE ---

    header: {
      marginBottom: 0,
    },

    gradient: {
      paddingTop: 0.1,
      paddingHorizontal: 25,
      paddingBottom: 25,
      borderBottomLeftRadius: 45,
      borderBottomRightRadius: 45,
    },

    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#FFFFFF",
      width: 220,
    },

    headerSubtitle: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.8)",
      marginTop: 8,
      lineHeight: 20,
      width: 220,
    },

    // --- CARD PRINCIPAL ---

    card: {
      backgroundColor: theme.contactCardBg,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.contactCardBorder,
    },

    // --- ENCABEZADO DE SECCIÓN ---

    sectionHeader: {
      alignItems: "center",
      marginBottom: 18,
    },

    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 25,
      backgroundColor: theme.contactCousserBg,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
      marginBottom: 3,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.contactNombre,
    },

    // --- INPUTS ---

    inputCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.contactBuscadorBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.contactCardBorder,
      padding: 11.3,
      marginBottom: 12,
    },

    inputTextWrap: {
      flex: 1,
      marginLeft: 10,
    },

    inputLabel: {
      fontSize: 12,
      color: theme.contactSubtext,
    },

    inputValue: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.contactNombre,
    },

    contactIconButton: {
      marginLeft: 6,
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.contactAccent,
      alignItems: "center",
      justifyContent: "center",
    },

    // --- CAJA DE INFO ---

    infoBox: {
      flexDirection: "row",
      backgroundColor: theme.contactBadgeBg,
      padding: 12,
      borderRadius: 14,
      marginTop: 6,
    },

    infoText: {
      marginLeft: 8,
      fontSize: 13,
      color: theme.contactSubtext,
      padding: 5,
    },

    infoIconBottom: {
      justifyContent: "center",
    },

    // --- PREVIEW ---

    previewTitle: {
      marginTop: 16,
      marginBottom: 8,
      fontWeight: "700",
      color: theme.contactAccent,
    },

    previewCard: {
      backgroundColor: theme.contactCardBg,
      borderRadius: 16,
      padding: 12,
      flexDirection: "row",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.contactCardBorder,
    },

    previewAvatar: {
      width: 55,
      height: 55,
      borderRadius: 30,
      backgroundColor: theme.contactCousserBg,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },

    previewAvatarText: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.contactAccent,
    },

    previewBody: {
      flex: 1,
    },

    previewName: {
      fontSize: 17,
      fontWeight: "800",
      color: theme.contactNombre,
    },

    previewChip: {
      flexDirection: "row",
      backgroundColor: theme.contactBadgeBg,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      marginTop: 4,
      alignSelf: "flex-start",
    },

    previewChipText: {
      marginLeft: 4,
      fontSize: 12,
      color: theme.contactBadgeText,
    },

    previewValue: {
      marginTop: 4,
      fontSize: 14,
      color: theme.contactSubtext,
    },

    previewRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#2FCB8A",
      marginRight: 6,
    },

    statusText: {
      fontSize: 13,
      color: "#2CA975",
    },

    // --- BOTONES ---

    saveButton: {
      borderRadius: 14,
      height: 52,
      marginBottom: 10,
    },

    buttonInner: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    buttonTextWhite: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 6,
    },

    cancelButton: {
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.contactCardBorder,
    },

    cancelButtonText: {
      fontSize: 16,
      color: theme.contactAccent,
      fontWeight: "600",
    },
  });