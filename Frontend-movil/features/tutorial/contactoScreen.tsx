import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";

export default function ContactosScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* 1. HEADER CON LA IMAGEN (Estructura idéntica al botón) */}
       <View style={[styles.img, { width: '100%', alignItems: 'center', justifyContent: 'center',marginBottom: -30 }]}>
          <Image
            source={require("../../assets/imagesAlertaMujer/ScTutorial/Contacto.png")} 
            style={{ height: 350, width: 350}} // Tus medidas manuales
            resizeMode="contain"
          />
        </View>

      {/* 2. TARJETA DE RED DE APOYO */}
      <Card 
        title={`Tu Red de\nApoyo`}
        style={cardStyles.card}
      >
        <View style={{ gap: 10 }}>
          
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

      {/* Espaciador para mantener la simetría con la paginación */}
      <View style={{ flex: 1 }} />
      
    </SafeAreaView>
  );
}