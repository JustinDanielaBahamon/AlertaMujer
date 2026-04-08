import { StyleSheet} from "react-native";

export const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Un poco más oscuro para que resalte
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    // Sombras para Android y iOS
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconContainer: { marginBottom: 15 },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000'
  },
  modalSub: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20
  },
  btnConfirmar: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#381052',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnConfirmarText: { 
    fontWeight: '700', 
    fontSize: 16, color:'#ffffff' },

  btnRegresar: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff', // El morado de tu app
    borderColor: '#858585',
    borderWidth: 1.5,
    alignItems: 'center',
  },
  btnRegresarText: { color: 'black', fontWeight: '700', fontSize: 16 },


  
});