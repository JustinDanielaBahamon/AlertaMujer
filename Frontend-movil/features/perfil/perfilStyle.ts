import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#460447",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  btnVolver: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  tituloHeader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
    flex: 1,
  },

  // ScrollView
  scrollContent: {
    paddingBottom: 40,
  },

  // Avatar en zona morada
  contenedorFoto: {
  alignItems: "center",
  paddingTop: 16,
  paddingBottom: 36,  // ← antes era gap: 4 con paddingVertical: 24
  gap: 6,             // ← un poco más de separación
},
  circuloFoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#e8d0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  foto: {
    width: "100%",
    height: "100%",
  },
  camaraIcono: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#BC27BE",
    borderRadius: 14,
    padding: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  nombreUsuario: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
    marginTop: 10,
    marginBottom: 2,
  },
  correoUsuario: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },

  // Cuerpo blanco
  cuerpo: {
  backgroundColor: "#f7f0fa",
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  paddingTop: 28,
  paddingHorizontal: 20,
  paddingBottom: 40,
  minHeight: 500,
  gap: 14,
  // ← sin cambios acá, el problema era en contenedorFoto
},

  // Tarjeta
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 0.5,
    borderColor: "rgba(70,4,71,0.12)",
  },
  tituloSeccion: {
    fontSize: 11,
    fontWeight: "500",
    color: "#460447",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contenedorInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0bce0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: "#faf5ff",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#2d0030",
  },

  // Botones
  btnGuardar: {
    backgroundColor: "#BC27BE",
    borderRadius: 16,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  textoGuardar: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  btnContrasena: {
    backgroundColor: "#fff",
    borderRadius: 16,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#BC27BE",
    flexDirection: "row",
    gap: 8,
  },
  textoContrasena: {
    color: "#460447",
    fontSize: 16,
    fontWeight: "500",
  },

  // Mensajes
  mensajeExito: {
    textAlign: "center",
    color: "#27ae60",
    fontSize: 14,
    fontWeight: "500",
  },
  mensajeError: {
    textAlign: "center",
    color: "#e74c3c",
    fontSize: 14,
    fontWeight: "500",
  },
});