import {StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: "#D1C4E9", // Un morado pastel más elegante
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 30, // Bordes más redondeados para look moderno
    padding: 25,
    paddingTop: 70, 
    alignItems: "center",
    position: "relative",
    // Sombras premium
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  logoContainer: {
    position: "absolute",
    top: -55,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#7B2CBF",
    zIndex: 10,
    elevation: 20,
    shadowColor: "#7B2CBF",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  moduloContador: {
    alignItems: "center",
    marginBottom: 30,
  },
  circulo: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#F3E5F5",
    borderWidth: 8,
    borderColor: "#7B2CBF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  numero: {
    fontSize: 60,
    fontWeight: "900",
    color: "#4A148C",
  },
  textoEstado: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7B2CBF",
  },
  lista: {
    width: "100%",
    marginBottom: 25,
  },
  itemFila: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
    padding: 10,
    borderRadius: 15,
  },
  iconoFondo: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#EDE7F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemTexto: {
    color: "#444",
    fontSize: 14,
    fontWeight: "500",
  },


  botonCancelar: {
    backgroundColor: "#380369", // Color neutro para no distraer del botón principal
    width: "100%",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  textoCancelar: {
    color: "#ffffff",
    fontWeight: "600",
  },
  footerTexto: {
    marginTop: 20,
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  }
});


