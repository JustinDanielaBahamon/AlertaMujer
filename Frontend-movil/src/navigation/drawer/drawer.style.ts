import { StyleSheet } from "react-native";
import { AppTheme } from "../../contexts/ThemeContext";

export const obtenerEstilosDrawer = (theme: AppTheme) => StyleSheet.create({

  drawerBody: {
    flex: 1,
  },

  cardContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "rgba(43, 35, 35, 0.1)",
  },

  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: theme.tabActiveColor,   // ← borde del avatar sigue el tema
  },

  name: {
    color: theme.headerText,             // ← contraste automático
    fontSize: 18,
    fontWeight: "bold",
  },

  email: {
    color: theme.headerText,
    fontSize: 12,
    opacity: 0.8,
  },

  innerCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 15,
  },

  item: {
    color: theme.headerText,             // ← texto del menú sigue el tema
    fontSize: 16,
    marginVertical: 12,
  },

  footer: {
    padding: 20,
  },

  shareBtn: {
    backgroundColor: "#0088ff93",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  logoutBtn: {
    backgroundColor: "#ff00009f",
    padding: 12,
    borderRadius: 12,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  // Estilos que ya no se usan pero los dejamos por si acaso
  drawerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  drawerSubtitle: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.7,
  },
});