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

        {/* modulo de Mapa con icono */}
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
