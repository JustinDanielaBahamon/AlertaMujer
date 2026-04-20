import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  drawerBody: {
    flex: 1,
  },

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

  // Nuevos estilos

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
    borderColor: "#778bff",
  },

  name: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },

  email: {
    color: "#ffffff",
    fontSize: 12,
  },

  innerCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 15,
  },

  item: {
    color: "#ffffff",
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

});