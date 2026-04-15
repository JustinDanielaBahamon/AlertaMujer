import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
        width: "90%",
        backgroundColor: "#FFFFFF", // 👈 Cambia a Blanco para que resalte del fondo lila
        borderRadius: 40,
        padding: 20,
        // marginVertical: 10, // Quita esto para controlar el espacio con el negativo de arriba
        elevation: 10, 
        shadowColor: "#550779", // Sombra con tono morado para que sea "más lindo"
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        alignSelf: "center",
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: 'center',
        color: '#2D0C44', // Un morado muy oscuro, casi negro
    },
    innerContainer: {
        backgroundColor: "#5d2585", 
        borderRadius: 30,
        padding: 25,
        width: '100%',
        marginTop: 5, // Espacio extra bajo el título
    },
    description: {
        fontSize: 16,
        color: "#FFFFFF", // Blanco puro para máxima legibilidad
        lineHeight: 24,
        textAlign: 'center',
        fontWeight: '500',
    },
});