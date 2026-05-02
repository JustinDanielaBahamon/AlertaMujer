import { StyleSheet } from "react-native";
import { AppTheme } from "../../../../src/contexts/ThemeContext";

// Recibe el tema activo y devuelve los estilos con los colores correctos
export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({

    // --- CONTENEDORES PRINCIPALES ---

    mainContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },

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

    // --- FILA DE CONTEO (Tus contactos) ---

    countRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      marginLeft: 20,
      marginTop: 10,
    },

    countIcon: {
      backgroundColor: theme.contactCousserBg,
      borderRadius: 12,
      padding: 8,
      marginRight: 10,
    },

    countText: {
      fontSize: 17,
      fontWeight: "800",
    },

    // --- BUSCADOR ---

    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.contactBuscadorBg,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginHorizontal: 15,
      marginTop: 0,
      marginBottom: 7,
      gap: 8,
    },

    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.contactBuscadorText,
      padding: 0, // reset del padding por defecto en Android
    },

    // --- TARJETA DE CONTACTO ---

    cardWrapper: {
      marginBottom: 16,
      marginLeft: 8,
      marginRight: 8,
    },

    contactCard: {
      backgroundColor: theme.contactCardBg,
      borderRadius: 25,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.contactCardBorder,
      // Sombras
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      marginBottom: 20,
    },

    // SECCIÓN SUPERIOR: Foto, Info y Editar

    topSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 15,
    },

    photoContainer: {
      position: "relative",
    },

    profilePhoto: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: theme.contactAvatarBorder,
    },

    statusDot: {
      position: "absolute",
      bottom: 5,
      right: 2,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "#28a745", // Verde disponible
      borderWidth: 3,
      borderColor: theme.contactCardBg,
    },

    contactInfo: {
      flex: 1,
      paddingLeft: 15,
    },

    contactName: {
      fontSize: 19,
      fontWeight: "bold",
      color: theme.contactNombre,
    },

    relationBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      marginVertical: 5,
      alignSelf: "flex-start",
    },

    badgeText: {
      fontSize: 12,
      fontWeight: "bold",
      marginLeft: 4,
    },

    phoneRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
    },

    phoneText: {
      fontSize: 14,
    },

    topIcons: {
      flexDirection: "row",
    },

    smallIconButton: {
      padding: 8,
      borderRadius: 10,
      marginLeft: 8,
    },

    // SECCIÓN ACCIONES: Llamar, WhatsApp, Ubicación

    actionsSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      paddingTop: 15,
      paddingHorizontal: 10,
    },

    actionItem: {
      alignItems: "center",
      flex: 1,
    },

    actionCircle: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 5,
    },

    actionText: {
      fontSize: 11,
      color: theme.contactSubtext,
      fontWeight: "500",
    },

    // --- FOOTER: ¿QUIERES AGREGAR MÁS? ---

    suggestionCard: {
      borderRadius: 20,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      borderStyle: "dashed", // Borde punteado
      borderWidth: 1.5,
      marginTop: 10,
      marginBottom: 100, // Espacio para que el botón flotante no tape nada
      margin: 10,
    },

    dashedCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 1.5,
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },

    addSmallButton: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 12,
      elevation: 2,
    },

    // --- BOTÓN FLOTANTE Y SWIPE ---

    floatingButton: {
      position: "absolute",
      bottom: 30,
      right: 13,
      width: 65,
      height: 65,
      borderRadius: 32.5,
      justifyContent: "center",
      alignItems: "center",
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },

    swipeBack: {
      alignItems: "center",
      backgroundColor: "#FF5252",
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingRight: 20,
      borderRadius: 25,
      marginBottom: 40,
      marginLeft: 8,
      marginRight: 8,
    },

    deleteSwipeButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 80,
      height: "100%",
    },

    deleteSwipeText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: "bold",
      marginTop: 4,
    },
  });