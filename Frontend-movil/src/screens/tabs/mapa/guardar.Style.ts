import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 130,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    marginRight: 15,
  },

  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
  },

  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 18,
    elevation: 3,
  },

  mapContainer: {
    height: 220,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#6C2BD9",
  },

  map: {
    flex: 1,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
  },

  infoLabel: {
    fontSize: 13,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },

  notasLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },

  notasInput: {
    minHeight: 90,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    textAlignVertical: "top",
  },

  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#6C2BD9",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },

  primaryButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },

  secondaryButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#6C2BD9",
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#6C2BD9",
    fontSize: 16,
    fontWeight: "700",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },

  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
});
