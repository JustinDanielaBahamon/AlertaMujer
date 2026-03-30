import {StyleSheet } from 'react-native';


export const styles = StyleSheet.create ({

    container: {
        flex: 1,
    },

    topSection: {
        alignItems: 'center',
        marginTop: 20,
    },

    botonLogin: {
        color: 'white',
        borderRadius: 20,
        borderColor: 'white',
        borderWidth: 3,
        padding: 10,
        backgroundColor: 'purple',
    },

    centerSection: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',
    },

    botonAlerta: {
        width: 250,
        height: 250,
        borderRadius: 150,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'yellow',
        marginTop: 50,   // 🔼 lo baja
        marginBottom: 100,

        
    },

    
    imagen: {
    width: 500, // 1. aqui cambio el tamaño de la imagen )
    height: 500,     
    resizeMode: 'contain', // 2. Cómo ajustar la imagen dentro del recuadro
    
  },

    textoAlerta: {

        color: 'Black',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 2,
        textTransform: 'uppercase',
    }

});

    


