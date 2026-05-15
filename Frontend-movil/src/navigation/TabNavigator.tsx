import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTabScreenOptions } from "../components/ui/Tabs/TabsNavegationStyle";
import { useTheme } from "../contexts/ThemeContext";

import Asistencia from "../features/Asistencia/view/Asistencia";
import Contactos from "../features/contactos/view/contactos";
import Historial from "../features/historial/view/historial";
import Inicio from "../features/inicio/view/index";
import Mapa from "../features/mapa/view/MapaView";

const Tab = createBottomTabNavigator();

const TABS = [
  { name: "Inicio",    icono: "home",    iconoOff: "home-outline"    },
  { name: "Mapa",      icono: "map",     iconoOff: "map-outline"     },
  { name: "Asistencia",    icono: "medical", iconoOff: "medical-outline" },
  { name: "Contactos", icono: "people",  iconoOff: "people-outline"  },
  { name: "Historial", icono: "time",    iconoOff: "time-outline"    },
];

function TabBoton({ label, isFocused, onPress, color }: {
  label: string;
  isFocused: boolean;
  onPress: () => void;
  color: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const tab = TABS.find(t => t.name === label)!;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.25, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity style={tabStyles.boton} onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[tabStyles.contenido, { transform: [{ scale }] }]}>
        <Ionicons
          name={(isFocused ? tab.icono : tab.iconoOff) as React.ComponentProps<typeof Ionicons>["name"]}
          size={isFocused ? 26 : 22}
          color={color}
        />
        <Text style={[tabStyles.label, { color, fontWeight: isFocused ? "800" : "500" }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const tabStyles = StyleSheet.create({
  boton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  contenido: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

export default function TabNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // ← detecta el espacio de los botones Android/iOS automáticamente

  return (
    <Tab.Navigator
      tabBar={({ state, navigation }) => (
        <View style={{
          flexDirection: 'row',
          backgroundColor: theme.tabBackground,
          paddingBottom: insets.bottom > 4 ? insets.bottom : 8, // ← se adapta solo
          paddingTop: 6,
          elevation: 10,
          shadowColor: "#7B2CBF",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const color = isFocused ? theme.tabActiveColor : theme.tabInactiveColor;
            return (
              <TabBoton
                key={route.key}
                label={route.name}
                isFocused={isFocused}
                color={color}
                onPress={() => navigation.navigate(route.name)}
              />
            );
          })}
        </View>
      )}
      screenOptions={getTabScreenOptions(theme)}
    >
      <Tab.Screen name="Inicio"    component={Inicio} />
      <Tab.Screen name="Mapa"      component={Mapa} />
      <Tab.Screen name="Asistencia"    component={Asistencia} />
      <Tab.Screen name="Contactos" component={Contactos} />
      <Tab.Screen name="Historial" component={Historial} />
    </Tab.Navigator>
  );
}