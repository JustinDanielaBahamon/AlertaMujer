import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../src/components/ui/card/card";
import { TutorialPager } from "../../src/components/ui/TutorialPager"; 

import ActivacionTutorial from "./botonScreen"; 
import MensajesScreen from "./mensajesScreen"; 
import UbicacionScreen from "./ubicacionScreen";
import ContactosScreen from "./contactoScreen";
import SeguridadScreen from "./seguridadScreen";
import NotificacionScreen from "./notificacionScreen";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

export default function Bienvenido() {
  return (
    <SafeAreaView style={styles.container}>

      <TutorialPager>
        {/* PÁGINA 1: BIENVENIDA */}
        <View style={{ alignItems: 'center' }}>
          <View style={styles.illustrationWrapper}>
            <Image
              source={require("../../assets/imagesAlertaMujer/ScTutorial/bienvenida.png")} 
              style={styles.mainIllustration}
              resizeMode="contain"
            />
          </View>
         <Card 
            title={`¡Tu seguridad es\nnuestra prioridad!`}
            style={cardStyles.card} 
          >
            <Text style={cardStyles.description}>
              Esta aplicación es tu <Text style={{ fontWeight: 'bold', color: '#faf9f7' }}>red de apoyo digital</Text>.{"\n\n"}
              Pedir ayuda y compartir tu ubicación es rápido y fácil.{"\n\n"}
              Conéctate con quienes amas ante cualquier riesgo.
            </Text>
         </Card>
        </View>

        {/* PÁGINAS RESTANTES */}
        <ActivacionTutorial />
        <MensajesScreen />
        <UbicacionScreen />
        <ContactosScreen />
        <SeguridadScreen />
        <NotificacionScreen />
      </TutorialPager>
    </SafeAreaView>
  );
}