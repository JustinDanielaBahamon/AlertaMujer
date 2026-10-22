import {StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // Fondo morado que cubre toda la pantalla (incluye barra de estado y zona inferior)
    Screen: {
        flex: 1,
        backgroundColor: 'rgb(202, 171, 222)',
    },

    MainContainer : {
        flex : 1,
        backgroundColor : 'rgb(202 ,171, 222)',
        paddingTop : 13,
        
    },

    LogoContainer:{
        justifyContent : 'center',
        alignItems:'center',
        marginTop : 10, // 🔽 baja esto un poco
        marginBottom: 10, // 🔥 agrega separación con el form
    },
     LogoImage :{
        width: 140,
        height: 140,
        maxWidth: '90%',
        resizeMode: 'contain',
    },

    //Comienzo contenedor Formulario

   FormContainer:{
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
    }, FormTitleContainer:{
    },
    FormTitle :{
        color: 'black',
        fontSize: 22,
        fontWeight: 'bold',
        textShadowColor: 'white',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 2,
        textAlign:'center'
        
    },

    

    //Comienzo Diseño del contenedor del correo
    inputContainer: {
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
    EmailIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
        tintColor: '#000000',
        resizeMode: 'contain', 
    },
    emailInput: {
        flex:1,
        height: '100%',
        fontSize: 16,
        color: '#000'
        
    },
    //Fin Diseño del contenedor del correo

    //Comienzo diseño del contenedor de la contraseña

    passwordInput:{
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#000',
    },

    //Comienzo diseño lista
        dropdownList:{
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

        listItem:{
        padding: 10,
        fontSize: 16,
        color: '#000'
        },
    //Fin diseño lista

    sessionButton:{
  backgroundColor: 'rgba(164, 7, 255, 0.67)',
  borderRadius : 25,
  margin : 10,
  height: 50,
  alignItems : 'center',
  justifyContent: 'center',
},

sessionText:{
  color : 'white',
  fontSize  : 16,
  fontWeight : 'bold',
},

// Tarjeta de términos y privacidad (mismos colores de los inputs y el botón)
checksContainer:{
  marginTop: 20,
  marginHorizontal: 20,
  padding: 16,
  paddingBottom: 6,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#BC27BE',
  backgroundColor: 'rgba(243, 232, 255, 0.85)',
},

checkRow:{
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
},

checkBox:{
  width: 22,
  height: 22,
  borderWidth: 2,
  borderColor: '#6A3FC9',
  backgroundColor: '#FFF',
  marginRight: 10,
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
},

activeCheckBox:{
  backgroundColor: '#6A3FC9',
  borderColor: '#6A3FC9',
},

checkText:{
  flex: 1,
  fontSize: 14,
  color: '#2E1065',
},

boldText:{
  fontWeight: 'bold',
},

continueButton:{
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

continueText:{
  color: '#FFF',
  fontSize: 16,
  fontWeight: 'bold',
},
linkTextValue:{
  color: '#6A3FC9',
  fontWeight: 'bold',
  textDecorationLine: 'underline'
}
});