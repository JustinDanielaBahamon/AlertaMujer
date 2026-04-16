import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";

export default function ActivacionTutorial() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* 1. HEADER CON LA IMAGEN (Se ajusta vía universalStyle) */}
      <View style={styles.img}>
        <Image
          source={require("../../assets/imagesAlertaMujer/ScTutorial/Tuto-boton.png")} 
          style={styles.img} // Usamos logo o puedes crear styles.headerImage en universal.ts
          resizeMode="contain"
        />
      </View>

      {/* 2. TARJETA INDEPENDIENTE */}
      <Card 
        title={`Cómo funciona el\nbotón`}
        style={cardStyles.card}
      >
        <View style={{ gap: 20 }}>
          
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Toque corto: </Text>
            <Text style={{ fontWeight: "bold" }}>Alerta discreta.</Text> Envía un SMS silencioso con tu ubicación.
          </Text>

          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Doble toque: </Text>
            <Text style={{ fontWeight: "bold" }}>Alerta urgente.</Text> Tus contactos reciben notificación y llamada.
          </Text>

          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Mantener: </Text>
            <Text style={{ fontWeight: "bold" }}>Alerta máxima.</Text> Inicia grabación, sirena y ubicación en tiempo real.
          </Text>

        </View>
      </Card>

      {/* Espaciador para no chocar con la paginación */}
      <View style={{ flex: 1 }} />
      
    </SafeAreaView>
  );
}