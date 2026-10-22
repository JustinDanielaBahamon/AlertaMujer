import { StyleSheet } from "react-native";
import type { AppTheme } from "../../../contexts/ThemeContext";

// Colores del header: los mismos que la barra lateral en su estado normal
export function obtenerColoresHeader(theme: AppTheme): {
  fondo: string;
  texto: string;
} {
  return { fondo: theme.headerBackground, texto: theme.headerText };
}

export function createMetodosActivacionStyles(theme: AppTheme) {
  const accent = theme.icono;
  const accentSoft = accent + "25";
  const { fondo, texto } = obtenerColoresHeader(theme);

  return StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Header (mismo color plano que la barra lateral)
    header: {
      backgroundColor: fondo,
      paddingHorizontal: 20,
      paddingBottom: 22,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      gap: 16,
    },
    headerFila: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    btnVolver: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: texto + "26",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTextos: { flex: 1 },
    tituloHeader: {
      color: texto,
      fontSize: 20,
      fontWeight: "700",
    },
    subtituloHeader: {
      color: texto,
      opacity: 0.85,
      fontSize: 12.5,
      marginTop: 2,
    },
    headerIcono: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: texto + "26",
      alignItems: "center",
      justifyContent: "center",
    },
    resumenFila: { gap: 8 },
    resumenTexto: {
      color: texto,
      fontSize: 12.5,
      fontWeight: "600",
    },
    barraFondo: {
      height: 6,
      borderRadius: 3,
      backgroundColor: texto + "33",
      overflow: "hidden",
    },
    barraRelleno: {
      height: 6,
      borderRadius: 3,
      backgroundColor: texto,
    },

    // Contenido
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 48,
      gap: 14,
    },
    intro: {
      color: theme.text,
      opacity: 0.8,
      fontSize: 13,
      lineHeight: 19,
    },

    // Tarjeta de método
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
    tarjetaInactiva: { opacity: 0.8 },
    filaTitulo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
    },
    iconoWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: accentSoft,
    },
    tituloWrap: { flex: 1, gap: 4 },
    tituloMetodo: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
    },
    chipEstado: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: accentSoft,
    },
    chipEstadoActivo: { backgroundColor: accent },
    chipTexto: {
      color: theme.text,
      fontSize: 10.5,
      fontWeight: "700",
    },
    chipTextoActivo: { color: "#ffffff" },
    descripcionMetodo: {
      color: theme.text,
      opacity: 0.75,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 12,
    },

    // Pasos
    pasos: { opacity: 1 },
    pasosInactivos: { opacity: 0.55 },
    pasoFila: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 8,
    },
    pasoNumero: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: accentSoft,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    pasoNumeroTexto: {
      color: theme.text,
      fontSize: 11,
      fontWeight: "700",
    },
    pasoTexto: {
      color: theme.text,
      opacity: 0.85,
      fontSize: 12.5,
      lineHeight: 18,
      flex: 1,
    },

    // Aviso dentro de la tarjeta (métodos que llegan en una próxima versión)
    recomendacionesWrap: {
      backgroundColor: accentSoft,
      borderRadius: 12,
      padding: 10,
      marginTop: 4,
      gap: 6,
    },
    recomendacionesTituloFila: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    recomendacionesTitulo: {
      color: theme.text,
      fontSize: 12.5,
      fontWeight: "700",
    },
    recomendacionMarca: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      backgroundColor: "#fef3c7",
      borderRadius: 8,
      padding: 8,
    },
    recomendacionMarcaTexto: {
      color: "#78350f",
      fontSize: 11.5,
      lineHeight: 16,
      flex: 1,
    },
    recomendacionFila: {
      flexDirection: "row",
      gap: 6,
    },
    recomendacionVineta: {
      color: theme.icono,
      fontSize: 12,
      lineHeight: 16,
    },
    recomendacionTexto: {
      color: theme.text,
      fontSize: 11.5,
      lineHeight: 16,
      flex: 1,
      opacity: 0.85,
    },

    accionMetodo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.icono,
      borderRadius: 12,
      paddingVertical: 11,
      marginTop: 6,
    },
    accionMetodoTexto: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "700",
    },

    avisoWrap: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: accentSoft,
      borderRadius: 12,
      padding: 10,
      marginTop: 4,
    },
    avisoTexto: {
      color: theme.text,
      fontSize: 11.5,
      lineHeight: 16,
      flex: 1,
      opacity: 0.85,
    },

    notaWrap: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: accentSoft,
      borderRadius: 14,
      padding: 12,
      marginTop: 4,
    },
    notaTexto: {
      color: theme.text,
      fontSize: 12,
      lineHeight: 17,
      flex: 1,
      opacity: 0.85,
    },
  });
}