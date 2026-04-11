import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Inicio from "../screens/tabs/inicio";
import Mapa from "../screens/tabs/mapa/MapaView";
import Contactos from "../screens/tabs/contactos/contactos";
import Historial from "../screens/tabs/historialAlerta/historial";
import Alerta from "../screens/tabs/alerta";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={Inicio} />
      <Tab.Screen name="Alerta" component={Alerta} />
      <Tab.Screen name="Mapa" component={Mapa} />
      <Tab.Screen name="Contactos" component={Contactos} />
      <Tab.Screen name="Historial" component={Historial} />
    </Tab.Navigator>
  );
}