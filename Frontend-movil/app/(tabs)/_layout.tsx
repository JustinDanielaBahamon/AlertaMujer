/*aqui le indicamos con el componente Tabs que genere
 una barra tipo nav en la parte inferior con las pantallas que le indicamos abajo*/

import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function TabsLayout() {
  return(
    <Tabs screenOptions={{headerShown:false}}>
      <Tabs.Screen name ="alerta"/>
      <Tabs.Screen name ="contactos"/>
      <Tabs.Screen name ="historial"/>
      <Tabs.Screen name = "inicio"/>
      <Tabs.Screen name = "mapa"/>
    </Tabs>
  );
}

/* ESTO ES PARA PONERLE UN ICONO AL MODULO DE UBICACION
  name="Mapa"
  options={{
    title: "Mapa",
    tabBarLabelStyle: { color: "white" }, // sirve para que el texto blanco, asi cuando se presione y cuando no, para que siemrpe este blanco
    tabBarIcon: ({ size }) => (
      <Image
        source={require("../../assets/imagesAlertaMujer/ScMapa/Mapa-icon.png")}
        style={{ 
          width: size * 2.0,  // largo
          height: size * 2.0, // ancho
          marginTop: 11// baja la imagen un poco
        }}
      />
    ),
  }}
/>
*/