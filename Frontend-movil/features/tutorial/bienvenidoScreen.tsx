import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../src/components/ui/button/aceptar";
import Card from "../../src/components/ui/card/card";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import { useBienvenidaTutorialViewModel } from "./useBienvenidaTutorialViewModel";

export default function Bienvenido() {
  const vm = useBienvenidaTutorialViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/imagesAlertaMujer/logoAlertaMujer.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Card style={cardStyles.card}>
        <Text style={cardStyles.title}>
          Conoce más sobre{"\n"}Alerta Mujer
        </Text>

        <View style={cardStyles.innerContainer}>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold" }}>Tu seguridad es nuestra prioridad.{"\n\n"}</Text>
            Esta aplicación nace para ser tu red de apoyo digital, diseñada para cuidarte y darte tranquilidad en cada paso que des. {"\n\n"}
            Con Alerta Mujer, tienes a tu alcance herramientas inmediatas para{" "}
            <Text style={{ fontWeight: "bold" }}>pedir ayuda, difundir tu ubicación en tiempo real</Text> y conectar con tus seres queridos ante cualquier situación de riesgo.
          </Text>
        </View>
      </Card>

      <View style={[styles.footer, { marginTop: 2 }]}>
        <CustomButton title="Continuar" onPress={vm.continuar} />
      </View>
    </SafeAreaView>
  );
}
