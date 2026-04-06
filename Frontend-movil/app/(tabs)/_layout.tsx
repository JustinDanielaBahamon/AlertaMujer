import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import Header from "../../src/components/ui/Header/header";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      
      {/* 🔥 HEADER GLOBAL SOLO PARA TABS */}
      <Header />

      <Tabs screenOptions={{ headerShown: false }}>
        
        <Tabs.Screen name="alerta" />
        <Tabs.Screen name="contactos" />
        <Tabs.Screen name="historial" />
        <Tabs.Screen name="inicio" />

        <Tabs.Screen
          name="mapa"
          options={{
            title: "Mapa",
            tabBarLabelStyle: { color: "white" },
            tabBarIcon: ({ size }) => (
              <Image
                source={require("../../assets/imagesAlertaMujer/ScMapa/Mapa-icon.png")}
                style={{
                  width: size * 2.0,
                  height: size * 2.0,
                  marginTop: 11,
                }}
              />
            ),
          }}
        />

      </Tabs>

    </View>
  );
}