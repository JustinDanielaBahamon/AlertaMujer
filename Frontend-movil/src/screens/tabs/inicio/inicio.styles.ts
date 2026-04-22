import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderColor: "#7B2CBF",
    borderRadius: 10,
  },

  infoUbicacion: {
    flex: 1,
    marginLeft: 10,
  },

  tituloUbicacion: {
    fontSize: 12,
    color: "#888",
  },

  textoUbicacion: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
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

  // Botón central
  centerSection: {
    flex: 1,
    justifyContent: 'center',   // ← centrado en el espacio disponible
    alignItems: 'center',
    paddingTop: 30,              // ← baja el botón de los indicadores
    paddingBottom: 0,
  },

  botonAlerta: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'yellow',
  },

  imagen: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },

  // Texto justo debajo del botón
  textoAlerta: {
    color: '#1a0030',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    lineHeight: 28,
    marginTop: 20,               // - cerca del botón pero no pegado
    marginBottom: 100,            // - espacio antes del tab bar
    paddingHorizontal: 20,
  },
  
  texto: {
    color: '#1a0030',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    lineHeight: 28,
    marginTop: 30,               // - cerca del botón pero no pegado
    marginBottom: 150,            // - espacio antes del tab bar
    paddingHorizontal: 10,
  },

  // legacy
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