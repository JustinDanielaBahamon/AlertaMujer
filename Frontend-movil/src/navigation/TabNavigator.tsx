import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTabScreenOptions } from "../components/ui/Tabs/TabsNavigationStyle";
import { useTheme } from "../contexts/ThemeContext";
import { useLocale } from "../contexts/LocaleContext";

import Assistance from "../features/assistance/view/Assistance";
import ContactsTab from "../features/contacts/view/contacts";
import HistoryTab from "../features/history/view/history";
import Home from "../features/home/view/index";
import Mapa from "../features/map/view/MapScreen";

const Tab = createBottomTabNavigator();

const TABS = [
  { name: "Home",    icon: "home",    offIcon: "home-outline"    },
  { name: "Map",      icon: "map",     offIcon: "map-outline"     },
  { name: "Assistance",    icon: "medical", offIcon: "medical-outline" },
  { name: "Contacts", icon: "people",  offIcon: "people-outline"  },
  { name: "History", icon: "time",    offIcon: "time-outline"    },
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
  const insets = useSafeAreaInsets(); // ← detects the space of the Android/iOS buttons automatically

  // Translates each route name to its visible text in the active language
  const tabLabels: Record<string, string> = {
    Home: t.menu.inicio,
    Map: t.menu.mapa,
    Assistance: t.menu.asistencia,
    Contacts: t.menu.contactos,
    History: t.menu.historial,
  };

  return (
    <Tab.Navigator
      tabBar={({ state, navigation }) => (
        <View style={{
          flexDirection: 'row',
          backgroundColor: theme.tabBackground,
          paddingBottom: insets.bottom > 4 ? insets.bottom : 8, // ← adapts on its own
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
      <Tab.Screen name="Home"    component={Home} />
      <Tab.Screen name="Map"      component={Mapa} />
      <Tab.Screen name="Assistance"    component={Assistance} />
      <Tab.Screen name="Contacts" component={ContactsTab} />
      <Tab.Screen name="History" component={HistoryTab} />
    </Tab.Navigator>
  );
}