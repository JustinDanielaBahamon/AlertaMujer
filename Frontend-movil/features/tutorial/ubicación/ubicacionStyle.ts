import { StyleSheet } from "react-native";

// ─── Paleta del módulo Ubicación ──────────────────────────────────────────────
export const UBIC_COLORS = {
  accent:      "#059669",   // verde esmeralda
  accentLight: "#ECFDF5",
  accentDark:  "#047857",

  circle1: "#a939c0",
  circle2: "#7c3fc2",
  circle3: "#035317",
  circle4: "#34D399",

  screenBg:     "#EDFAF4",
  sectionLabel: "#059669",
  sectionLine:  "#A7F3D0",
  divider:      "#D1FAE5",

  pickerBg:     "#FFFFFF",
  pickerBorder: "#A7F3D0",
  pickerLabel:  "#065F46",

  warningBg:    "#FEF3C7",
  warningBorder:"#FCD34D",
  warningText:  "#92400E",
  warningIcon:  "#F59E0B",
};

export const ubicacionStyle = StyleSheet.create({
  // ── Fondo ──────────────────────────────────────────────────────────────────
  screenBg: {
    flex: 1,
    
  },

  // ── Círculos de fondo ──────────────────────────────────────────────────────
  bgCircleBase: {
    position: "absolute",
  },
  bgRingBase: {
    position: "absolute",
    borderWidth: 2,
    backgroundColor: "transparent",
  },

  // ── Lottie ─────────────────────────────────────────────────────────────────
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

  // ── ScrollView ─────────────────────────────────────────────────────────────
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingBottom: 8,
  },

  // ── Etiqueta de sección ────────────────────────────────────────────────────
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: UBIC_COLORS.sectionLabel,
    letterSpacing: 1.4,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: UBIC_COLORS.sectionLine,
  },

  // ── Info card superior ─────────────────────────────────────────────────────
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 13,
    gap: 12,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: UBIC_COLORS.pickerBorder,
    backgroundColor: UBIC_COLORS.accentLight,
    shadowColor: UBIC_COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  infoCardAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: UBIC_COLORS.accent,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  infoIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: UBIC_COLORS.accent + "25",
    borderWidth: 1.5,
    borderColor: UBIC_COLORS.accent + "40",
    flexShrink: 0,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: UBIC_COLORS.accent,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },

  // ── Picker group ───────────────────────────────────────────────────────────
  pickerGroup: {
    marginBottom: 12,
  },
  pickerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  pickerLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: UBIC_COLORS.accent,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: UBIC_COLORS.pickerLabel,
    letterSpacing: 0.3,
  },
  pickerWrap: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: UBIC_COLORS.pickerBorder,
    backgroundColor: UBIC_COLORS.pickerBg,
    overflow: "hidden",
    shadowColor: UBIC_COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pickerWrapError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  picker: {
    height: 50,
    width: "100%",
  },

  // ── Error inline ───────────────────────────────────────────────────────────
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },

  // ── Toast / banner de validación ───────────────────────────────────────────
  validationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    padding: 13,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: UBIC_COLORS.warningBorder,
    backgroundColor: UBIC_COLORS.warningBg,
  },
  validationBannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
    color: UBIC_COLORS.warningText,
    lineHeight: 18,
  },

  // ── Divisor ────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: UBIC_COLORS.divider,
    marginVertical: 14,
  },

  // ── Selección actual (resumen visual) ─────────────────────────────────────
  seleccionCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: UBIC_COLORS.pickerBorder,
    backgroundColor: UBIC_COLORS.accentLight,
    gap: 8,
  },
  seleccionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  seleccionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: UBIC_COLORS.accent + "20",
  },
  seleccionBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: UBIC_COLORS.accent,
    letterSpacing: 0.4,
  },
  seleccionLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  seleccionValue: {
    fontSize: 13,
    fontWeight: "700",
    color: UBIC_COLORS.accentDark,
  },

  // ── Botón guardar ──────────────────────────────────────────────────────────
  btnGuardar: {
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: UBIC_COLORS.accent,
    shadowColor: UBIC_COLORS.accentDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 6,
    flexDirection: "row",
    gap: 8,
  },
  btnGuardarText: {
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
    backgroundColor: UBIC_COLORS.accentLight,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: UBIC_COLORS.pickerBorder,
  },
  bottomBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: UBIC_COLORS.accent,
    letterSpacing: 0.2,
  },
});