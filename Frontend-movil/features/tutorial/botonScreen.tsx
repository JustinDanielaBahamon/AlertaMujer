import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

import CustomButton from "../../src/components/ui/button/aceptar";
import CustomButton2 from "../../src/components/ui/button/cancelar";
import Card from "../../src/components/ui/card/card";
import { useBotonTutorialViewModel } from "./useBotonTutorialViewModel";

export default function ActivacionTutorial() {
  const vm = useBotonTutorialViewModel();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/imagesAlertaMujer/logoAlertaMujer.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Card style={cardStyles.card}>
            <Text style={cardStyles.title}>
              Cómo funciona el{"\n"}botón
            </Text>

            <View style={cardStyles.innerContainer}>
              <Text style={cardStyles.description}>
                <Text style={{ fontWeight: "bold" }}>
                  El botón de emergencia tiene 3 formas de activarse:{"\n\n"}
                </Text>

                <Text style={{ fontWeight: "bold", color: "#fffb00" }}>● Toque corto: </Text>
                <Text style={{ fontWeight: "bold" }}>Alerta discreta.</Text> Envía un SMS silencioso con tu ubicación.{"\n\n"}

                <Text style={{ fontWeight: "bold", color: "#FFD700" }}>● Doble toque: </Text>
                <Text style={{ fontWeight: "bold" }}>Alerta urgente.</Text> Tus contactos reciben notificación y llamada.{"\n\n"}

                <Text style={{ fontWeight: "bold", color: "#FFD700" }}>● Mantener: </Text>
                <Text style={{ fontWeight: "bold" }}>Alerta máxima.</Text> Inicia grabación, sirena y ubicación en tiempo real.
              </Text>
            </View>
          </Card>

          <View style={{ flex: 1 }} />

          <View style={[styles.footer, { paddingBottom: 40 }]}>
            <CustomButton title="Continuar" onPress={vm.continuar} />

            <View style={{ marginTop: 5, width: "100%", alignItems: "center" }}>
              <CustomButton2 title="Regresar" onPress={vm.regresar} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
