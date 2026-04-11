import {StyleSheet } from 'react-native';


export const styles = StyleSheet.create ({

    container: {
        flex: 1,
    },

    topSection: {
        position: 'absolute',  // lo saca del flujo normal
        top: 50,               // distancia desde arriba
        alignSelf: 'center',  
        zIndex: 10,  
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
        marginTop: 50,   //  lo baja
        marginBottom: 100,

        
    },

    
    imagen: {
        width: 300, // 1. aqui cambio el tamaño de la imagen )
        height: 300,     
        resizeMode: 'contain', // 2. Cómo ajustar la imagen dentro del recuadro
    },

    textoAlerta: {

        color: 'black',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginTop: 5, // 
        transform: [{ translateY: -25}], // lo sube un poquito
        
    },
    
    // container de la ubicación actual 

    containerUbicacion: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,

        marginHorizontal: 20, //  separa de los lados (izq/der)
        marginTop: 15,        // lo baja un poco del navbar

        borderWidth: 2,
        borderColor: "#7B2CBF",
        borderRadius: 10,
    },

    infoUbicacion: {
        flex: 1,          //ocupa el espacio central
        marginLeft: 10,
        
    },
    

    iconoUbicacion: {
        fontSize: 24,
        marginRight: 10,
    },

    tituloUbicacion: {
        fontSize: 12,
        color: "#888",
    },

    textoUbicacion: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },


});

    


