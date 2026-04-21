import { StyleSheet } from "react-native";

export const obtenerEstilos = (theme: any) => StyleSheet.create({
  container: {
    paddingLeft: 20,
    backgroundColor: theme.card,
    borderRadius: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingBottom: 15,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tituloSeccion: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  filaColores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  circuloWrapper: {          // ← el TouchableOpacity usa este
    padding: 3,
  },
  circulo: {                 // ← el View interior usa este
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
  checkmark: {               // ← estilo que faltaba
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});