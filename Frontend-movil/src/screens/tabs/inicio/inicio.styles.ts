import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// ✅ Tamaño del botón proporcional a la pantalla
const BOTON_SIZE = width * 0.75;  // 62% del ancho de pantalla

export const styles = StyleSheet.create({

  container: {
  flex: 1,
  justifyContent: 'flex-start',  // ✅ todo sube arriba, sin espacio extra
},

  // Ubicación
  containerUbicacion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginHorizontal: 20,
    marginTop: 15,
    borderWidth: 2,
    borderRadius: 10,
  },

  infoUbicacion: {
    flex: 1,
    marginLeft: 10,
  },

  tituloUbicacion: {
    fontSize: 12,
  },

  textoUbicacion: {
    fontSize: 14,
    fontWeight: "bold",
  },

  iconoUbicacion: {
    fontSize: 24,
    marginRight: 10,
  },

  // Indicadores
  indicadoresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 20,
  },

  indicador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1.5,
  },

  indicadorActivo: {
    backgroundColor: '#eaffea',
    borderColor: '#2ecc71',
  },

  indicadorInactivo: {
    backgroundColor: '#fff0f0',
    borderColor: '#e74c3c',
  },

  luz: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  luzVerde: {
    backgroundColor: '#2ecc71',
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },

  luzRoja: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },

  indicadorTexto: {
    fontSize: 13,
    fontWeight: '700',
  },

  textoVerde: {
    color: '#2ecc71',
  },

  textoRojo: {
    color: '#e74c3c',
  },

  // ✅ Botón central adaptable
  // ✅ Botón central adaptable
  centerSection: {
  alignItems: 'center',
  paddingTop: height * 0.03,
},

botonAlerta: {
  width: BOTON_SIZE,
  height: BOTON_SIZE,
  borderRadius: BOTON_SIZE / 2,
  justifyContent: 'center',
  alignItems: 'center',
},

imagen: {
  width: BOTON_SIZE * 1.1,
  height: BOTON_SIZE * 1.1,
  resizeMode: 'contain',
},

texto: {
  fontSize: width * 0.045,
  fontWeight: '800',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  lineHeight: 28,
  marginTop: height * 0.040,
  paddingHorizontal: 10,
},

  topSection: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 10,
  },

  botonLogin: {
    color: 'white',
    borderRadius: 20,
    borderColor: 'white',
    borderWidth: 3,
    padding: 10,
    backgroundColor: 'purple',
  },

});