import {StyleSheet } from 'react-native';

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
    }, ContenedorTituloFormu:{
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
});