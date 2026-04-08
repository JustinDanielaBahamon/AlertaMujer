import { StyleSheet } from "react-native";

export const localStyles = StyleSheet.create({
  // Estilos de la Pantalla de Selección (Imagen 1)
  overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // Fondo oscuro semitransparente
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 30,
        padding: 25,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F3E5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconText: {
        fontSize: 35,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#471e63', // Tu morado
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    infoBox: {
        width: '100%',
        backgroundColor: '#471e63', // Morado oscuro
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dataLabel: {
        color: '#D1C4E9',
        fontSize: 14,
    },
    dataValue: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer: {
        width: '100%',
        gap: 12, // Espacio entre botones
    },
    btnConfirmar: {
        width: '100%',
        height: 55,
        backgroundColor: '#471e63',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnTextConfirmar: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnRegresar: {
        width: '100%',
        height: 55,
        backgroundColor: 'transparent',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#471e63',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnTextRegresar: {
        color: '#471e63',
        fontSize: 16,
        fontWeight: 'bold',
    },
});