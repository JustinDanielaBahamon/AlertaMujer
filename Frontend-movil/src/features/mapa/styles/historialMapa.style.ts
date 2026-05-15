import { StyleSheet } from "react-native";  

export const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  
    header: {
      height: 150,
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
      fontSize: 24,
      fontWeight: "700",
    },
  
    card: {
      marginHorizontal: 8,
      marginTop: 5,
      borderRadius: 28,
      padding: 18,
      elevation: 4,
    },
  
    topInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 22,
    },
  
    iconCircle: {
      width: 75,
      height: 75,
      borderRadius: 999,
      backgroundColor: "#EFE8FF",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
  
    timeText: {
      fontSize: 15,
      marginBottom: 4,
    },
  
    cityText: {
      fontSize: 28,
      fontWeight: "700",
    },
  
    coordText: {
      fontSize: 17,
      marginTop: 4,
      fontWeight: "600",
    },
  
    mapContainer: {
      height: 260,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 20,
      borderWidth:2,
      borderColor:'purple',
    },
  
    map: {
      flex: 1,
    },
  
    detailsCard: {
      borderRadius: 24,
      padding: 15,
      marginBottom: 20,
    },
  
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#ECECEC",
    },
  
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
  
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
  
    rowLabel: {
      fontSize: 15,
    },
  
    rowValue: {
      fontSize: 16,
      fontWeight: "700",
    },
  
    activeDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      backgroundColor: "#00C853",
    },
  
    noteCard: {
      borderRadius: 22,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
  
    noteTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#2A174E",
      marginBottom: 6,
    },
  
    noteText: {
      fontSize: 15,
      color: "#4D4D4D",
      lineHeight: 22,
    },
  
    editButton: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: "#6C2BD9",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 15,
    },
  
    primaryButton: {
      height: 58,
      borderRadius: 18,
      backgroundColor: "#6C2BD9",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      marginBottom: 15,
    },
  
    primaryButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "700",
    },
  
    secondaryButton: {
      height: 58,
      borderRadius: 18,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
    },
  
    secondaryButtonText: {
      color: "#6C2BD9",
      fontSize: 18,
      fontWeight: "700",
    },
  });