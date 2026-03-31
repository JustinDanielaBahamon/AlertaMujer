import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  ContenedorPrincipal: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },

  titulo: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 12,
        color: "#111827",
        textAlign: "center",
   },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row', // ALINEA COLUMNA IZQ Y DER HORIZONTALMENTE
    alignItems: 'center', // CENTRA VERTICALMENTE LOS CONTENIDOS
    elevation: 3, // Sombra para Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  columnaIzquierda: {
    marginRight: 15, // IMPORTANTE: Espacio entre la imagen y el bloque de texto
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnaDerecha: {
    flex: 1, // IMPORTANTE: Ocupa todo el espacio restante disponible
    justifyContent: 'center',
  },
  tipo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A148C', // Morado oscuro
    marginBottom: 2, // Pequeña separación
  },
  texto: {
    fontSize: 14,
    color: '#757575', // Gris para detalles
    marginTop: 2,
  },
  estado: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5, // Separación del bloque de info
  },
  icono: {
  width: 50,
  height: 50,
  borderRadius: 25,
 
},


});
