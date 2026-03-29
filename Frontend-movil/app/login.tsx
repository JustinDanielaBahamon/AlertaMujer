import { View , Text , TouchableOpacity,Image} from "react-native";
import { TextInput } from "react-native-paper";
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
      <View>
         <Text>Bienvenida a tu espacio de seguridad.</Text>

         <TextInput style={styles.inputCorreo}  placeholder="Ingresa tu correo" 
         left ={<TextInput.Icon icon="email" color = "white"/>}/>

         <TextInput   placeholder="Ingresa tu contraseña"/>

         <TouchableOpacity onPress={() => router.push('/recuperarContraseña')}>
          <Text> Olvidaste tu contraseña?</Text>
         </TouchableOpacity>

         <TouchableOpacity onPress={() => router.replace('/(tabs)/inicio')}>
            <Text> Iniciar Sesión</Text>
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