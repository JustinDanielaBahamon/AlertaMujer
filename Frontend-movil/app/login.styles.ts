import {StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    ContenedorPrincipal : {
        flex : 1,
        backgroundColor : 'rgb(202 171 222)'
    },

    ContenedorLogo:{
        display:'flex',
         justifyContent : 'center',
         alignItems:'center'
    },

    ImagenLogo :{
         width: 120, 
         height: 120 
    },
    inputCorreo:{
        borderWidth : 2,
        borderColor : "#BC27BE",
        borderRadius: 50
    }
});