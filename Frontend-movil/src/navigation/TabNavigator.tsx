import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Inicio from "../../app/(drawer)/(tabs)/inicio";
import Mapa from "../../app/(drawer)/(tabs)/mapa/MapaView";
import Contactos from "../../app/(drawer)/(tabs)/contactos/contactos";
import Historial from "../../app/(drawer)/(tabs)/historialAlerta/historial";
import Alerta from "../../app/(drawer)/(tabs)/alerta";

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