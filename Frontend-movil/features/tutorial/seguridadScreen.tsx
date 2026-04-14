import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

import Card from "../../src/components/ui/card/card";
import { useSeguridadTutorialViewModel } from "./useSeguridadTutorialViewModel";

const { width } = Dimensions.get("window");

export default function CamaraMicrofonoTutorial() {
  const vm = useSeguridadTutorialViewModel();

  return (
    <View style={{ width: width }}> 
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* LOGO ELIMINADO: Ya está fijo en el archivo Padre */}

          <Card style={cardStyles.card}>
            <Text style={cardStyles.title}>
              Seguridad en{"\n"}Video y Audio
            </Text>

            <View style={cardStyles.innerContainer}>
              <Text style={cardStyles.description}>
                <Text style={{ fontWeight: "bold" }}>Tu voz y tu entorno son evidencia clave.{"\n\n"}</Text>

                Al activar una alerta, Alerta Mujer utiliza estos sensores para que{" "}
                <Text style={{ fontWeight: "bold" }}>nunca estés en silencio.</Text>
                {"\n\n"}

                <Text style={{ fontWeight: "bold" }}>📸 Registro de evidencia:</Text>
                {"\n"}Se inicia una captura automática de audio y video para documentar todo lo que ocurre en tiempo real.{"\n\n"}

                <Text style={{ fontWeight: "bold" }}>🛡️ Respaldo total:</Text>
                {"\n"}Esta información se convierte en una herramienta legal poderosa para protegerte y dejar constancia de los hechos.
              </Text>
            </View>
          </Card>

          {/* PUNTOS ELIMINADOS: El Padre los maneja dinámicamente según el activeIndex */}

          <View style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}