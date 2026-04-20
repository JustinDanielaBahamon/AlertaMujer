import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },

  card: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: "rgba(153, 133, 133, 0.36)",
    overflow: "hidden",
  },

  topContainer: {
    alignItems: "center",
    paddingVertical: 15,
  },

  mapContainer: {
    height: "45%",
    marginHorizontal: 15,
    borderRadius: 20,
    overflow: "hidden",
  },

  bottomContainer: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },

  map: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },

  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    fontWeight: "600",
  },

  historialText: {
    fontSize: 14,
    color: "#ffffff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loading: {
    color: "#fff",
    marginBottom: 10,
  },

  // Tabla

  table: {
    width: "100%",
  },

  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 5,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },

  cellHeader: {
    flex: 1,
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "bold",
  },

  cell: {
    flex: 1,
    textAlign: "center",
    color: "#ffffff",
  },
});