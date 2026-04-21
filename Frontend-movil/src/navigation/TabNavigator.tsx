import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { getTabScreenOptions } from "../components/ui/Tabs/TabsNavegationStyle";

import Inicio    from "../screens/tabs/inicio";
import Mapa      from "../screens/tabs/mapa/MapaView";
import Contactos from "../screens/tabs/contactos/contactos";
import Historial from "../screens/tabs/historialAlerta/historial";
import Alerta    from "../screens/tabs/alerta";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...getTabScreenOptions(theme),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"] = "help-circle";

          if (route.name === "Inicio")         iconName = focused ? "home"    : "home-outline";
          else if (route.name === "Alerta")    iconName = focused ? "warning" : "warning-outline";
          else if (route.name === "Mapa")      iconName = focused ? "map"     : "map-outline";
          else if (route.name === "Contactos") iconName = focused ? "people"  : "people-outline";
          else if (route.name === "Historial") iconName = focused ? "time"    : "time-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio"    component={Inicio} />
      <Tab.Screen name="Mapa"      component={Mapa} />
      <Tab.Screen name="Alerta"    component={Alerta} />
      <Tab.Screen name="Contactos" component={Contactos} />
      <Tab.Screen name="Historial" component={Historial} />
    </Tab.Navigator>
  );
}