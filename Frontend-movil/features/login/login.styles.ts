import {StyleSheet } from 'react-native';
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { rgbaColor } from 'react-native-reanimated/lib/typescript/Colors';

export const styles = StyleSheet.create({
    ContenedorPrincipal : {
        flex : 1,
        backgroundColor : 'rgb(202 ,171, 222)',
        paddingTop : 13
    },

    ContenedorLogo:{
        justifyContent : 'center',
        alignItems:'center',
        marginTop : 10, // 🔽 baja esto un poco
        marginBottom: 10, // 🔥 agrega separación con el form
    },
     ImagenLogo :{
        width: 200,
        height: 200,
        maxWidth: '90%',
        resizeMode: 'contain',
    },

    //Comienzo contenedor Formulario

   ContenedorFormulario:{
        backgroundColor: '#FFF',
        marginHorizontal: 20, // separación de los lados
        padding: 20, // espacio interno
        borderRadius: 20,
        gap :1,
        // Sombra (opcional pero muy pro)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,

        elevation: 5, // para Android
    },
    ContenedorTituloFormu:{
    },
    TituloFormu :{
        color: 'black',
        fontSize: 23,
        fontWeight: 'bold',
        textShadowColor: 'white',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 2,
        textAlign:'center'
        
    },

    

    //Comienzo Diseño del contenedor del correo
    contenedorInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BC27BE', 
        borderRadius :20,
        paddingHorizontal: 5,
        height: 50,
        margin: 10,
        marginBottom: 0,
        paddingLeft :15,
        paddingRight :10,
        backgroundColor:'#F3E8FF',
        
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
        color: '#000'
        
    },
    //Fin Diseño del contenedor del correo

    //Comienzo diseño del contenedor de la contraseña

    inputContraseña:{
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#000',
    },
    // Fin Contenedor contraseña

    textoOlivarContra :{
        color :'rgb(0, 174, 255)',
        textAlign: 'center',
        marginTop:10,
        fontSize:14.5
    },

    //inicio de diseño boton sesion
    botonSession:{
         backgroundColor: 'rgba(164, 7, 255, 0.67)',
        borderRadius : 25,
        margin : 10,
        height: 46.9,
        alignItems : 'center',
        justifyContent: 'center',

        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    
    textoSession:{
        color : 'white',
        fontSize  : 22,
        fontWeight : 'bold',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 9,
        textShadowColor: '#000',
    },
    //Comienzo diseño de boton google
    BotonGoogle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', 
        backgroundColor: '#FFF',
        paddingVertical: 12,
        borderRadius: 30,
        marginVertical: 25,
        marginHorizontal: 30,
        position: 'relative', // Importante para que el icono se mueva respecto al botón
        
        // Sombras
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    logoGoogle: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
        // --- AQUÍ ESTÁ EL TRUCO ---
        position: 'absolute', // Lo sacamos del flujo normal
        left: 20,             // Lo pegamos a la izquierda con un margen fijo
    },

    textoGoogle: {
        fontSize: 16,
        color: '#A89486',
        fontWeight: '700',
    },

    //Fin diseño de boton google

    //Contenedor de registro 

    ContenedorRegistrarse:{
        alignItems: 'center'
    },
    TextoTienesCuenta:{
        marginTop:-2,
        fontSize : 16
    },
    BotonRegistrar:{
        backgroundColor: '#7953e2',
        borderColor : 'black',
        borderWidth:1,
        borderRadius : 25,
        margin : 10,
        height: 50,
        width:280,
        alignItems : 'center',
        justifyContent: 'center',
    },
    textoRegistro:{
        color : 'white',
        fontSize  : 19.5,
        fontWeight : 'bold',
        textShadowOffset: { width: 4, height: 1 },
        textShadowRadius: 5
    },
    ContenedorTermCondi:{
       marginLeft:20,
       marginRight:20,
       marginBottom:20
    },
    textoTerminosCondiciones:{
       textAlign:'center'
    }
    //Fin registro
    
    //Fin contenedor formulario
});