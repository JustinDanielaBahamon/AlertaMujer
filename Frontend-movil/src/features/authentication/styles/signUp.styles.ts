import {StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // Purple background covering the whole screen (including the status bar and the bottom area)
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
        marginTop : 10, // 🔽 moves this down a bit
        marginBottom: 10, // 🔥 adds spacing with the form
    },
     LogoImage :{
        width: 140,
        height: 140,
        maxWidth: '90%',
        resizeMode: 'contain',
    },

    // Start of the form container

   FormContainer:{
        backgroundColor: '#FFF',
        marginHorizontal: 20, // side spacing
        padding: 20, // inner spacing
        borderRadius: 20,
        gap :1,
        // Shadow (optional but very pro)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        flex:0,
        elevation: 5, // for Android
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

    

    // Start of the email container design
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
    // End of the email container design

    // Start of the password container design

    passwordInput:{
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#000',
    },

    // Start of the list design
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
    // End of the list design

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

// Terms and privacy card (same colors as the inputs and the button)
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