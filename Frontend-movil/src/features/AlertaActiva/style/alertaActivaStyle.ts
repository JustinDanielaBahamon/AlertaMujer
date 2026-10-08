import { AppTheme } from "../../../contexts/ThemeContext";

// Fabrica de estilos para la pantalla AlertaActiva.
// Recibe el tema actual y el ancho de pantalla (useWindowDimensions) para adaptarse
// a moviles pequenos, grandes y tablets, y se recalcula ante rotaciones.
// El padding superior contra el notch/barra de notificaciones se aplica aparte con
// useSafeAreaInsets() directamente en la screen (insets.top), no aqui.
export const createStyles = (theme: AppTheme, width: number) => {
  const isCompact = width < 360; // moviles chicos (ej. iPhone SE)
  const isWide = width >= 500; // tablets / pantallas grandes

  const horizontalPadding = Math.max(16, Math.min(width * 0.06, 32));
  const circleSize = Math.round(Math.min(Math.max(width * 0.42, 130), 190));

  return {
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    mainContainer: {
      flexGrow: 1,
      paddingHorizontal: horizontalPadding,
      paddingBottom: 30,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "flex-end" as const,
      alignItems: "center" as const,
      marginBottom: 10,
    },
    headerIconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.card,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    headerMapButton: {
      width: 70,
      height: 70,
      borderRadius: 50,
      overflow: "hidden" as const,
      backgroundColor: theme.card,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      borderWidth: 2,
      borderColor: theme.icono,
    },
    headerMap: {
      width: "100%" as const,
      height: "100%" as const,
    },
    headerMapFallback: {
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    title: {
      fontSize: isCompact ? 20 : isWide ? 28 : 24,
      fontWeight: "800" as const,
      color: theme.icono,
      marginTop: 1,
    },
    subtitle: {
      fontSize: isCompact ? 12 : 14,
      color: theme.text,
      marginBottom: 12,
    },
    circleWrapper: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      marginVertical: 8,
    },
    circle: {
      width: circleSize,
      height: circleSize,
      borderRadius: circleSize / 2,
      borderWidth: 8,
      borderColor: theme.icono,
      backgroundColor: theme.containerBackground,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    number: {
      fontSize: isCompact ? 28 : isWide ? 40 : 34,
      fontWeight: "900" as const,
      color: theme.text,
    },
    timeLabel: {
      fontSize: 12,
      color: theme.text,
      opacity: 0.7,
    },
    mensajeCard: {
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
      backgroundColor: theme.containerBackground,
      borderRadius: 20,
      padding: 14,
      marginTop: 8,
      marginBottom: 15,
      gap: 10,
    },
    mensajeText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: theme.text,
    },
    infoCard: {
      flexDirection: "row" as const,
      backgroundColor: theme.containerBackground,
      borderRadius: 20,
      padding: 15,
      alignItems: "center" as const,
      marginBottom: 15,
    },
    infoIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.card,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginRight: 12,
    },
    infoTextWrapper: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: theme.icono,
    },
    infoDescription: {
      fontSize: 13,
      color: theme.text,
      marginTop: 2,
    },
    locationCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 18,
      marginBottom: 20,
    },
    locationTitle: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: theme.icono,
      marginBottom: 12,
    },
    locationRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
    },
    locationItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    locationText: {
      marginLeft: 6,
      color: theme.text,
      fontSize: 13,
    },
    divider: {
      width: 1,
      height: 20,
      backgroundColor: theme.contactDivider,
    },
    okButton: {
      backgroundColor: theme.tabBackground,
      paddingVertical: 18,
      borderRadius: 20,
      alignItems: "center" as const,
      marginBottom: 15,
    },
    okButtonText: {
      color: theme.headerText,
      fontSize: 18,
      fontWeight: "700" as const,
    },
    okButtonSubtext: {
      color: theme.headerText,
      fontSize: 12,
      opacity: 0.85,
      marginTop: 2,
    },
    callRow: {
      flexDirection: "row" as const,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    callText: {
      marginLeft: 8,
      color: theme.icono,
      fontSize: 15,
      fontWeight: "600" as const,
    },

    // Ventana de verificacion para cancelar la alerta
    confirmOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    confirmCard: {
      width: "85%" as const,
      backgroundColor: theme.containerBackground,
      borderRadius: 28,
      padding: 24,
      alignItems: "center" as const,
    },
    confirmIconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.card,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginBottom: 14,
    },
    confirmTitle: {
      fontSize: 20,
      fontWeight: "800" as const,
      color: theme.icono,
      marginBottom: 8,
      textAlign: "center" as const,
    },
    confirmDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.text,
      textAlign: "center" as const,
      marginBottom: 20,
    },
    confirmButtonYes: {
      width: "100%" as const,
      backgroundColor: theme.tabBackground,
      paddingVertical: 15,
      borderRadius: 16,
      alignItems: "center" as const,
      marginBottom: 10,
    },
    confirmButtonYesText: {
      color: theme.headerText,
      fontSize: 16,
      fontWeight: "700" as const,
    },
    confirmButtonNo: {
      width: "100%" as const,
      paddingVertical: 13,
      borderRadius: 16,
      alignItems: "center" as const,
      borderWidth: 2,
      borderColor: theme.icono,
    },
    confirmButtonNoText: {
      color: theme.icono,
      fontSize: 15,
      fontWeight: "700" as const,
    },

    botonCerrarMapa: {
      position: "absolute" as const,
      bottom: 750,
      right: 20, // derecha
      alignSelf: "center" as const,
      backgroundColor: "rgba(0,0,0,0.75)",
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 24,
    },
    textoCerrarMapa: {
      color: "#ffffff",
      fontWeight: "700" as const,
      fontSize: 14,
    },
  };
};