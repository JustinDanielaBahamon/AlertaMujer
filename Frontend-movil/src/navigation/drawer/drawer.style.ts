import { StyleSheet } from "react-native";
import { AppTheme } from "../../contexts/ThemeContext";

export const obtenerEstilosDrawer = (theme: AppTheme) => StyleSheet.create({

  drawerFondo: {
    flex: 1,
    backgroundColor: theme.background,
  },

  headerZona: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",        // centra todo horizontalmente
  },

  decoracionFondo: {
    position: "absolute",
    right: -20,
    top: -10,
    zIndex: 0,
  },

  avatarFila: {
    alignItems: "center",        //  avatar centrado
    marginBottom: 12,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
  },

  nombre: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",         // nombre centrado
    zIndex: 1,
  },

  correo: {
    color: theme.text,
    fontSize: 13,
    opacity: 0.65,
    marginTop: 2,
    textAlign: "center",         // correo centrado
    zIndex: 1,
  },

  lineaAccento: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginTop: 10,
  },

  listaMenu: {
    paddingHorizontal: 16,
    gap: 8,
  },

  tarjetaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  iconoCirculo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  textoItem: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },

  chevron: {
    marginLeft: 4,
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
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  btnSubtitulo: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 1,
  },

  branding: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    opacity: 0.75,
  },

  brandingNombre: {
    fontWeight: "bold",
    fontSize: 13,
  },

  brandingSlogan: {
    fontSize: 10,
    opacity: 0.8,
  },

  // Legacy conservados
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