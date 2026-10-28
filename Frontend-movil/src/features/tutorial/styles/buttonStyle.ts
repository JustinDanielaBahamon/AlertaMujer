import { StyleSheet } from "react-native";
import { TUTORIAL_PALETTE } from "./tutorialTheme";


// ─── Improved palette: red · purple · green ───────────────────────────────────
export const BUTTON_COLORS = {
  ...TUTORIAL_PALETTE,
  circle5: "#a010f3",
  row1Gradient: ["#7C3AED", "#6006aa"],
  row2Gradient: ["#6006aa", "#9326DC"],
  row3Gradient: ["#9326DC", "#7C3AED"],
  badgeBg: "#F5F3FF",
};

export const buttonStyle = StyleSheet.create({
  // ── Background ────────────────────────────────────────────────────────────────
  screenBg: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  // ── Background circles — generic base used by BackgroundCircles ──────────────
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

  // ── ScrollView inside the card ───────────────────────────────────────────────
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingBottom: 8,
  },

  // ── Section label ────────────────────────────────────────────────────────────
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: BUTTON_COLORS.sectionLabel,
    letterSpacing: 1.4,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: BUTTON_COLORS.sectionLine,
  },

  // ── "Tap" row ───────────────────────────────────────────────────────────────
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

  // ── Row icon ─────────────────────────────────────────────────────────────────
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

  // ── Row text ─────────────────────────────────────────────────────────────────
  rowTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#140c83",
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },

  // ── Level badge ───────────────────────────────────────────────────────────────
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
    backgroundColor: BUTTON_COLORS.divider,
    marginVertical: 14,
  },

  // ── Detailed description ─────────────────────────────────────────────────────
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

  // ── Demo section ─────────────────────────────────────────────────────────────
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
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#E3C6F5",
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#991b99",
  },

  // ── Badge inferior ───────────────────────────────────────────────────────────
  bottomBadge: {
    alignSelf: "center",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E3C6F5",
  },
  bottomBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5f038a",
    letterSpacing: 0.2,
  },

  // ── SOS button ───────────────────────────────────────────────────────────────
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
    borderColor: "#750775",
  },
  sosBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f30808",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#c07dd4",
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