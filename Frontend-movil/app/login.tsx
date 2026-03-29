import { View , Text , TouchableOpacity,Image , TextInput} from "react-native";
//import {  } from "react-native-paper";
import {router} from 'expo-router';
import {styles} from './login.styles'

export default function Login(){
  return(
    //Contenedor Principal del LOGIN
    <View style ={styles.ContenedorPrincipal}>

      {/*Contenedor Del logo*/}
      <View style={styles.ContenedorLogo}>
         <Image source={require('../assets/imagesAlertaMujer/logoAlertaMujer.png')} style={styles.ImagenLogo}/>
      </View>

      {/*Contenedor del formulario*/}
      <View style={styles.ContenedorFormulario}>
         <Text style={styles.TituloFormu}>Bienvenida a tu espacio de seguridad.</Text>

         <View style={styles.contenedorInputCorreo}>
               <Image style={styles.IconoCorreo} source ={require ('../assets/imagesAlertaMujer/correo.png')}></Image>
               <TextInput style={styles.inputCorreo}  placeholder="Ingresa tu correo" underlineColorAndroid=''/>
         </View>

         <View style={styles.contenedorInputCorreo}>
            <TextInput style={styles.inputContraseña}  secureTextEntry placeholder="Ingresa tu contraseña" underlineColorAndroid=''/>
            <Image style={styles.IconoCorreo} source={require('../assets/imagesAlertaMujer/ojoPriv.png')}/>
         </View>

         <TouchableOpacity onPress={() => router.push('/recuperarContraseña')}>
          <Text style={styles.textoOlivarContra}> Olvidaste tu contraseña?</Text>
         </TouchableOpacity>

         <TouchableOpacity style={styles.botonSession} onPress={() => router.replace('/(tabs)/inicio')}>
            <Text style ={styles.textoSession}> Iniciar Sesión</Text>
         </TouchableOpacity>
      </View>

      {/*Contenedor de las distintas maneras de inciar con otras plataformas*/}
      <View>           
          <TouchableOpacity >
            <Text> Continuar con Google </Text>
          </TouchableOpacity>
      </View>

      {/*Contenedor del boton para Registrarse*/} 
      <View>
          <Text> ¿No tienes cuenta? </Text>
      
         <TouchableOpacity onPress={() => router.push('/recuperarContraseña')}>
            <Text> Registrate</Text>
         </TouchableOpacity>
      </View>

      {/*Contenedor del Footer del login */}
      <View>
          <Text> Si continúas,confirmas que aceptas nuestras Condiciones de Servicios y nuestro Aviso de privacidad</Text>
      </View>

    


    </View>

  );
}