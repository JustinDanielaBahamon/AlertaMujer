// cardStyle.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    card: {
        width: "90%",
        backgroundColor: "#F3E5F5", // Un lila clarito como el de tu imagen
        borderRadius: 40, // Bordes bien redondeados según la imagen
        padding: 25,
        marginVertical: 10,
        elevation: 5,
        alignSelf: "center",
        alignItems: 'center', // Para centrar el título
    },
    title: {
        fontSize: 24, // Más grande según la imagen
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: 'center',
        color: '#000000', // Color grisáceo del título
    },
    // --- ESTO ES LO NUEVO ---
    innerContainer: {
        backgroundColor: "#471e63", // El color morado oscuro de la imagen
        borderRadius: 30,
        padding: 20,
        width: '100%',
    },
    description: {
        fontSize: 16,
        color: "#fff", // Texto blanco para que resalte en el fondo oscuro
        flexWrap: "wrap",
        lineHeight: 22,
        textAlign: 'center', // Centrado como en la imagen
        fontWeight: '500',
    },

    
});


