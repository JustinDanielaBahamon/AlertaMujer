import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../src/components/ui/card/card";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
// Importación del ViewModel (aunque ya no uses vm.continuar aquí)
import { useBienvenidaTutorialViewModel } from "./useBienvenidaTutorialViewModel";

export default function Bienvenido() {
  const vm = useBienvenidaTutorialViewModel();

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. LOGO SUPERIOR */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/imagesAlertaMujer/logoAlertaMujer.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* 2. ILUSTRACIÓN DINÁMICA */}
      <View style={styles.illustrationWrapper}>
        <Image
          source={require("../../assets/imagesAlertaMujer/ScTutorial/bienvenida.png")} 
          style={styles.mainIllustration}
          resizeMode="contain"
        />
      </View>

      {/* 3. TARJETA DE INFORMACIÓN */}
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

    </SafeAreaView>
  );
}