import { StyleSheet } from "react-native";

export const COLORS = {
  screenBg:    "#EDE7F6",
  accent:      "#6A1B9A",
  accentDark:  "#4A148C",
  accentLight: "#F3EEFB",
  border:      "#D6C7EF",
  inputBorder: "#B085D9",
  placeholder: "#A98FC7",
  text:        "#2b1a3d",
  textMuted:   "#8e7ba8",
  errorColor:  "#D81B60",
  white:       "#FFFFFF",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Header con degradado ────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 45,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: COLORS.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
  },

  // ── Mapa ─────────────────────────────────────────────────────────────────
  mapContainer: {
    marginTop: 20,
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginBottom: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  map: {
    flex: 1,
  },

  // ── Bloques de campo genéricos ──────────────────────────────────────────
  fieldBlock: {
    marginBottom: 22,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.accentDark,
  },
  requiredMark: {
    fontSize: 14,
    color: COLORS.errorColor,
    fontWeight: "600",
  },

  // ── Input de nombre ──────────────────────────────────────────────────────
  nombreInput: {
    backgroundColor: COLORS.accentLight,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.text,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: COLORS.errorColor,
    backgroundColor: "#FFF5F5",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.errorColor,
  },

  // ── Chips de sugerencia ──────────────────────────────────────────────────
  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.accent,
  },

  // ── Info geocodificada ───────────────────────────────────────────────────
  infoBlock: {
    gap: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoDoubleRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 2,
  },

  // ── Notas ────────────────────────────────────────────────────────────────
  notasLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  notasHelper: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
    lineHeight: 16,
  },
  notasInput: {
    minHeight: 80,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  maxCharWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  maxCharText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.errorColor,
  },

  // ── Botones ──────────────────────────────────────────────────────────────
  primaryButton: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "700",
  },

  // ── Loading ──────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});