import {StyleSheet } from 'react-native';
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { rgbaColor } from 'react-native-reanimated/lib/typescript/Colors';

export const styles = StyleSheet.create({
    ContenedorPrincipal : {
        flex : 1,
        backgroundColor : 'rgb(202 ,171, 222)'
    },

    ContenedorLogo:{
        justifyContent : 'center',
        alignItems:'center',
        marginTop : 45
    },
     ImagenLogo :{
        width: 200,
        height: 200,
        maxWidth: '80%',
        resizeMode: 'contain',
    },

    //Comienzo contenedor Formulario

   ContenedorFormulario:{
        backgroundColor: '#FFF',
        marginTop: 20,
        marginHorizontal: 20, // separación de los lados
        padding: 20, // espacio interno
        borderRadius: 20,

        // Sombra (opcional pero muy pro)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,

        elevation: 5, // para Android
    },

    TituloFormu :{
         color: 'black',
        fontSize: 25,
        fontWeight: 'bold',
        textShadowColor: 'white',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 2,
        textAlign:'center'
    },

    

    //Comienzo Diseño del contenedor del correo
    contenedorInputCorreo: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BC27BE', 
        borderRadius :20,
        paddingHorizontal: 5,
        height: 50,
        margin: 10,
        backgroundColor: '#FFF', 
        marginBottom: 0,
        paddingLeft :15,
        paddingRight :10,
    },
    IconoCorreo: {
        width: 20,
        height: 20,
        marginRight: 10,
        tintColor: '#000000',
        resizeMode: 'contain', 
    },
    inputCorreo: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#000',
        
    },
    //Fin Diseño del contenedor del correo

    //Comienzo diseño del contenedor de la contraseña
    contenedorContraseña:{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BC27BE', 
        borderRadius :20,
        paddingHorizontal: 5,
        height: 50,
        margin: 10,
        backgroundColor: '#FFF', 
        marginBottom: 0,
        paddingLeft :15,
        paddingRight :10,
    },

    inputContraseña:{
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#000',
    },
    // Fin Contenedor contraseña

    textoOlivarContra :{
        color :'blue',
        textAlign: 'center'
    },

    //inicio de diseño boton sesion
    botonSession:{
        backgroundColor: 'rgba(164, 7, 255, 0.67)',
        borderColor : 'black',
        borderWidth:1,
        borderRadius : 20,
        margin : 10,
        height: 50,
        alignItems : 'center',
        justifyContent: 'center'
    },
    
    textoSession:{
        color : 'white',
        fontSize  : 25,
        fontWeight : 'bold',
        textShadowOffset: { width: 4, height: 1 },
        textShadowRadius: 5
    }
    //Fin contenedor formulario
});