import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from 'expo-video'; // Cambio de Image a VideoView
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";
import CustomButton from "../../src/components/ui/button/aceptar";
import { useNotificacionTutorialViewModel } from "./useNotificacionTutorialViewModel";

export default function NotificacionTutorial() {
  const vm = useNotificacionTutorialViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* 1. VIDEO (Ajusta el marginTop negativo si quieres subirlo más que en las otras pantallas) */}
      <View style={[styles.illustrationWrapper, { marginTop: -60, marginBottom: -50}]}>
        <VideoView
          style={{ height: 150, width: 200 }} // Mantengo tus medidas originales
          player={vm.player} 
          nativeControls={false}
          contentFit="contain"
          allowsFullscreen={false}
        />
      </View>

      {/* 2. TARJETA DE INFORMACIÓN */}
      <Card 
        title={`Mantente\nInformada`}
        style={cardStyles.card}
      >
        <View style={{ gap: 5 }}>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Alertas SOS: </Text>
            <Text style={{ fontWeight: "bold" }}>Tiempo real.</Text> Recibirás avisos críticos incluso si la aplicación no está abierta.
          </Text>

          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Red de Apoyo: </Text>
            <Text style={{ fontWeight: "bold" }}>Seguridad activa.</Text> Mantente siempre conectada para ayudar o ser ayudada sin demora.
          </Text>

          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Rapidez: </Text>
            <Text style={{ fontWeight: "bold" }}>Comunicación.</Text> La notificación inmediata es la herramienta más poderosa para tu protección.
          </Text>
        </View>
      </Card>

      {/* 3. BOTÓN FINALIZADOR */}
      <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
        <CustomButton 
            title="Finalizar y Activar" 
            onPress={vm.finalizarDemo} 
        />
      </View>

      <View style={{ flex: 1 }} />
      
    </SafeAreaView>
  );
}