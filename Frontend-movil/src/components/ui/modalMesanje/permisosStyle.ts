import { StyleSheet} from "react-native";

export const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(46, 16, 101, 0.55)', // morado oscuro translúcido
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BC27BE',
    // Sombras para Android y iOS
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: '#BC27BE',
    backgroundColor: '#FBE9FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2E1065'
  },
  modalSub: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 26,
    lineHeight: 22
  },
  confirmBtn: {
    width: '100%',
    height: 52,
    borderRadius: 25,
    backgroundColor: '#6B3FA0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#6B3FA0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  confirmBtnText: {
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
    color: '#ffffff',
  },

  backBtn: {
    width: '100%',
    height: 52,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    borderColor: '#BC27BE',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: '#6B3FA0', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.5 },
});