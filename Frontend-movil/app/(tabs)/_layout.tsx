/*aqui le indicamos con el componente Tabs que genere
 una barra tipo nav en la parte inferior con las pantallas que le indicamos abajo*/
 
import { Tabs } from "expo-router";

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