import { StyleSheet } from 'react-native';

export const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '86%',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  iconoHeader: {
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 12,
    opacity: 0.65,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  codigo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codigoTexto: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  opcionTexto: {
    fontSize: 15,
    fontWeight: '700',
  },
  opcionSub: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 1,
  },
  btnCerrar: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCerrarTexto: {
    fontSize: 14,
    fontWeight: '700',
  },
});
