import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 58,
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 20,
    zIndex: 1,
  },
  headerContent: {
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 5,
  },

  /* =========================
     SECCIONES
  ========================= */

  sectionContainer: {
    marginHorizontal: 18,
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginBottom: 12,
  },

  /* =========================
     MÉTODO DE SELECCIÓN
  ========================= */

  metodoContainer: {
    flexDirection: "row" as const,
    gap: 12,
  },

  metodoButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },

  metodoButtonActive: {
    backgroundColor: "rgba(123, 27, 178, 0.1)",
  },

  metodoButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },

  /* =========================
     MAPA
  ========================= */

  mapContainer: {
    height: 300,
    marginHorizontal: 18,
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden" as const,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  map: {
    flex: 1,
  },

  instructionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center" as const,
  },

  instructionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },

  /* =========================
     PUNTOS DEL RECORRIDO
  ========================= */

  puntoButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 10,
  },

  puntoButtonSelected: {
    backgroundColor: "rgba(76, 175, 80, 0.05)",
  },

  puntoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },

  puntoInfo: {
    flex: 1,
  },

  puntoLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 4,
  },

  puntoCoordenadas: {
    fontSize: 13,
  },

  puntoPlaceholder: {
    fontSize: 13,
    fontStyle: "italic" as const,
  },

  /* =========================
     CAMPOS DE NOMBRE
  ========================= */

  nombreInputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 8,
    marginBottom: 12,
  },

  nombreInput: {
    flex: 1,
    fontSize: 14,
  },

  /* =========================
     ACCIONES
  ========================= */

  actionsContainer: {
    flexDirection: "row" as const,
    gap: 12,
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 20,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  secondaryButton: {
    backgroundColor: "#E0E0E0",
  },

  secondaryButtonText: {
    color: "#333",
    fontWeight: "600" as const,
    fontSize: 15,
  },

  primaryButton: {
    backgroundColor: "#7B1DB2",
  },

  primaryButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold" as const,
    fontSize: 15,
  },

  /* =========================
     MODAL
  ========================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.58)",
    justifyContent: "flex-end",
  },

  modalContent: {
    width: "100%",
    maxHeight: "80%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 25,
  },

  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
  },

  modalList: {
    maxHeight: 400,
  },

  ubicacionItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  ubicacionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0E7FF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },

  ubicacionInfo: {
    flex: 1,
  },

  ubicacionNombre: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 2,
  },

  ubicacionDireccion: {
    fontSize: 13,
  },
});