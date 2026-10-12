import { StyleSheet } from "react-native";

export const localStyles = StyleSheet.create({
  // Estilos de la Pantalla de Selección (Imagen 1)
  overlay: {
        flex: 1,
        backgroundColor: 'rgba(46, 16, 101, 0.55)', // morado oscuro translúcido
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 30,
        paddingHorizontal: 25,
        paddingVertical: 30,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#BC27BE',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    iconCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 2,
        borderColor: '#BC27BE',
        backgroundColor: '#FBE9FB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    iconText: {
        fontSize: 40,
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