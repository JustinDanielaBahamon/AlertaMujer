import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  contenedorPrincipal: {
    flex: 1,
  },

  /* LOADING */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
  botonReintentar: {
    backgroundColor: "#7B1DB2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  botonReintentarTexto: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  /* HEADER */
  gradiente: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  headerContenido: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  SubtituloHeader:{
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft:1
  },
  tituloHeader: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  filaUbicacion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  subtituloHeader: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  badgeEnVivo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  puntoBadge: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#69ff9a",
  },
  textoBadge: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },

  /* MAPA */
  contenedorMapa: {
    height: 200,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#9e83cf",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderColor:'white',
    borderWidth:3
  },
  map: {
    flex: 1,
  },

  /* BOTONES ACCIÓN */
  filaBotones: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  botonAccion: {
    alignItems: "center",
    gap: 6,
  },
  circuloBoton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EDE7F6",
    alignItems: "center",
    justifyContent: "center",
  },
  labelBoton: {
    fontSize: 12,
    fontWeight: "500",
  },

  /* TARJETA COORDENADAS */
  tarjetaCoordenadas: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#9e83cf",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  
  },
  columnaCoord: {
    alignItems: "center",
    flex: 1,
  },
  separadorCoord: {
    width: 0.5,
    backgroundColor: "#EEE",
    marginVertical: 4,
 
  },
  labelCoord: {
    fontSize: 12,
    marginBottom: 4,
  },
  valorCoord: {
    fontSize: 20,
    fontWeight: "bold",
  },
  filaActivo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#EEE",
  },
  textoActualizacion: {
    fontSize: 12,
  },
  badgeActivo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  puntoActivo: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  textoActivo: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },

  /* HISTORIAL */
  filaTituloHistorial: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  tituloHistorial: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    paddingTop : 15,
    paddingBottom : 15
  },
  verTodo: {
    fontSize: 13,
    color: "#7B1DB2",
    fontWeight: "600",
  },
  itemHistorial: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    shadowColor: "#9e83cf",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  numeroBurbuja: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7B1DB2",
    alignItems: "center",
    justifyContent: "center",
  },
  numeroTexto: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  fechaItem: {
    fontSize: 13,
    fontWeight: "600",
  },
  coordItem: {
    fontSize: 12,
    marginTop: 2,
  },
  sinHistorial: {
    alignItems: "center",
    marginTop: 20,
  },
  textoSinHistorial: {
    fontSize: 14,
  },

  /* MODAL CERRAR */
  botonCerrarMapa: {
    position: "absolute",
    top: 20,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 50,
  },
  textoCerrar: {
    color: "white",
    fontWeight: "bold",
  },

  // Legacy — se mantienen por si algún otro componente los referencia
  container:       { flex: 1, padding: 15 },
  card:            { flex: 1, borderRadius: 25, overflow: "hidden" },
  topContainer:    { alignItems: "center", paddingVertical: 15 },
  mapContainer:    { height: "45%", marginHorizontal: 15, borderRadius: 20, overflow: "hidden" },
  bottomContainer: { flex: 1, alignItems: "center", padding: 10 },
  title:           { fontSize: 20, fontWeight: "bold" },
  subtitle:        { fontSize: 16, marginBottom: 10, fontWeight: "600" },
  historialText:   { fontSize: 14 },
  center:          { flex: 1, justifyContent: "center", alignItems: "center" },
  loading:         { marginBottom: 10 },
  table:           { width: "100%" },
  rowHeader:       { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderRadius: 10, marginBottom: 5 },
  row:             { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  cellHeader:      { flex: 1, textAlign: "center", fontWeight: "bold" },
  cell:            { flex: 1, textAlign: "center" },
});