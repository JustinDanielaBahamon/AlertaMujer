import { View , Text, TouchableOpacity, Vibration} from "react-native";
import { router } from "expo-router";
import Header from '../../../src/components/ui/header';
import {styles} from './inicio.styles'
import { Image } from "react-native";
import { useState } from "react";
import { MaterialIcons } from '@expo/vector-icons';


export default function Saludo(){

  const [pressed, setPressed] = useState(false);

  const activarAlerta = () => {
    Vibration.vibrate(200);
    router.push("/BotonActivacion/activacion"); //  esto te manda a la pantalla 
  };

  return(

    
    <View style={styles.container}>
      <Header />

       {/* este el boton que hizo desde un principio Maicol aun asi lo deje por ahora */}
       <View style={styles.topSection}>
          <TouchableOpacity onPress={()=> router.replace("../login/login")}>
              
            <Text style={styles.botonLogin}>Presiona para ir login</Text>
        
          </TouchableOpacity> 
      </View>

       {/* el contenedor de la ubicación actual  */}
      <View style={styles.containerUbicacion}>
        <MaterialIcons name="location-on" size={24} color="#7B2CBF" />
        <Text style={styles.iconoUbicacion}></Text>

        <View style={styles.infoUbicacion}>
          <Text style={styles.tituloUbicacion}>Ubicación actual</Text>
          <Text style={styles.textoUbicacion}>Obteniendo ubicación...</Text>
        </View>

        <MaterialIcons name="refresh" size={24} color="#7B2CBF" />

      </View>

      {/* boton de alerta  */}
       <View style={styles.centerSection}>
        <TouchableOpacity  
          activeOpacity={1}  // esto desactiva el efecto por defecto de touchableOpacity. esto me sirve para yo poder contrarla manualmente transparencia 
          onPressIn={() => setPressed(true)}  // esto activa el efecto de presionar que se hunda el boton 
          onPressOut={() => setPressed(false)}  // esto lo que hace que el boton regrese a su estado normal 
          onPress={activarAlerta}  // desde aqui enpieza la logica de que el boton vibre
          style={[
            styles.botonAlerta,
            {
              transform: [{ scale: pressed ? 0.92 : 1 }],// Cambia el tamaño del botón
              opacity: pressed ? 0.85 : 1,// Cambia la transparencia
              shadowOffset: {
                width: 0,
                height: pressed ? 2 : 10,
              },
              shadowOpacity: pressed ? 0.2 : 0.5,
              elevation: pressed ? 4 : 12,
            }
          ]}
        >
          <Image
            source={require('../../../assets/imagesAlertaMujer/ScInicio/boton2.png')}
            style={styles.imagen}
          />
        </TouchableOpacity>
        <Text style={styles.textoAlerta}>
          Presiona en caso de Emergencia
        </Text>
      </View>

    </View>
  );
  
}

