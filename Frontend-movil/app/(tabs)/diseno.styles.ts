import {StyleSheet } from 'react-native';


export const styles = StyleSheet.create ({

    // esto es de contactos
    ContenedorPrincipal: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    TituloPagina: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    PerfilContacto: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
   
    // esto es del header
    ContenedorLogo: {
        backgroundColor: '#CEAFDC', // El color morado claro de tu imagen
        height: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30,
    },

    ImagenLogo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },

    
    
});
