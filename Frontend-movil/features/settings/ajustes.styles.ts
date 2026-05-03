import { StyleSheet } from "react-native";

export const obtenerEstilos = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.card,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoSwitch: {
    fontSize: 14,
    fontWeight: '500',
  },
  filaConChevron: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tituloSeccion: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filaColores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  circuloWrapper: {
    padding: 3,
  },
  circulo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloActivo: {
    borderWidth: 3,
    borderColor: '#ffffff',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  checkmark: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});