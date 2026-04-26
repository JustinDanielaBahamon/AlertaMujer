import { StyleSheet } from "react-native";

// ─── Paleta del módulo Contactos — familia & confianza ────────────────────────
export const CONTACTO_COLORS = {
  accent:      "#D97706",   // ámbar cálido
  accentLight: "#FFFBEB",
  accentDark:  "#B45309",

  row1Color:  "#D97706",   // Confianza – ámbar
  row1Light:  "#FFFBEB",
  row1Border: "#FDE68A",

  row2Color:  "#EA580C",   // Notificaciones – naranja
  row2Light:  "#FFF7ED",
  row2Border: "#FED7AA",

  row3Color:  "#B45309",   // Gestión – ámbar oscuro
  row3Light:  "#FEF3C7",
  row3Border: "#FDE68A",

  circle1: "#D97706",
  circle2: "#EA580C",
  circle3: "#F59E0B",
  circle4: "#FBBF24",

  screenBg:     "#FFFBF0",
  sectionLabel: "#D97706",
  sectionLine:  "#FDE68A",
  divider:      "#FEF3C7",
};

export const contactoStyle = StyleSheet.create({
  // ── Fondo ──────────────────────────────────────────────────────────────────
  screenBg: {
    flex: 1,
    backgroundColor: CONTACTO_COLORS.screenBg,
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
    color: CONTACTO_COLORS.sectionLabel,
    letterSpacing: 1.4,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: CONTACTO_COLORS.sectionLine,
  },

  // ── Fila de característica ─────────────────────────────────────────────────
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

  // ── Ícono ──────────────────────────────────────────────────────────────────
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

  // ── Texto de fila ──────────────────────────────────────────────────────────
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

  // ── Badge ──────────────────────────────────────────────────────────────────
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

  // ── Divisor ────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: CONTACTO_COLORS.divider,
    marginVertical: 14,
  },

  // ── Descripción detallada ──────────────────────────────────────────────────
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
    backgroundColor: CONTACTO_COLORS.accentLight,
    borderWidth: 1.5,
    borderColor: CONTACTO_COLORS.row1Border,
  },
  permisosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  permisosEmoji: {
    fontSize: 22,
  },
  permisosTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#78350F",
  },
  permisosDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 2,
  },

  // ── Badge inferior ─────────────────────────────────────────────────────────
  bottomBadge: {
    alignSelf: "center",
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: CONTACTO_COLORS.accentLight,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CONTACTO_COLORS.row1Border,
  },
  bottomBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: CONTACTO_COLORS.accent,
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