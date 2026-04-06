import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#C8B2D6', // El color lila de fondo
    alignItems: 'center',
    
  },
  header: {
    marginTop: 2,
  },
  logo: {
    width: 150,
    height: 150,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f3f3f3', // Color gris oscuro de la letra
    textAlign: 'center',
    marginHorizontal: 20,
    // Simulación de borde blanco:
    textShadowColor: '#000000', 
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5, // Un radio alto hace que brille el borde blanco
  },

  cardPersonalizada: {
    backgroundColor: '#EBE0F3', // Lila clarito del recuadro
    borderRadius: 30,
    padding: 30,
    width: '85%',
    elevation: 5,
  },
  textoInfo: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000',
    fontWeight: '500',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,

    paddingBottom: 25, // 🔥 ESTE es el fix real
    paddingTop: 10,
  }
  
 
});