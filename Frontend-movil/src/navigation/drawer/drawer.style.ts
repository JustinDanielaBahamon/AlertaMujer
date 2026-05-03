import { StyleSheet } from "react-native";
import { AppTheme } from "../../contexts/ThemeContext";

export const obtenerEstilosDrawer = (theme: AppTheme) => {

  const esModoOscuro = theme.mode === "dark";

  // Modo oscuro → tarjetas translúcidas oscuras, texto claro
  // Resto de temas → tarjetas BLANCAS, texto siempre oscuro para máximo contraste
  const tarjetaBg     = esModoOscuro ? "rgba(255,255,255,0.10)" : "#ffffff";
  const tarjetaBorde  = esModoOscuro ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";
  const textoTarjeta  = esModoOscuro ? "#ffffff" : "#1a1a1a";

  // Iconos dentro del círculo: en modo oscuro usa theme.icono, en claro también
  const colorIcono = theme.icono;

  return StyleSheet.create({

    // Fondo = exactamente headerBackground, sin capas encima
    drawerFondo: {
      flex: 1,
      backgroundColor: theme.headerBackground,
    },

    // Zona de perfil = mismo headerBackground, sin backgroundColor diferente
    headerZona: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 24,
      alignItems: "center",
      // SIN backgroundColor para que sea igual al fondo del drawer
    },

    decoracionFondo: {
      position: "absolute",
      right: -20,
      top: -10,
      zIndex: 0,
    },

    avatarFila: {
      alignItems: "center",
      marginBottom: 12,
    },

    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 3,
      // borderColor inline: theme.icono
    },

    nombre: {
      color: theme.headerText,
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      zIndex: 1,
    },

    correo: {
      color: theme.headerText,
      fontSize: 13,
      opacity: 0.8,
      marginTop: 2,
      textAlign: "center",
      zIndex: 1,
    },

    lineaAccento: {
      width: 40,
      height: 3,
      borderRadius: 2,
      marginTop: 10,
      // backgroundColor inline: theme.icono
    },

    listaMenu: {
      paddingHorizontal: 16,
      gap: 8,
    },

    // Tarjetas BLANCAS en todos los temas excepto dark
    tarjetaItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: tarjetaBg,
      borderRadius: 14,
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: tarjetaBorde,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: esModoOscuro ? 0.3 : 0.10,
      shadowRadius: 6,
      elevation: 3,
    },

    iconoCirculo: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
      // backgroundColor inline: theme.icono + "22"
    },

    // Texto siempre legible según el fondo de la tarjeta
    textoItem: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: textoTarjeta,
    },

    chevron: {
      marginLeft: 4,
      opacity: 0.7,
    },

    submenuContenedor: {
      marginTop: 2,
    },

    footer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 8,
      gap: 10,
    },

    btnCompartir: {
      borderRadius: 16,
      overflow: "hidden",
    },

    btnCerrar: {
      borderRadius: 16,
      overflow: "hidden",
    },

    btnInterior: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },

    btnIconoFondo: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
    },

    btnTitulo: {
      fontWeight: "bold",
      fontSize: 15,
    },

    btnSubtitulo: {
      fontSize: 11,
      marginTop: 1,
      opacity: 0.85,
    },

    // Branding con fondo semitransparente para que siempre se vea
    branding: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginHorizontal: 16,
      marginBottom: 4,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
    },

    brandingNombre: {
      fontWeight: "bold",
      fontSize: 13,
      // color inline: theme.headerText
    },

    brandingSlogan: {
      fontSize: 10,
      // color inline: theme.headerText
    },

    // Legacy
    drawerBody: { flex: 1 },
    cardContainer: { flex: 1 },
    header: { alignItems: "center" },
    innerCard: {},
    item: { color: theme.headerText, fontSize: 16 },
    itemFila: { flexDirection: "row", alignItems: "center" },
    iconoFondo: { width: 34, height: 34, borderRadius: 10 },
    separador: { height: StyleSheet.hairlineWidth },
    shareBtn: { backgroundColor: "#0088ff93", padding: 12, borderRadius: 12 },
    logoutBtn: { backgroundColor: "#ff00009f", padding: 12, borderRadius: 12 },
    btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
    drawerHeader: { paddingHorizontal: 16, paddingVertical: 24 },
    drawerTitle: { fontSize: 18, fontWeight: "700" },
    drawerSubtitle: { marginTop: 6, fontSize: 13, opacity: 0.7 },
  });
};