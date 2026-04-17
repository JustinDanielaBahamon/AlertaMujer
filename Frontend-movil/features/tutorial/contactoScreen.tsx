import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from 'expo-video';
import Card from "../../src/components/ui/card/card";
import { useContactoTutorialViewModel } from "./useContactoTutorialViewModel";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

export default function ContactosScreen() {
  // Extraemos el player del ViewModel
  const { player } = useContactoTutorialViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* 1. CONTENEDOR DEL VIDEO */}
      {/* Ajusta el marginTop para subir o bajar el video manualmente */}
      <View style={[styles.illustrationWrapper, { marginTop:-34, marginBottom: -31 }]}>
        <VideoView
          style={{ height: 200, width: 250}} // Mantengo tus medidas manuales de 350
          player={player} 
          nativeControls={false}
          contentFit="contain"
          allowsFullscreen={false}
        />
      </View>

      {/* 2. TARJETA DE RED DE APOYO */}
      <Card 
        title={`Tu Red de\nApoyo`}
        style={cardStyles.card}
      >
        <View style={{ gap: 6 }}>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Confianza: </Text>
            <Text style={{ fontWeight: "bold" }}>Red segura.</Text> Agrega a tus familiares y amigos cercanos para que te cuiden.
          </Text>

          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Notificaciones: </Text>
            <Text style={{ fontWeight: "bold" }}>Aviso inmediato.</Text> Ellos recibirán tu ubicación exacta cuando actives una alerta.
          </Text>

          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Gestión: </Text>
            <Text style={{ fontWeight: "bold" }}>Siempre conectada.</Text> Puedes gestionar tus contactos en cualquier momento desde tu perfil.
          </Text>
        </View>
      </Card>

      <View style={{ flex: 1 }} />
      
    </SafeAreaView>
  );
}