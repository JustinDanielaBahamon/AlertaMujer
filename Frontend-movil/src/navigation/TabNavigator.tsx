import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTabScreenOptions } from "../components/ui/Tabs/TabsNavegationStyle";
import { useTheme } from "../contexts/ThemeContext";
import { useLocale } from "../contexts/LocaleContext";

import Assistance from "../features/Asistencia/view/Asistencia";
import ContactsTab from "../features/contactos/view/contactos";
import HistoryTab from "../features/historial/view/historial";
import Home from "../features/inicio/view/index";
import Mapa from "../features/mapa/view/MapaView";

const Tab = createBottomTabNavigator();

const TABS = [
  { name: "Inicio",    icon: "home",    offIcon: "home-outline"    },
  { name: "Mapa",      icon: "map",     offIcon: "map-outline"     },
  { name: "Asistencia",    icon: "medical", offIcon: "medical-outline" },
  { name: "Contactos", icon: "people",  offIcon: "people-outline"  },
  { name: "Historial", icon: "time",    offIcon: "time-outline"    },
];

function TabButton({ routeName, label, isFocused, onPress, color }: {
  routeName: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  color: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const tab = TABS.find(t => t.name === routeName)!;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.25, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity style={tabStyles.button} onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[tabStyles.content, { transform: [{ scale }] }]}>
        <Ionicons
          name={(isFocused ? tab.icon : tab.offIcon) as React.ComponentProps<typeof Ionicons>["name"]}
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
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  content: {
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
  const { t } = useLocale();
  const insets = useSafeAreaInsets(); // ← detecta el espacio de los botones Android/iOS automáticamente

  // Traduce cada nombre de ruta a su texto visible en el idioma activo
  const tabLabels: Record<string, string> = {
    Inicio: t.menu.inicio,
    Mapa: t.menu.mapa,
    Asistencia: t.menu.asistencia,
    Contactos: t.menu.contactos,
    Historial: t.menu.historial,
  };

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
              <TabButton
                key={route.key}
                routeName={route.name}
                label={tabLabels[route.name] ?? route.name}
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
      <Tab.Screen name="Inicio"    component={Home} />
      <Tab.Screen name="Mapa"      component={Mapa} />
      <Tab.Screen name="Asistencia"    component={Assistance} />
      <Tab.Screen name="Contactos" component={ContactsTab} />
      <Tab.Screen name="Historial" component={HistoryTab} />
    </Tab.Navigator>
  );
}