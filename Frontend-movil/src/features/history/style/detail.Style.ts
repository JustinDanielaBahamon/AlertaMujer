import { StyleSheet } from "react-native";
import { AppTheme } from "../../../contexts/ThemeContext";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    MainContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },

    Gradient: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 32,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
    },

    BackButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },

    HeaderContent: {
      width: "100%",
    },

    TypeIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },

    TypeText: {
      color: "white",
      fontSize: 24,
      fontWeight: "bold",
    },

    StatusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: "flex-start",
      marginTop: 6,
    },

    StatusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#69ff9a",
    },

    StatusText: {
      color: "white",
      fontSize: 12,
    },

    Body: {
      padding: 20,
      paddingTop: 14,
    },

    SummaryCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.containerBackground,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.contactDivider,
      marginBottom: 14,
    },

    SummaryIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
    },

    SummaryType: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 3,
    },

    SummaryMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 3,
    },

    SummaryMetaText: {
      fontSize: 13,
      color: theme.contactSubtext,
      flex: 1,
    },

    SummaryStatusBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignSelf: "flex-start",
    },

    SummaryStatusBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.4,
    },

    MapCard: {
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.89)',
      position: "relative",
     
    },

    MapBackground: {
      height: 220,
      width: "100%",
    },

    MapCenterButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.contactAccent,
      alignItems: "center",
      justifyContent: "center",
    },

    SectionTitle: {
      fontSize: 25,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 14,
    },

    InfoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: 10,
      marginBottom: 10,
    },

    InfoCard: {
      width: "48.5%",
      backgroundColor: theme.containerBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.contactDivider,
      padding: 12,
      minHeight: 96,
    },

    InfoHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
    },

    InfoLabel: {
      fontSize: 13,
      color: theme.contactSubtext,
    },

    InfoValue: {
      fontSize: 17,
      color: theme.text,
      fontWeight: "700",
      lineHeight: 22,
    },

    DescriptionCard: {
      backgroundColor: theme.containerBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.contactDivider,
      padding: 14,
      marginBottom: 18,
    },

    DescriptionTitle: {
      fontSize: 15,
      color: 'purple',
      marginBottom: 6,
      fontWeight:'800'
    },

    DescriptionText: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 22,
    },

    ActionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },

    ActionItem: {
      alignItems: "center",
      width: "24%",
      gap: 8,
    },

    ActionCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.contactBadgeBg,
      alignItems: "center",
      justifyContent: "center",
    },

    ActionText: {
      fontSize: 14,
      color: theme.text,
      textAlign: "center",
    },

    EndSeparator: {
      height: 2,
    },
    Footer:{
      backgroundColor:'white',
      padding:17
    }
  });