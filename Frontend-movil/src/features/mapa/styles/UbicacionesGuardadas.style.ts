import { StyleSheet } from "react-native";
import { AppTheme } from "../../../contexts/ThemeContext";

export const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    // =====================================================
    // CONTENEDOR
    // =====================================================

    container: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 20,
    },

    // =====================================================
    // HEADER
    // =====================================================

    header: {
      height: 75,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingTop: 8,
    },

    backButton: {
      width: 38,
      height: 38,
      justifyContent: "center",
      alignItems: "center",
    },

    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
    },

    headerTitle: {
      fontSize: 17,
      fontWeight: "700",
    },

    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#E8D5F5",
      justifyContent: "center",
      alignItems: "center",
    },

    // =====================================================
    // ESTADO VACÍO
    // =====================================================

    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      marginTop: 100,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginTop: 16,
      textAlign: "center",
    },

    emptyDescription: {
      fontSize: 13,
      marginTop: 8,
      textAlign: "center",
      lineHeight: 18,
    },

    // =====================================================
    // LISTA
    // =====================================================

    listContainer: {
      paddingHorizontal: 18,
      marginTop: 10,
      gap: 12,
    },

    // =====================================================
    // CARD
    // =====================================================

    card: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: "#E6E6E6",
    },

    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },

    cardHeaderLeft: {
      flex: 1,
    },

    riskBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
    },

    riskText: {
      fontSize: 11,
      fontWeight: "700",
    },

    deleteButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#FFF5F5",
      justifyContent: "center",
      alignItems: "center",
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },

    cardAddress: {
      fontSize: 13,
      marginBottom: 2,
    },

    cardCity: {
      fontSize: 12,
      marginBottom: 10,
    },

    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#E6E6E6",
    },

    cardFooterLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    cardCoords: {
      fontSize: 10,
    },

    // =====================================================
    // BÚSQUEDA
    // =====================================================

    searchContainer: {
      paddingHorizontal: 18,
      marginTop: 10,
      marginBottom: 12,
    },

    searchInput: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 10,
      borderWidth: 1,
      borderColor: "#E6E6E6",
    },

    searchText: {
      flex: 1,
      fontSize: 13,
    },

    // =====================================================
    // FILTROS
    // =====================================================

    filtersContainer: {
      flexDirection: "row",
      paddingHorizontal: 18,
      marginBottom: 8,
      gap: 8,
      flexWrap: "wrap",
    },

    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#E6E6E6",
    },

    filterChipActive: {
      borderColor: "transparent",
    },

    filterText: {
      fontSize: 11,
      fontWeight: "600",
    },

    resultsCount: {
      fontSize: 11,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 4,
    },

  });
};
