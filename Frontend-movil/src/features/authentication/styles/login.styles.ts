import {StyleSheet } from 'react-native';
import { rgbaColor } from 'react-native-reanimated/lib/typescript/Colors';

export const styles = StyleSheet.create({
    MainContainer : {
        flex : 1,
        backgroundColor : 'rgb(202 ,171, 222)',
        paddingTop : 13
    },

    LogoContainer:{
        justifyContent : 'center',
        alignItems:'center',
        marginTop : 10, // moves this down a bit
        marginBottom: 10, // adds spacing with the form
    },
     LogoImage :{
        width: 155,
        height: 155,
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

        elevation: 5, // for Android
    },
    FormTitleContainer:{
    },
    FormTitle :{
        color: 'black',
        fontSize: 23,
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
        height: 50,
        margin: 10,
        marginBottom: 0,
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
        flex: 1,
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
    // End of the password container

    forgotPasswordText :{
        color :'rgb(0, 174, 255)',
        textAlign: 'center',
        marginTop:10,
        fontSize:14.5
    },

    // start of the sign-in button design
    sessionButton:{
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
    
    sessionText:{
        color : 'white',
        fontSize  : 22,
        fontWeight : 'bold',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 9,
        textShadowColor: '#000',
    },
    // Start of the Google button design
    GoogleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', 
        backgroundColor: '#FFF',
        paddingVertical: 12,
        borderRadius: 30,
        marginVertical: 25,
        marginHorizontal: 30,
        position: 'relative', // Important so the icon moves relative to the button
        
        // Shadows
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
        // --- HERE IS THE TRICK ---
        position: 'absolute', // We take it out of the normal flow
        left: 20,             // We stick it to the left with a fixed margin
    },

    googleText: {
        fontSize: 16,
        color: '#A89486',
        fontWeight: '700',
    },

    // End of the Google button design

    // Sign-up container

    SignUpContainer:{
        alignItems: 'center'
    },
    HaveAccountText:{
        marginTop:-2,
        fontSize : 16
    },
    RegisterButton:{
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
    signUpText:{
        color : 'white',
        fontSize  : 19.5,
        fontWeight : 'bold',
        textShadowOffset: { width: 4, height: 1 },
        textShadowRadius: 5
    },
    TermsContainer:{
       marginLeft:20,
       marginRight:20,
       marginBottom:20
    },
    termsText:{
       textAlign:'center'
    }
    // End of sign-up
    
    // End of the form container
});