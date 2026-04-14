import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";
import { useBotonTutorialViewModel } from "./useBotonTutorialViewModel";

const { width } = Dimensions.get("window");


export default function ActivacionTutorial() {
  const vm = useBotonTutorialViewModel();

  return (
    <View style={{ width: width }}> 
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* ELIMINADO EL HEADER DE AQUÍ PORQUE YA ESTÁ EN EL PADRE */}

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

          {/* ELIMINADOS LOS PUNTOS DE AQUÍ PORQUE EL PADRE LOS MANEJA DINÁMICAMENTE */}

          <View style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}