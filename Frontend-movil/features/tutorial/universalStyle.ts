import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffeffda', // Un lila muy clarito de fondo (como la imagen)
    alignItems: 'center',
  },
  header: {
    marginTop: 2,
    height: 100,
  },
  img: {
    width: 215,
    height: 215,
    
  },
  illustrationWrapper: {
    height: 280, // Aumentamos un poco para que la imagen luzca
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 2, // Asegura que esté por encima de la tarjeta
    marginBottom: 1, // 👈 ESTO hace que la imagen se solape con la tarjeta
    marginTop: 30,
  },
  mainIllustration: {
    width: '90%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  }
});