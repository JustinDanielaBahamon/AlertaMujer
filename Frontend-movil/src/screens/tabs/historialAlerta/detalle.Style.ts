import { StyleSheet } from "react-native";
import { AppTheme } from "../../../../src/contexts/ThemeContext";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    ContenedorPrincipal: {
      flex: 1,
      backgroundColor: theme.background,
    },

    Gradiente: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 32,
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
      width: "100%",
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

    Cuerpo: {
      padding: 20,
      paddingTop: 14,
    },

    TarjetaResumen: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.containerBackground,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.contactDivider,
      marginBottom: 14,
    },

    IconoResumen: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
    },

    ResumenTipo: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 3,
    },

    ResumenFilaMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 3,
    },

    ResumenMetaTexto: {
      fontSize: 13,
      color: theme.contactSubtext,
      flex: 1,
    },

    BadgeResumenEstado: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignSelf: "flex-start",
    },

    BadgeResumenEstadoTexto: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.4,
    },

    TarjetaMapa: {
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.89)',
      position: "relative",
     
    },

    MapaFondo: {
      height: 220,
      width: "100%",
    },

    BotonCentroMapa: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.contactAccent,
      alignItems: "center",
      justifyContent: "center",
    },

    SeccionTitulo: {
      fontSize: 25,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 14,
    },

    GridInformacion: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: 10,
      marginBottom: 10,
    },

    InfoCard: {
      width: "48.5%",
      backgroundColor: theme.containerBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.contactDivider,
      padding: 12,
      minHeight: 96,
    },

    InfoHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
    },

    InfoLabel: {
      fontSize: 13,
      color: theme.contactSubtext,
    },

    InfoValue: {
      fontSize: 17,
      color: theme.text,
      fontWeight: "700",
      lineHeight: 22,
    },

    TarjetaDescripcion: {
      backgroundColor: theme.containerBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.contactDivider,
      padding: 14,
      marginBottom: 18,
    },

    DescripcionTitulo: {
      fontSize: 15,
      color: 'purple',
      marginBottom: 6,
      fontWeight:'800'
    },

    DescripcionTexto: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 22,
    },

    FilaAcciones: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },

    AccionItem: {
      alignItems: "center",
      width: "24%",
      gap: 8,
    },

    AccionCirculo: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.contactBadgeBg,
      alignItems: "center",
      justifyContent: "center",
    },

    AccionTexto: {
      fontSize: 14,
      color: theme.text,
      textAlign: "center",
    },

    SeparadorFinal: {
      height: 2,
    },
    Footer:{
      backgroundColor:'white',
      padding:17
    }
  });