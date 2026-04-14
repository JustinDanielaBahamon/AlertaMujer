import React, { useState } from "react";
import { View, Text, Image, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../src/components/ui/card/card";

// IMPORTACIÓN DE TODAS LAS PÁGINAS
import ActivacionTutorial from "./botonScreen"; 
import MensajesScreen from "./mensajesScreen"; 
import UbicacionScreen from "./ubicacionScreen";
import ContactosScreen from "./contactoScreen";
import SeguridadScreen from "./seguridadScreen";
import NotificacionScreen from "./notificacionScreen";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import { useBienvenidaTutorialViewModel } from "./useBienvenidaTutorialViewModel";

const { width } = Dimensions.get("window");

export default function Bienvenido() {
  const vm = useBienvenidaTutorialViewModel();

  const [activeIndex, setActiveIndex] = useState(0);
  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / width);
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER FIJO PARA TODAS LAS PÁGINAS */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/imagesAlertaMujer/logoAlertaMujer.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {/* PÁGINA 1: BIENVENIDA */}
        <View style={{ width: width, alignItems: 'center' }}>
          <Card style={cardStyles.card}>
            <Text style={cardStyles.title}>
              Conoce más sobre{"\n"}Alerta Mujer
            </Text>
            <View style={cardStyles.innerContainer}>
              <Text style={cardStyles.description}>
                <Text style={{ fontWeight: "bold" }}>
                  Tu seguridad es nuestra prioridad.{"\n\n"}
                </Text>
                Esta aplicación nace para ser tu red de apoyo digital, diseñada
                para cuidarte y darte tranquilidad en cada paso que des.{"\n\n"}
                Con Alerta Mujer, tienes a tu alcance herramientas inmediatas
                para{" "}
                <Text style={{ fontWeight: "bold" }}>
                  pedir ayuda, difundir tu ubicación en tiempo real
                </Text>{" "}
                y conectar con tus seres queridos ante cualquier situación de
                riesgo.
              </Text>
            </View>
          </Card>
        </View>

        {/* PÁGINA 2 */}
        <ActivacionTutorial />

        {/* PÁGINA 3 */}
        <MensajesScreen />

        {/* PÁGINA 4 */}
        <UbicacionScreen />

        {/* PÁGINA 5 */}
        <ContactosScreen />

        {/* PÁGINA 6 */}
        <SeguridadScreen />

        {/* PÁGINA 7 */}
        <NotificacionScreen />

      </ScrollView>

      {/* INDICADORES (PUNTOS) - Mapea del 0 al 6 para las 7 páginas */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 30 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={i}
            style={{
              width: activeIndex === i ? 22 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: activeIndex === i ? '#4A148C' : '#FFF',
              marginHorizontal: 4,
              opacity: activeIndex === i ? 1 : 0.6
            }}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}