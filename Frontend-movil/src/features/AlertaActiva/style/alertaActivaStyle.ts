import { AppTheme } from "../../../contexts/ThemeContext";

// Fabrica de estilos para la pantalla AlertaActiva.
// Recibe el tema, el tamano de pantalla (useWindowDimensions) y los insets (notch, barra de
// gestos, bordes laterales) para adaptarse a moviles pequenos, grandes y tablets, y que nada
// quede pegado a los bordes del celular ni tapado por el sistema.
type Insets = { top: number; bottom: number; left: number; right: number };

export const createStyles = (
  theme: AppTheme,
  width: number,
  height: number,
  insets: Insets,
) => {
  const isCompact = width < 360; // moviles chicos (ej. iPhone SE)
  const isWide = width >= 500; // tablets / pantallas grandes

  const horizontalPadding = Math.max(16, Math.min(width * 0.06, 32));
  const circleSize = Math.round(Math.min(Math.max(width * 0.42, 130), 190));

  const sombra = {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  };

  return {
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    mainContainer: {
      flexGrow: 1,
      paddingTop: insets.top + 12,
      paddingBottom: insets.bottom + 30,
      paddingLeft: horizontalPadding + insets.left,
      paddingRight: horizontalPadding + insets.right,
    },
    // Limita el ancho en tablets / horizontal y centra el contenido.
    wrap: {
      width: "100%" as const,
      maxWidth: 560,
      alignSelf: "center" as const,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "flex-end" as const,
      alignItems: "center" as const,
      marginBottom: 10,
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

    // Pines numerados (mapa de la ventana emergente)
    pin: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.icono,
      opacity: 0.65,
      borderWidth: 2,
      borderColor: "#FFFFFF",
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    pinText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "800" as const,
    },
    pinActual: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.icono,
      borderWidth: 3,
      borderColor: "#FFFFFF",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      elevation: 6,
    },
    pinActualText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900" as const,
    },
    title: {
      fontSize: isCompact ? 20 : isWide ? 28 : 24,
      fontWeight: "800" as const,
      color: theme.icono,
      marginTop: 1,
      textAlign: "center" as const,
    },
    subtitle: {
      fontSize: isCompact ? 12 : 14,
      color: theme.text,
      marginBottom: 12,
      textAlign: "center" as const,
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

    // Ventana emergente del mapa (mismo diseno que "Alerta de emergencia")
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalMap: {
      flex: 1,
    },
    modalTopBar: {
      position: "absolute" as const,
      top: insets.top + 10,
      left: insets.left + 12,
      right: insets.right + 12,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 10,
    },
    modalCloseBtn: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 6,
      height: 46,
      paddingHorizontal: 16,
      borderRadius: 23,
      backgroundColor: theme.containerBackground,
      ...sombra,
    },
    modalCloseText: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: theme.icono,
    },
    modalTitlePill: {
      flex: 1,
      minHeight: 46,
      justifyContent: "center" as const,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 23,
      backgroundColor: theme.containerBackground,
      ...sombra,
    },
    modalTitle: {
      fontSize: 12,
      fontWeight: "800" as const,
      color: theme.text,
    },
    modalSub: {
      fontSize: 10.5,
      color: theme.text,
      opacity: 0.65,
    },
    modalFitBtn: {
      position: "absolute" as const,
      bottom: insets.bottom + 16,
      right: insets.right + 16,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.containerBackground,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      ...sombra,
    },
    modalInfo: {
      position: "absolute" as const,
      bottom: insets.bottom + 16,
      left: insets.left + 16,
      right: insets.right + 82,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      backgroundColor: theme.containerBackground,
      ...sombra,
    },
    modalInfoText: {
      fontSize: 12,
      fontWeight: "700" as const,
      color: theme.text,
    },
    modalInfoBarrio: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: theme.icono,
      marginTop: 2,
    },
  };
};