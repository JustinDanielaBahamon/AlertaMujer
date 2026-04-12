import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9', // Gris muy claro de fondo
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
    color: '#333',
    alignSelf: 'flex-start',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 4, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 20,
    paddingBottom: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputCustom: {
    flex: 1,
    height: 50,
    fontSize: 17,
    color: '#333',
  },
  contactIcon: {
    padding: 5,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 40,
  },
  btnGuardarPrincipal: {
    width: '100%',
    height: 55,
    backgroundColor: '#A020F0', // Tu morado
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnTextWhite: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  btnCancelarLink: {
    width: '100%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffeff',
    borderRadius: 15,
    borderWidth: 1.5,        // Grosor del borde
    borderColor: '#333',
    
  },
  btnTextGray: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
});