import { StyleSheet } from "react-native";

// ─── Paleta del módulo Notificación — alerta & atención ──────────────────────
export const NOTIF_COLORS = {
  accent:      "#b715cc",   // dorado
  accentLight: "#FFFBEB",
  accentDark:  "#fefbff",

  row1Color:  "#7C3AED",   // Alertas SOS – rojo urgente
  row1Light:  "#ffffff",
  row1Border: "#620985",

  row2Color:  "#c706d9",   // Red de apoyo – dorado
  row2Light:  "#fffdff",
  row2Border: "#80079e",

  row3Color:  "#7C3AED",   // Rapidez – morado
  row3Light:  "#fffdff",
  row3Border: "#80079e",

  circle1: "#3b087e",
  circle2: "#9b05bd",
  circle3: "#a108af",
  circle4: "#db17ec",

  screenBg:     "#d85ad2",
  sectionLabel: "#b605da",
  sectionLine:  "#8e1ecf",
  divider:      "#c879d3",
};

export const notificationStyle = StyleSheet.create({
  screenBg: {
    flex: 1,
    backgroundColor: NOTIF_COLORS.screenBg,
  },

  bgCircleBase: {
    position: "absolute",
  },
  bgRingBase: {
    position: "absolute",
    borderWidth: 2,
    backgroundColor: "transparent",
  },

  lottieSection: {
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -6,
    marginBottom: -16,
  },
  lottie: {
    width: "100%",
    height: 200,
  },

  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingBottom: 8,
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: NOTIF_COLORS.sectionLabel,
    letterSpacing: 1.4,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: NOTIF_COLORS.sectionLine,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 13,
    gap: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  featureRowAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  rowIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowIcon: {
    fontSize: 24,
  },

  rowTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  divider: {
    height: 1,
    backgroundColor: NOTIF_COLORS.divider,
    marginVertical: 14,
  },

  descRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  descDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    flexShrink: 0,
  },
  descTextWrap: {
    flex: 1,
  },
  descHighlight: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  descBold: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#374151",
  },
  descNormal: {
    fontSize: 12.5,
    color: "#6B7280",
    lineHeight: 19,
  },

  // ── Card de permisos ───────────────────────────────────────────────────────
  permisosCard: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
    backgroundColor: NOTIF_COLORS.accentLight,
    borderWidth: 1.5,
    borderColor: NOTIF_COLORS.row2Border,
  },
  permisosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  permisosEmoji: {
    fontSize: 22,
  },
  permisosTitleWrap: {
    flex: 1,
  },
  permisosTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#990cb6",
  },
  permisosDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 2,
  },

  // ── Botón finalizar ────────────────────────────────────────────────────────
  btnFinalizar: {
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NOTIF_COLORS.accent,
    shadowColor: NOTIF_COLORS.accentDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 6,
    flexDirection: "row",
    gap: 8,
  },
  btnFinalizarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // ── Badge inferior ─────────────────────────────────────────────────────────
  bottomBadge: {
    alignSelf: "center",
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: NOTIF_COLORS.accentLight,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: NOTIF_COLORS.row2Border,
  },
  bottomBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: NOTIF_COLORS.accent,
    letterSpacing: 0.2,
  },

  // ── Overlay advertencia ────────────────────────────────────────────────────
  overlayBg: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 24,
  },
  warningBox: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffc107",
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    gap: 10,
  },
  warningText: {
    fontWeight: "bold",
    color: "#7d5a00",
    fontSize: 14,
    textAlign: "center",
  },
  btnPrimary: {
    backgroundColor: "#381052",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  btnSecondary: {
    borderColor: "#858585",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#555",
    fontWeight: "600",
    fontSize: 14,
  },
});