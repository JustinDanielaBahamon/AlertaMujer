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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#fff",
    marginTop: 20,
  },
  topInfo: {
    padding: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgb(237, 231, 246)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    marginBottom: 4,
  },
  coordText: {
    fontSize: 12,
  },
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden" as const,
  },
  map: {
    flex: 1,
  },
  detailsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  rowLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  rowLabel: {
    fontSize: 14,
  },
  rowRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#27AE60",
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
