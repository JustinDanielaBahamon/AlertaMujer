import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

import Card from "../../src/components/ui/card/card";
import { useNotificacionTutorialViewModel } from "./useNotificacionTutorialViewModel";

const { width } = Dimensions.get("window");

export default function NotificacionTutorial() {
  const vm = useNotificacionTutorialViewModel();

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
              Mantente{"\n"}Informada
            </Text>

            <View style={cardStyles.innerContainer}>
              <Text style={cardStyles.description}>
                <Text style={{ fontWeight: "bold" }}>La comunicación rápida salva vidas.{"\n\n"}</Text>

                Activa las notificaciones para que Alerta Mujer pueda avisarte en el{" "}
                <Text style={{ fontWeight: "bold" }}>segundo exacto</Text> en que alguien necesite tu ayuda.{"\n\n"}

                <Text style={{ fontWeight: "bold" }}>🔔 Alertas en tiempo real:</Text>
                {"\n"}Recibirás avisos críticos incluso si la aplicación no está abierta.{"\n\n"}

                <Text style={{ fontWeight: "bold" }}>🛡️ Seguridad Activa:</Text>
                {"\n"}Te permite estar siempre conectada con tu red de confianza y reaccionar sin demora.
              </Text>
            </View>
          </Card>

          {/* PUNTOS ELIMINADOS: El Padre los maneja dinámicamente con activeIndex */}

          <View style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}