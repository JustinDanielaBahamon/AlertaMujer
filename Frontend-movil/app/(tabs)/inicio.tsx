import { View , Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Header from '../../src/components/ui/header';
import {styles} from './inicio.styles'
import { Image } from "react-native";


export default function Saludo(){
  return(

    
    <View style={styles.container}>
      <Header />

       {/* este el boton que hizo desde un principio Maicol aun asi lo deje por ahora */}
       <View style={styles.topSection}>
          <TouchableOpacity onPress={()=> router.replace("/login")}>
              
            <Text style={styles.botonLogin}>Presiona para ir login</Text>
        
          </TouchableOpacity> 
      </View>


      {/* boton de alerta  */}
      <View style={styles.centerSection}>
        <TouchableOpacity style={styles.botonAlerta}>
           <Image
              source={require('../../assets/imagesAlertaMujer/boton.png')}
              style={styles.imagen}
            />
        </TouchableOpacity>

        <Text style={styles.textoAlerta}>Presiona en caso de Emergencia</Text>
      </View>

    </View>
  );
  
}

