import { View , Text , TouchableOpacity,Image , TextInput} from "react-native";
//import {  } from "react-native-paper";
import {router} from 'expo-router';
import {styles} from './diseno.styles'
import Header from '../../src/components/ui/header';

export default function Contactos(){
  return(
   
    <View style={styles.ContenedorPrincipal}>
      
      {/* el header importado desde la carpeta UI */}
      <Header />

     {/* titulo de contacto*/}
      <Text style={styles.TituloPagina}>Contacto</Text>

     {/* este el perfil de contacto ya sea la inicial del nombre o la foto*/}
      <View style={styles.PerfilContacto}>
        <Image 
          source={require('../../assets/imagesAlertaMujer/ScContacto/contacto.png')} 
          style={{ width: 50, height: 50, borderRadius: 25 }}
        />

        
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
            Tatiana Montero
          </Text>

          <Text style={{ color: 'gray' }}>Hermana</Text>
          <Text>3176866754</Text>
        </View>


        {/* El TouchableOpacity es un boton que lo que hace que 
        cuando se presione se vuelva un poco transparente */}
        
        <TouchableOpacity>
          <Text style={{ fontSize: 20 }}>✎</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}