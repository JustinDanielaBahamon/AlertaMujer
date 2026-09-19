import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 70,
  },
  backButton: {
    position: "absolute",
    top: 70,
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
  mapContainer: {
    height: 200,
    margin: 20,
    borderRadius: 16,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  map: {
    flex: 1,
  },
  openMapButton: {
    position: "absolute" as const,
    bottom: 15,
    right: 15,
    backgroundColor: "#7B1DB2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  openMapText: {
    color: "#fff",
    fontWeight: "700" as const,
    fontSize: 12,
  },
  legendContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  zoneCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  zoneIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 14,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  zoneAddress: {
    fontSize: 13,
    marginBottom: 6,
  },
  zoneMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  zoneDistance: {
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
  fullscreenCloseButton: {
    position: "absolute" as const,
    top: 60,
    right: 20,
    backgroundColor: "#7B1DB2",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
});
