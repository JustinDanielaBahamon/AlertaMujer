import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf8ff', // Un lila muy clarito de fondo (como la imagen)
    alignItems: 'center',
  },
  header: {
    marginTop: 10,
    height: 100,
  },
  logo: {
    width: 140,
    height: 100,
  },
  illustrationWrapper: {
    height: 280, // Aumentamos un poco para que la imagen luzca
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 2, // Asegura que esté por encima de la tarjeta
    marginBottom: -40, // 👈 ESTO hace que la imagen se solape con la tarjeta
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