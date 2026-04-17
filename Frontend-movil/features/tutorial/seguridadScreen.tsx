import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from 'expo-video'; 

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";
import { useSeguridadTutorialViewModel } from "./useSeguridadTutorialViewModel";

export default function CamaraMicrofonoTutorial() {
  const vm = useSeguridadTutorialViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* 1. CONTENEDOR DEL VIDEO (Fuera de la Card) */}
      {/* Ajusta marginTop para subirlo manualmente; marginBottom: 10 evita solapamiento */}
      <View style={[styles.illustrationWrapper, { marginTop: -45, marginBottom: -29 }]}>
        <VideoView
          style={{ height: 200, width: 210 }} // Mantengo tus medidas de 210x265
          player={vm.player} 
          nativeControls={false}
          contentFit="contain"
          allowsFullscreen={false}
        />
      </View>

      {/* 2. TARJETA DE EVIDENCIA Y PROTECCIÓN */}
      <Card 
        title={`Seguridad en\nVideo y Audio`}
        style={cardStyles.card}
      >
        <View style={{ gap: 1}}>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Registro Clave: </Text>
            <Text style={{ fontWeight: "bold" }}>Evidencia real.</Text> Se inicia captura automática de audio y video para documentar tu entorno.
          </Text>

          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Respaldo Total: </Text>
            <Text style={{ fontWeight: "bold" }}>Herramienta legal.</Text> Tu voz y entorno son protegidos para dejar constancia de los hechos.
          </Text>

          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Privacidad: </Text>
            <Text style={{ fontWeight: "bold" }}>Encriptado.</Text> Tus grabaciones se manejan bajo los más altos estándares de seguridad.
          </Text>
        </View>
      </Card>

      {/* Espaciador para la paginación */}
      <View style={{ flex: 1 }} />
      
    </SafeAreaView>
  );
}