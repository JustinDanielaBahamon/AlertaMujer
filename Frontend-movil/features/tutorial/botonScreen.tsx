import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from 'expo-video'; 
import Card from "../../src/components/ui/card/card";
import { useBotonTutorialViewModel } from "./useBotonTutorialViewModel";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

export default function ActivacionTutorial() {
  const { player } = useBotonTutorialViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* Contenedor que centra el video */}
      <View style={[styles.illustrationWrapper, { marginTop:-30}, { marginBottom:-20}]}>
        <VideoView
          // Aquí aplicamos el estilo img para que mida 215x215
          style={styles.video} 
          player={player} 
          nativeControls={false}
          contentFit="contain"
          allowsFullscreen={false}
        />
      </View>

      <Card 
        title={`Cómo funciona el\nbotón`}
        style={cardStyles.card}
      >
        <View style={{ gap: 3 }}>
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

      <View style={{ flex: 1 }} />
    </SafeAreaView>
  );
}