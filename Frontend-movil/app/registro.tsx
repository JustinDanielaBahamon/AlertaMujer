import { View , Text , TouchableOpacity,Image , TextInput} from "react-native";
//import {  } from "react-native-paper";
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { rgbaColor } from 'react-native-reanimated/lib/typescript/Colors';
import {router} from 'expo-router';
import {styles} from './registro.styles'
import {useState} from 'react'

export default function Login(){
   const [mostrarPassword, setMostrarPassword] = useState(false);

  return(
    //Contenedor Principal del LOGIN
    <View style ={styles.ContenedorPrincipal}>

      {/*Contenedor Del logo*/}
      <View style={styles.ContenedorLogo}>
         <Image source={require('../assets/imagesAlertaMujer/logoAlertaMujer.png')} style={styles.ImagenLogo}/>
      </View>

      {/*Contenedor del formulario*/}
      <View style={styles.ContenedorFormulario}>
        
         <View style={styles.ContenedorTituloFormu}>
               <Text style={styles.TituloFormu}>Unete a nosotros Crea tu cuenta.</Text>
         </View>

        <View style={styles.contenedorInput}>
               <Image style={styles.IconoCorreo} source ={require ('../assets/imagesAlertaMujer//ScLogin/correo.png')}></Image>
               <TextInput style={styles.inputCorreo}  placeholder="Ingresa tu nombre ompleto" placeholderTextColor={'#000000'}/>
         </View>

         <View style={styles.contenedorInput}>
               <Image style={styles.IconoCorreo} source ={require ('../assets/imagesAlertaMujer//ScLogin/correo.png')}></Image>
               <TextInput style={styles.inputCorreo}  placeholder="Ingresa tu correo" placeholderTextColor={'#000000'}/>
         </View>

         <View style={styles.contenedorInput}>
               <TextInput 
                  style={styles.inputContraseña}  
                  secureTextEntry={!mostrarPassword}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor={'#000000'}
               />
               <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
                  <Image 
                     style={styles.IconoCorreo} 
                     source={require('../assets/imagesAlertaMujer/ScLogin/ojoPriv.png')}
                     />
               </TouchableOpacity>
         </View>

      

    </View>
    </View>

  );
}