import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(46, 16, 101, 0.55)', // morado oscuro translúcido
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BC27BE', // mismo borde de los inputs
    // Sombras
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  circuloIcono: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  titulo: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#2E1065',
    textAlign: 'center',
    marginBottom: 8,
  },
  mensaje: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 26,
  },
  boton: {
    width: '100%',
    height: 52,
    borderRadius: 25,
    backgroundColor: '#6B3FA0', // mismo morado del botón principal
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B3FA0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  botonTexto: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});