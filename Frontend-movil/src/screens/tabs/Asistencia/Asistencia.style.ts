import { StyleSheet } from "react-native";  

export const styles = StyleSheet.create({
    ContenedorPrincipal: {
        backgroundColor: "rgb(255, 255, 255)",
        flex: 1
    },
    ContenedorCabezera: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 20, // Un poco más de espacio en cabecera
        justifyContent: 'center'
    },
    TextoCabezera: {
        fontSize: 28,
        fontWeight: 'bold',
        color:'purple'
    },
    ContenedorCuadros: {
        padding: 15, // Aumentado ligeramente para mejor respiro en bordes
    },
    // --- MEJORA RESPONSIVE: Botón de emergencia ---
    BotonPolicia: {
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: 14.5,
        height: 45, // Un poco más alto para accesibilidad táctil
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%', // Que ocupe el ancho del padre en móviles
        maxWidth: 220,  // Pero que no crezca infinito en tablets
    },
    LlamarIcono: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    llamarTexto: {
        fontSize: 18,
        color: 'white',
        marginLeft: 8
    },
    SegundaSeccion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    // --- MEJORA RESPONSIVE: Cuadros laterales ---
    ContenedorViolencia: {
        borderRadius: 22,
        padding: 20,
        width: '48%', // Usa porcentaje para que siempre quepan dos
    },
    ContenedorMental: {
        borderRadius: 22,
        padding: 20,
        width: '48%', // Usa porcentaje
        alignItems: 'flex-end'
    },
    llamarViolencia: {
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: 14.5,
        height: 40,
        width: '100%', // Se adapta al cuadro
        alignItems: 'center',
        justifyContent: 'center',
    },
    llamarMental: {
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: 14.5,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%', // Se adapta al cuadro
    },
    // --- Iconos y otros elementos ---
    iconoUser: {
        backgroundColor: 'purple',
        width: 47,
        height: 47,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    iconoBombillo: {
        backgroundColor: 'rgba(205, 117, 230, 0.29)',
        width: 47,
        height: 47,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    TerceraSeccion: {
        marginTop: 15
    },
    ContenedorPueblo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    iconoEstrella: {
        backgroundColor: 'purple',
        borderRadius: 15,
        padding: 10,
        marginRight: 10,
    },
    llamadaSegundaSeccion: {
        color: 'white',
        fontWeight: '700',
    }
});