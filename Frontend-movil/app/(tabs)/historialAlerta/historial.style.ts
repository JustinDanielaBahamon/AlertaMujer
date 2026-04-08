import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  ContenedorPrincipal: {
    flex: 1, // Hace que el fondo ocupe toda la pantalla
    backgroundColor: "#F8F7FF",
  },
  
  
  /* ESTILOS DEL BUSCADOR */
  contenedorBusqueda: {
    flexDirection: 'row', // Alinea el icono de lupa y el input en línea
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 50,
    // Sombras para dar efecto de relieve
    elevation: 3, 
    shadowColor: '#9e83cf',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconoBusqueda: {
    marginRight: 10,
  },
  inputBusqueda: {
    flex: 1, // Hace que el input ocupe el resto del ancho del contenedor
    fontSize: 14,
    color: '#333',
  },

  /* ESTILOS DE LA TARJETA (CARD) */
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    elevation: 4,
    shadowColor: '#9e83cf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  columnaIzquierda: {
    marginRight: 15,
    alignItems: 'center',
  },
  contenedorIcono: {
    backgroundColor: '#F3EFFF',
    padding: 5,
    borderRadius: 30,
  },
  lineaDecorativa: {
    width: 2,
    flex: 1, // Se estira para llenar el espacio vertical debajo del icono
    backgroundColor: '#E8DEF8',
    marginTop: 5,
    borderRadius: 1,
  },
  columnaDerecha: {
    flex: 1, 
    justifyContent: 'center',
  },
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Separa el tipo (izq) de la hora (der)
    alignItems: 'center',
  },
  tipo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A148C',
  },
  horaAbajo: {
    fontSize: 12,
    color: '#9e83cf',
    fontWeight: '600',
  },
  textoFecha: {
    fontSize: 13,
    color: '#757575', 
    marginTop: 4,
  },
  textoUbicacion: {
    fontSize: 13,
    color: '#757575', 
    marginTop: 2,
  },

  /* ESTILOS DE LOS BADGES (ETIQUETAS) */
  badgeEstado: {
    alignSelf: 'flex-start', // Solo ocupa el ancho necesario para el texto
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  bgEnviado: {
    backgroundColor: '#F3EFFF', // Color lavanda suave
  },
  bgCancelado: {
    backgroundColor: '#FFEBEE', // Color rojizo suave
  },
  estado: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  icono: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  textoNoResultados: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 14,
  },

  //refrescar botón 
  filaTitulo: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center', // Esto centra el título
  marginTop: 25,
  marginBottom: 10,
  paddingHorizontal: 20,
  position: 'relative', // Necesario para que el hijo absoluto se guíe por este padre
  width: '100%',
},
titulo: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#333",
  textAlign: 'center', // Asegura el centrado del texto
},
botonRefrescarHeader: {
  position: 'absolute', // El botón no ocupa espacio en el flujo, no "empuja" al título
  right: 38, // Lo pegamos al borde derecho del contenedor
  padding: 5,
},
},
);