import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from 'expo-video'; // Usamos VideoView

import CustomePermisos from "../../src/components/ui/modalMesanje/permisosMLL";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";
import { useMensajesTutorialViewModel } from "./useMensajesTutorialViewModel";

export default function MensajesScreen() {
  const vm = useMensajesTutorialViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* 1. VIDEO (Reemplaza a la imagen, fuera de la Card) */}
      {/* Ajusta marginTop para subirlo manualmente */}
      <View style={[styles.illustrationWrapper, { marginTop: -24, marginBottom: -23 }]}>
        <VideoView
          style={{ height: 212, width: 225 }} // Mantengo tus medidas originales
          player={vm.player} 
          nativeControls={false}
          contentFit="contain"
          allowsFullscreen={false}
        />
      </View>

      {/* 2. TARJETA DE SISTEMA DE MENSAJES */}
      <Card 
        title={`Mensajes y\nLlamadas`}
        style={cardStyles.card}
      >
        <View style={{ gap: 1 }}>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● SMS Automático: </Text>
            <Text style={{ fontWeight: "bold" }}>Aviso rápido.</Text> Se envía un mensaje de texto con tu ubicación exacta a tus contactos.
          </Text>

          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Llamada SOS: </Text>
            <Text style={{ fontWeight: "bold" }}>Auxilio directo.</Text> El sistema inicia una llamada de emergencia a tus personas de confianza.
          </Text>

          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Confirmación: </Text>
            <Text style={{ fontWeight: "bold" }}>Seguridad total.</Text> Recibirás una notificación cuando la ayuda esté en camino.
          </Text>
        </View>
      </Card>

      <View style={{ flex: 1 }} />

      <CustomePermisos
        visible={vm.modalVisible}
        tipo={vm.tipoPermiso}
        onConfirmar={vm.confirmarModal}
        onCancelar={vm.cancelarModal}
      />
      
    </SafeAreaView>
  );
}