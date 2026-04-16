import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";
import CustomButton from "../../src/components/ui/button/aceptar";
import { useNotificacionTutorialViewModel } from "./useNotificacionTutorialViewModel";

export default function NotificacionTutorial() {
  const vm = useNotificacionTutorialViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* 1. HEADER CON LA NUEVA IMAGEN DE NOTIFICACIÓN */}
      <View style={[styles.img, { width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: -15, marginTop: -34 }]}>
        <Image
          source={require("../../assets/imagesAlertaMujer/ScTutorial/Notificacion.png")} 
          style={{ height: 230, width: 280 }} 
          resizeMode="contain"
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

      {/* 3. BOTÓN FINALIZADOR (Lleva al Dashboard) */}
      <View style={{ width: '100%', alignItems: 'center', marginTop: 15 }}>
        <CustomButton 
            title="Finalizar y Activar" 
            onPress={vm.finalizarDemo} 
        />
      </View>

      {/* Espaciador para la paginación del final */}
      <View style={{ flex: 1 }} />
      
    </SafeAreaView>
  );
}