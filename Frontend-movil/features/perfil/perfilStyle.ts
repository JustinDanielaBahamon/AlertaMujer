import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#460447",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  tituloHeader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  // Foto
  contenedorFoto: {
    alignItems: "center",
    gap: 12,
  },
  circuloFoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#BC27BE",
    overflow: "hidden",
    backgroundColor: "#7a2d7a",
    alignItems: "center",
    justifyContent: "center",
  },
  foto: {
    width: "100%",
    height: "100%",
  },
  btnCambiarFoto: {
    backgroundColor: "rgba(188,39,190,0.3)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BC27BE",
  },
  textoCambiarFoto: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Tarjeta
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    gap: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#460447",
    marginBottom: 4,
  },
  contenedorInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BC27BE",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: "#F3E8FF",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  // Incognito switch
  filaIncognito: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BC27BE",
  },
  textoIncognito: {
    fontSize: 15,
    fontWeight: "600",
    color: "#460447",
  },
  subtextoIncognito: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  // Botones
  btnGuardar: {
    backgroundColor: "rgba(164,7,255,0.85)",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  textoGuardar: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  btnContrasena: {
    backgroundColor: "#fff",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#BC27BE",
    flexDirection: "row",
    gap: 8,
  },
  textoContrasena: {
    color: "#460447",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Mensaje
  mensajeExito: {
    textAlign: "center",
    color: "#2ecc71",
    fontSize: 14,
    fontWeight: "600",
  },
  mensajeError: {
    textAlign: "center",
    color: "#e74c3c",
    fontSize: 14,
    fontWeight: "600",
  },
});