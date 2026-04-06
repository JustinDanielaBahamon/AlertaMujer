import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 30,
    color: '#000',
  },

  icon: {
    marginRight: 15,
  },

  buttonContainer: {
    width: '100%',
    marginTop: 40,
  },
  btnGuardar: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  btnTextGuardar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  btnCancelar: {
    width: '100%',
    height: 55,
    backgroundColor: '#A020F0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTextCancelar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },


    input: {
    flex: 1,              // ocupa todo el espacio restante
    height: 60,           // altura uniforme
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 18,
    backgroundColor: '#fff',
    }
});