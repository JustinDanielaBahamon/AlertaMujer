import { StyleSheet } from "react-native";
import { AppTheme } from "../../../../src/contexts/ThemeContext";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({

    // ── CONTENEDOR PRINCIPAL ──────────────────────────────────────────────────
    ContenedorPrincipal: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // ── HEADER GRADIENTE ─────────────────────────────────────────────────────
    Gradiente: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 40,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
    },

    BotonVolver: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },

    HeaderContenido: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },

    IconoTipo: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },

    TipoTexto: {
      color: "white",
      fontSize: 24,
      fontWeight: "bold",
    },

    BadgeEstado: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: "flex-start",
      marginTop: 6,
    },

    PuntoEstado: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#69ff9a",
    },

    TextoEstado: {
      color: "white",
      fontSize: 12,
    },

    // ── TARJETA FECHA/HORA/DURACIÓN ───────────────────────────────────────────
    TarjetaFecha: {
      flexDirection: "row",
      backgroundColor: theme.containerBackground,
      borderRadius: 18,
      marginHorizontal: 20,
      marginTop: 18,
      paddingVertical: 16,
      paddingHorizontal: 8,
      elevation: 4,
      shadowColor: theme.headercolor2,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },

    StatItem: {
      flex: 1,
      alignItems: "center",
    },

    StatLabel: {
      fontSize: 11,
      color: theme.contactSubtext,
      marginBottom: 4,
    },

    StatValor: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },

    Separador: {
      width: 0.5,
      backgroundColor: theme.contactDivider,
      marginVertical: 4,
    },

    // ── CUERPO ────────────────────────────────────────────────────────────────
    Cuerpo: {
      padding: 20,
    },

    SeccionTitulo: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.contactSubtext,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 10,
      marginTop: 10,
    },

    // ── UBICACIÓN ─────────────────────────────────────────────────────────────
    TarjetaUbicacion: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.containerBackground,
      borderRadius: 14,
      padding: 14,
      elevation: 2,
      shadowColor: theme.headercolor2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },

    UbicacionTexto: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },

    UbicacionSubtexto: {
      fontSize: 12,
      color: theme.contactSubtext,
      marginTop: 2,
    },

    BotonMapa: {
      backgroundColor: theme.contactBadgeBg,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },

    BotonMapaTexto: {
      color: theme.contactAccent,
      fontSize: 12,
      fontWeight: "600",
    },

    // ── CONTACTO ──────────────────────────────────────────────────────────────
    TarjetaContacto: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.containerBackground,
      borderRadius: 14,
      padding: 14,
      elevation: 2,
      shadowColor: theme.headercolor2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },

    AvatarContacto: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.contactBadgeBg,
      alignItems: "center",
      justifyContent: "center",
    },

    AvatarTexto: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.contactAccent,
    },

    NombreContacto: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },

    RelacionContacto: {
      fontSize: 12,
      color: theme.contactSubtext,
    },

    FilaRecibio: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    PuntoVerde: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#4CAF50",
    },

    TextoRecibio: {
      fontSize: 12,
      color: "#4CAF50",
      fontWeight: "500",
    },

    // ── BOTÓN COMPARTIR ───────────────────────────────────────────────────────
    BotonCompartir: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.contactAccent,
      borderRadius: 14,
      padding: 15,
      marginTop: 24,
      marginBottom: 20,
    },

    BotonCompartirTexto: {
      color: "white",
      fontSize: 15,
      fontWeight: "600",
    },
  });