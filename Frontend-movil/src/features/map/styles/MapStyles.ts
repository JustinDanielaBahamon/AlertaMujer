import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  mainContainer: {
    flex: 1,
  },

  /* LOADING */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: "#7B1DB2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  /* HEADER */
  gradient: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  HeaderSubtitle:{
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft:1
  },
  headerTitleText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  headerSubtitleText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#69ff9a",
  },
  badgeTextValue: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },

  /* MAP */
  mapWrapper: {
    height: 250,
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    elevation: 4,
    shadowColor: "#9e83cf",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderColor:'white',
    borderWidth:3
  },
  openMapButton: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "#7B1DB2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  openMapText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  /* ROUTES SWITCH */
  routesSwitchContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#9e83cf",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  routesSwitchTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  routesSwitchSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  /* MARKER CALLOUTS */
  calloutContainer: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  calloutTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },

  calloutSubtitle: {
    fontSize: 10,
    color: "#666",
  },

  /* ROUTE LABELS */
  routeLabelContainer: {
    backgroundColor: "rgba(123, 27, 178, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },

  routeLabelText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center" as const,
  },
  map: {
    flex: 1,
  },

  /* ACTION BUTTONS */
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionButton: {
    alignItems: "center",
    gap: 6,
  },
  buttonCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EDE7F6",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: "500",
  },

  /* COORDINATES CARD */
  coordinatesCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#9e83cf",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  
  },
  activeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#EEE",
  },
  updateText: {
    fontSize: 12,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D946EF",
  },
  activeText: {
    fontSize: 12,
    color: "#C026D3",
    fontWeight: "600",
  },

  /* HISTORY */
  historyTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
    paddingTop : 15,
    paddingBottom : 15
  },
  
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 17,
    elevation: 4,
    shadowColor: "#9e83cf",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bubbleNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  dateItem: {
    fontSize: 14.7,
    fontWeight: "600",
  },
  coordItem: {
    fontSize: 12.3,
    marginTop: 2,
  },
  routeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    fontStyle: "italic",
  },
  noHistory: {
    alignItems: "center",
    marginTop: 20,
  },
  noHistoryText: {
    fontSize: 14
  },

  /* CLOSE MODAL */
  closeMapButton: {
    position: "absolute",
    top: 20,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 50,
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
  },

  /* ROUTE INFORMATION MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalBody: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
  },
  modalCloseButton: {
    backgroundColor: "#7B1DB2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Legacy — kept in case another component references them
  container:       { flex: 1, padding: 15 },
  card:            { flex: 1, borderRadius: 25, overflow: "hidden" },
  topContainer:    { alignItems: "center", paddingVertical: 15 },
  mapContainer:    { height: "45%", marginHorizontal: 15, borderRadius: 20, overflow: "hidden" },
  bottomContainer: { flex: 1, alignItems: "center", padding: 10 },
  title:           { fontSize: 20, fontWeight: "bold" },
  subtitle:        { fontSize: 16, marginBottom: 10, fontWeight: "600" },
  historyText:   { fontSize: 14 },
  center:          { flex: 1, justifyContent: "center", alignItems: "center" },
  loading:         { marginBottom: 10 },
  table:           { width: "100%" },
  rowHeader:       { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderRadius: 10, marginBottom: 5 },
  row:             { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  cellHeader:      { flex: 1, textAlign: "center", fontWeight: "bold" },
  cell:            { flex: 1, textAlign: "center" },
});