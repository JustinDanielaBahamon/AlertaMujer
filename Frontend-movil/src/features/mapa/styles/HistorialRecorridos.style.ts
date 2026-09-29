import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 45,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  /* =========================
     SECTION
  ========================= */

  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold" as const,
    marginHorizontal: 25,
    marginBottom: 16,
    marginTop: 26,
  },

  /* =========================
     HISTORY CARD
  ========================= */

  historyCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 15,
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: 18,

    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  historyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#F0E7FF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 14,
  },

  rutaText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#7B1DB2",
    marginTop: 4,
  },

  historyInfo: {
    flex: 1,
    minWidth: 0,
  },

  dateRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    marginBottom: 6,
  },

  dateText: {
    fontSize: 12,
    fontWeight: "500" as const,
    marginBottom: 4,
  },

  timeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },

  addressText: {
    fontSize: 13.5,
    flexShrink: 1,
  },

  locationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },

  locationText: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 5,
  },

  /* =========================
     CARD ACTIONS
  ========================= */

  cardActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },

  actionButton: {
    padding: 8,
    borderRadius: 8,
  },

  /* =========================
     MODAL
  ========================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.58)",
    justifyContent: "flex-end",
  },

  modalContent: {
    width: "100%",
    maxHeight: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 25,
  },

  modalHeader: {
    alignItems: "center" as const,
    marginBottom: 18,
  },

  modalHeaderImproved: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.12)",
  },

  modalBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  modalIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F0E7FF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    flex: 1,
    marginLeft: 12,
  },

  modalBody: {
    marginBottom: 16,
  },

  /* =========================
     INFORMATION ROWS
  ========================= */

  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    minHeight: 52,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.12)",
  },

  infoLabel: {
    flex: 1,
    fontSize: 13,
    marginLeft: 11,
  },

  infoValue: {
    maxWidth: "52%",
    fontSize: 13,
    fontWeight: "600" as const,
    textAlign: "right" as const,
  },

  /* =========================
     MAP
  ========================= */

  mapPreview: {
    height: 250,
    borderRadius: 18,
    overflow: "hidden" as const,
    marginBottom: 18,
  },

  map: {
    flex: 1,
  },

  /* =========================
     BUTTON
  ========================= */

  modalCloseButton: {
    backgroundColor: "#7B1DB2",
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  modalCloseText: {
    color: "#fff",
    fontWeight: "bold" as const,
    fontSize: 16,
  },

  /* =========================
     MODAL ACTIONS
     ========================= */

  modalActions: {
    flexDirection: "row" as const,
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  modalActionButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },

  modalButtonSecondary: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },

  modalButtonPrimary: {
    backgroundColor: "#7B1DB2",
  },

  modalActionText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
  },

  /* =========================
     EMPTY STATE
  ========================= */

  emptyState: {
    marginHorizontal: 18,
    padding: 30,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: 200,
  },

  emptyStateText: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginTop: 12,
    textAlign: "center" as const,
  },

  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center" as const,
  },
});