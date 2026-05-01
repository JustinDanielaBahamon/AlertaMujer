import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  ContenedorPrincipal: {
    flex: 1,
    backgroundColor: "#EDE7F6",
  },

  /* HEADER */
  Header: {
    marginBottom: 0,
  },
  Gradiente: {
    paddingTop: 0.1,
    paddingHorizontal: 15,
    paddingBottom: 45,
    borderBottomLeftRadius: 41,
    borderBottomRightRadius: 41,
  },
  HeaderContenido: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  TituloHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    width: 220,
  },
  SubtituloHeader: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
    lineHeight: 20,
    width: 220,
  },

  /* BUSCADOR — flota sobre el gradiente */
  contenedorBusqueda: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 52,
    marginHorizontal: 20,
    marginTop: 10,        // sube sobre el gradiente
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#9e83cf",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  iconoBusqueda: {
    marginRight: 10,
  },
  inputBusqueda: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,

  },

  /* TARJETA DE ESTADÍSTICAS */
  tarjetaEstadisticas: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    elevation: 3,
    shadowColor: "#9e83cf",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
    fontWeight: "600",
    marginBottom: 4,
  },
  statNumero: {
    fontSize: 26,
    fontWeight: "bold",
  },
  statSublabel: {
    fontSize: 11,
    color: "#9E9E9E",
    marginTop: 2,
  },
  separadorStat: {
    width: 1,
    backgroundColor: "#EEE",
    marginVertical: 4,
  },

  /* CARDS */
  cardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 3,
    shadowColor: "#9e83cf",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  /* COLUMNAS */
  columnaIzquierda: {
    marginRight: 14,
    alignItems: "center",
  },
  contenedorIcono: {
    padding: 6,
    borderRadius: 30,
  },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  lineaDecorativa: {
    width: 2,
    flex: 1,
    backgroundColor: "#E8DEF8",
    marginTop: 6,
    borderRadius: 1,
  },
  columnaDerecha: {
    flex: 1,
  },
  filaEncabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tipo: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filaHora: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  horaAbajo: {
    fontSize: 12,
    color: "#9e83cf",
    fontWeight: "600",
  },
  textoFecha: {
    fontSize: 13,
    color: "#757575",
    marginTop: 5,
  },
  filaUbicacionFlecha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  textoUbicacion: {
    fontSize: 13,
    color: "#757575",
  },

  /* BADGES */
  badgeEstado: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  bgEnviado: {
    backgroundColor: "#F3EFFF",
  },
  bgCancelado: {
    backgroundColor: "#FFEBEE",
  },
  estado: {
    fontSize: 11,
    fontWeight: "bold",
  },

  textoNoResultados: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },
});