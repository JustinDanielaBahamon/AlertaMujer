import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute" as const,
    top: 50,
    left: 20,
    zIndex: 1,
  },
  headerContent: {
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginHorizontal: 20,
    marginBottom: 15,
    marginTop: 20,
  },
  historyCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  historyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgb(237, 231, 246)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 14,
  },
  historyInfo: {
    flex: 1,
  },
  dateRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
  },
  timeText: {
    fontSize: 13,
  },
  addressText: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    alignItems: "center" as const,
    marginBottom: 20,
  },
  modalIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgb(237, 231, 246)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    textAlign: "center" as const,
  },
  modalBody: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  mapPreview: {
    height: 150,
    borderRadius: 12,
    overflow: "hidden" as const,
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  modalCloseButton: {
    backgroundColor: "#7B1DB2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "bold" as const,
    fontSize: 16,
  },
});
