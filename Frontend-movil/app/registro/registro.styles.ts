import {StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
        ContenedorPrincipal : {
        flex : 1,
        backgroundColor : 'rgb(202 ,171, 222)',
        paddingTop : 13,
        
    },

    ContenedorLogo:{
        justifyContent : 'center',
        alignItems:'center',
        marginTop : 10, // 🔽 baja esto un poco
        marginBottom: 10, // 🔥 agrega separación con el form
    },
     ImagenLogo :{
        width: 140,
        height: 140,
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
        flex:0,
        elevation: 5, // para Android
    }, ContenedorTituloFormu:{
    },
    TituloFormu :{
        color: 'black',
        fontSize: 22,
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
        height: 42,
        margin: 10,
        marginBottom: 2.5,
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
        flex:1,
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

    //Comienzo diseño lista
        listaDropdown:{
        backgroundColor: '#FFF',
        marginHorizontal: 10,
        borderRadius: 15,
        padding: 10,

        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        },

        itemLista:{
        padding: 10,
        fontSize: 16,
        color: '#000'
        },
    //Fin diseño lista

    botonSession:{
  backgroundColor: 'rgba(164, 7, 255, 0.67)',
  borderRadius : 25,
  margin : 10,
  height: 50,
  alignItems : 'center',
  justifyContent: 'center',
},

textoSession:{
  color : 'white',
  fontSize  : 16,
  fontWeight : 'bold',
},
contenedorChecks:{
  marginTop: 20,
  marginHorizontal: 30,

},

filaCheck:{
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
},

cuadroCheck:{
  width: 20,
  height: 20,
  borderWidth: 2,
  borderColor: '#000',
  marginRight: 10,
  borderRadius: 4,
},

textoCheck:{
  flex: 1,
  fontSize: 14,
  color: '#000',
},

textoBold:{
  fontWeight: 'bold',
},

botonContinuar:{
  marginTop: 15,
  backgroundColor: '#6A3FC9',
  paddingVertical: 12,
  borderRadius: 25,
  alignItems: 'center',

  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
},

textoContinuar:{
  color: '#FFF',
  fontSize: 16,
  fontWeight: 'bold',
},
textoLink:{
  color: '#6A3FC9',
  fontWeight: 'bold',
  textDecorationLine: 'underline'
}
});
