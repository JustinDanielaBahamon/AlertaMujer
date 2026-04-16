import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomePermisos from "../../src/components/ui/modalMesanje/permisosMLL";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";
import { useMensajesTutorialViewModel } from "./useMensajesTutorialViewModel";

export default function MensajesScreen() {
  const vm = useMensajesTutorialViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* 1. HEADER CON IMAGEN MANUAL (Centrada y con tamaño controlado) */}
      <View style={[styles.img, { width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: -1 }]}>
        <Image
          source={require("../../assets/imagesAlertaMujer/ScTutorial/mensaje.png")} 
          style={{ height: 210, width: 225 }} 
          resizeMode="contain"
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

      {/* Espaciador para la paginación del TutorialPager */}
      <View style={{ flex: 1 }} />

      {/* El ViewModel sigue manejando los permisos en segundo plano si es necesario */}
      <CustomePermisos
        visible={vm.modalVisible}
        tipo={vm.tipoPermiso}
        onConfirmar={vm.confirmarModal}
        onCancelar={vm.cancelarModal}
      />
      
    </SafeAreaView>
  );
}