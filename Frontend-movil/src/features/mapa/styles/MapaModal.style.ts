import { StyleSheet } from "react-native";
import type { AppTheme } from "../../../contexts/ThemeContext";

type Insets = { top: number; bottom: number; left: number; right: number };

// Estilos del mini-mapa y del mapa en pantalla completa del módulo Mapa.
// Mismo diseño que el mapa de "Alerta de emergencia" (píldoras redondeadas, pines numerados).
export const createMapModalStyles = (theme: AppTheme, insets: Insets) => {
  const shadow = {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  };

  return StyleSheet.create({
    // ─── MINI-MAPA (dentro de la pantalla) ───────────────────────────────
    mapCard: {
      height: 250,
      marginHorizontal: 20,
      marginVertical: 20,
      borderRadius: 28,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: theme.icon,
      backgroundColor: theme.card,
      ...shadow,
    },
    miniMap: {
      flex: 1,
    },
    miniBadge: {
      position: "absolute",
      top: 12,
      left: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.containerBackground,
      ...shadow,
    },
    miniBadgeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#D946EF",
    },
    miniBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.text,
    },
    openButton: {
      position: "absolute",
      bottom: 12,
      right: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      height: 38,
      paddingHorizontal: 14,
      borderRadius: 19,
      backgroundColor: theme.containerBackground,
      ...shadow,
    },
    openText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.icon,
    },

    // ─── PINES NUMERADOS ─────────────────────────────────────────────────
    pin: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.icon,
      opacity: 0.65,
      borderWidth: 2,
      borderColor: "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
    },
    pinText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
    },
    currentPin: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.icon,
      borderWidth: 3,
      borderColor: "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
    },
    routePin: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 2.5,
      borderColor: "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
    },

    // ─── MAPA EN PANTALLA COMPLETA ───────────────────────────────────────
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalMap: {
      flex: 1,
    },
    modalLoading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    modalTopBar: {
      position: "absolute",
      top: insets.top + 10,
      left: insets.left + 12,
      right: insets.right + 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    modalCloseBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      height: 46,
      paddingHorizontal: 16,
      borderRadius: 23,
      backgroundColor: theme.containerBackground,
      ...shadow,
    },
    modalCloseText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.icon,
    },
    modalTitlePill: {
      flex: 1,
      minHeight: 46,
      justifyContent: "center",
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 23,
      backgroundColor: theme.containerBackground,
      ...shadow,
    },
    modalTitle: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.text,
    },
    modalSub: {
      fontSize: 10.5,
      color: theme.text,
      opacity: 0.65,
    },
    modalFitBtn: {
      position: "absolute",
      bottom: insets.bottom + 16,
      right: insets.right + 16,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.containerBackground,
      justifyContent: "center",
      alignItems: "center",
      ...shadow,
    },
    modalLocBtn: {
      position: "absolute",
      bottom: insets.bottom + 76,
      right: insets.right + 16,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.containerBackground,
      justifyContent: "center",
      alignItems: "center",
      ...shadow,
    },
    modalInfo: {
      position: "absolute",
      bottom: insets.bottom + 16,
      left: insets.left + 16,
      right: insets.right + 82,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      backgroundColor: theme.containerBackground,
      ...shadow,
    },
    modalInfoText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.text,
    },
    neighborhoodInfoModal: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.icon,
      marginTop: 2,
    },
  });
};