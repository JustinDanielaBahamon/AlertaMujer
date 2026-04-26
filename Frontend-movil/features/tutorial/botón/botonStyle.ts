import { StyleSheet } from "react-native";
import { COLORS } from "../universalStyle";

// ─── Paleta mejorada: rojo · morado · verde ───────────────────────────────────
export const BOTON_COLORS = {
  accent:       "#DC2626",
  accentLight:  "#FEE2E2",
  accentDark:   "#991B1B",

  row1Color:    "#7C3AED",
  row1Light:    "#F5F3FF",
  row1Border:   "#DDD6FE",
  row1Gradient: ["#7C3AED", "#9F67FF"],

  row2Color:    "#059669",
  row2Light:    "#ECFDF5",
  row2Border:   "#A7F3D0",
  row2Gradient: ["#059669", "#10B981"],

  row3Color:    "#DC2626",
  row3Light:    "#FEF2F2",
  row3Border:   "#FECDD3",
  row3Gradient: ["#DC2626", "#EF4444"],

  circle1: "#7C3AED",
  circle2: "#DC2626",
  circle3: "#059669",
  circle4: "#9F67FF",
  circle5: "#EF4444",

  sectionLabel: "#7C3AED",
  sectionLine:  "#EDE9FE",
  divider:      "#F3F0FF",
  badgeBg:      "#F5F3FF",
};

export const botonStyle = StyleSheet.create({
  // ── Fondo ────────────────────────────────────────────────────────────────────
  screenBg: {
    flex: 1,
    backgroundColor: "#F0EBFF",
  },

  // ── Círculos de fondo — base genérica usada en BackgroundCircles ─────────────
  bgCircleBase: {
    position: "absolute",
  },
  bgRingBase: {
    position: "absolute",
    borderWidth: 2,
    backgroundColor: "transparent",
  },

  // ── Lottie ───────────────────────────────────────────────────────────────────
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

  // ── ScrollView dentro de la card ─────────────────────────────────────────────
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingBottom: 8,
  },

  // ── Etiqueta de sección ──────────────────────────────────────────────────────
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: BOTON_COLORS.sectionLabel,
    letterSpacing: 1.4,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: BOTON_COLORS.sectionLine,
  },

  // ── Fila tipo "tap" ──────────────────────────────────────────────────────────
  tapRow: {
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
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tapRowAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  // ── Ícono de la fila ─────────────────────────────────────────────────────────
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

  // ── Texto de la fila ─────────────────────────────────────────────────────────
  rowTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E1B4B",
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },

  // ── Badge de nivel ───────────────────────────────────────────────────────────
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

  // ── Divisor ──────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: BOTON_COLORS.divider,
    marginVertical: 14,
  },

  // ── Descripción detallada ────────────────────────────────────────────────────
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

  // ── Sección demo ─────────────────────────────────────────────────────────────
  demoContainer: {
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  demoHint: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  feedbackPill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#991B1B",
  },

  // ── Badge inferior ───────────────────────────────────────────────────────────
  bottomBadge: {
    alignSelf: "center",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  bottomBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#991B1B",
    letterSpacing: 0.2,
  },

  // ── Botón SOS ────────────────────────────────────────────────────────────────
  sosWrapper: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  sosRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  sosBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#991B1B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 14,
    elevation: 10,
  },
  sosBtnText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  sosBtnSub: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.5,
    marginTop: 1,
  },
});