import { StyleSheet } from "react-native";

// ─── Paleta del módulo Ubicación (alineada con el resto de la app) ───────────
export const UBIC_COLORS = {
  accent:      "#6A1B9A",
  accentDark:  "#4A148C",
  accentLight: "#F3EEFB",
  screenBg:    "#EDE7F6",
  border:      "#D6C7EF",
  placeholder: "#A98FC7",
  text:        "#2b1a3d",
  textMuted:   "#8e7ba8",
  badgeBg:     "#E4D4F5",

  warningBg:     "#FEF3C7",
  warningBorder: "#FCD34D",
  warningText:   "#92400E",
  errorColor:    "#EF4444",
};

export const locationStyle = StyleSheet.create({
  screenBg: {
    flex: 1,
    backgroundColor: UBIC_COLORS.screenBg,
  },

  lottieSection: {
    width: "100%",
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -8,
  },
  lottie: {
    width: "100%",
    height: 160,
  },

  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  // ── Encabezado del ícono circular ─────────────────────────────────────────
  headerIconWrap: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: UBIC_COLORS.accentLight,
    borderWidth: 2,
    borderColor: UBIC_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  // ── Info card ──────────────────────────────────────────────────────────────
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: UBIC_COLORS.border,
    backgroundColor: "#FFFFFF",
  },
  infoDesc: {
    flex: 1,
    fontSize: 11.5,
    color: UBIC_COLORS.textMuted,
    lineHeight: 16,
  },

  // ── Etiqueta de sección ("DEPARTAMENTO" / "MUNICIPIO") ─────────────────────
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  fieldLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: UBIC_COLORS.accent,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: UBIC_COLORS.accentDark,
    letterSpacing: 0.3,
  },

  // ── Departamento (fijo, no interactivo) ────────────────────────────────────
  fixedField: {
    backgroundColor: UBIC_COLORS.accentLight,
    borderWidth: 1.5,
    borderColor: UBIC_COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  fixedFieldValue: {
    fontSize: 14,
    fontWeight: "500",
    color: UBIC_COLORS.text,
  },
  fixedBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: UBIC_COLORS.accent,
    backgroundColor: UBIC_COLORS.badgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
  },

  // ── Picker de municipio ─────────────────────────────────────────────────────
  pickerWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: UBIC_COLORS.accent,
    overflow: "hidden",
    marginBottom: 6,
  },
  pickerWrapError: {
    borderColor: UBIC_COLORS.errorColor,
  },
  picker: {
    height: 50,
    width: "100%",
    color: UBIC_COLORS.text,
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  errorText: {
    fontSize: 11,
    fontWeight: "500",
    color: UBIC_COLORS.errorColor,
  },

  // ── Banner de validación ────────────────────────────────────────────────────
  validationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: UBIC_COLORS.warningBorder,
    backgroundColor: UBIC_COLORS.warningBg,
  },
  validationBannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "500",
    color: UBIC_COLORS.warningText,
    lineHeight: 17,
  },

  divider: {
    height: 1,
    backgroundColor: UBIC_COLORS.border,
    marginVertical: 16,
  },

  // ── Tarjeta de resumen ("TU SELECCIÓN") ─────────────────────────────────────
  seleccionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: UBIC_COLORS.border,
    padding: 12,
    gap: 10,
    marginBottom: 18,
  },
  seleccionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  seleccionRowDivider: {
    height: 1,
    backgroundColor: UBIC_COLORS.screenBg,
  },
  seleccionLabel: {
    fontSize: 12,
    color: UBIC_COLORS.textMuted,
    flex: 1,
  },
  seleccionValue: {
    fontSize: 13,
    fontWeight: "500",
    color: UBIC_COLORS.text,
  },

  // ── Botón guardar ───────────────────────────────────────────────────────────
  btnGuardar: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: UBIC_COLORS.accent,
    marginBottom: 12,
  },
  btnGuardarText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },

  // ── Insignia inferior ────────────────────────────────────────────────────────
  bottomBadge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bottomBadgeText: {
    fontSize: 11,
    color: UBIC_COLORS.textMuted,
  },
});