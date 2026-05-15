import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    ContenedorPrincipal: {
        flex: 1,
        backgroundColor: 'rgb(202, 171, 222)', // Fondo morado claro
    },
    ScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    // CARD BLANCA MEJORADA
    container: {
        backgroundColor: '#FFF',
        borderRadius: 35, // Bordes más curvos y elegantes
        paddingHorizontal: 25,
        paddingVertical: 40,
        width: width * 0.88, // Ocupa el 88% del ancho de la pantalla
        // Sombras
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    ContenedorLogo: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    ImagenLogo: {
        width: 140, // Ajustado para no saturar la card
        height: 120,
        resizeMode: 'contain',
    },
    titulo: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#6B3FA0', 
        textAlign: 'center',
        marginBottom: 12,
        paddingHorizontal: 10,
    },
    subtitulo: { 
        textAlign: 'center', 
        color: '#777', 
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 35,
        paddingHorizontal: 5,
    },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F8F9FA', 
        borderRadius: 15, 
        paddingHorizontal: 15,
        height: 60, 
        marginBottom: 30,
        borderWidth: 1.5,
        borderColor: '#EEE'
    },
    codigoContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 35,
        paddingHorizontal: 5,
    },
    inputCuadro: {
        width: 60, 
        height: 65, 
        borderWidth: 2, 
        borderColor: '#6B3FA0',
        borderRadius: 15, 
        textAlign: 'center', 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: '#6B3FA0',
        backgroundColor: '#FDFDFF'
    },
    botonPrincipal: {
        backgroundColor: '#6B3FA0', 
        height: 60, 
        borderRadius: 18, // Botón con curvas similares a la card
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%', 
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    botonTexto: { 
        color: '#FFF', 
        fontSize: 18, 
        fontWeight: 'bold',
        letterSpacing: 0.5 
    },
    linkTexto: { 
        color: '#6B3FA0', 
        textAlign: 'center', 
        fontWeight: '600',
        fontSize: 15,
        marginTop: 25
    }
});