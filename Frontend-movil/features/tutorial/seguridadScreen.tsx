import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";

import { useSeguridadTutorialViewModel } from "./useSeguridadTutorialViewModel";

export default function CamaraMicrofonoTutorial() {
  const vm = useSeguridadTutorialViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* 1. HEADER CON LA NUEVA IMAGEN DE SEGURIDAD */}
      <View style={[styles.img, { width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: -40 }]}>
        <Image
          source={require("../../assets/imagesAlertaMujer/ScTutorial/Seguridad.png")} 
          style={{ height: 210, width: 265 }} // Un poco más grande para que luzca el escudo
          resizeMode="contain"
        />
      </View>

      {/* 2. TARJETA DE EVIDENCIA Y PROTECCIÓN */}
      <Card 
        title={`Seguridad en\nVideo y Audio`}
        style={cardStyles.card}
      >
        <View style={{ gap: 10 }}>
          
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