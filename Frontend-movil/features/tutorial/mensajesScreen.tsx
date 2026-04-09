import React, { useState } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as SMS from "expo-sms";

import CustomePermisos from "../../src/components/ui/modalMesanje/permisosMLL";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import CustomButton from "../../src/components/ui/button/aceptar";
import CustomButton2 from "../../src/components/ui/button/cancelar";
import Card from "../../src/components/ui/card/card";

export default function ActivacionTutorial() {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoPermiso, setTipoPermiso] = useState<"sms" | "llamada">("sms");

  const handleIniciarFlujo = () => {
    setTipoPermiso("sms");
    setModalVisible(true);
  };

  const handleConfirmarModal = async () => {
    if (tipoPermiso === "sms") {
      try {
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
          await SMS.composeAsync({
            recipients: ["3001234567"],
            body: "🚨 ALERTA: Necesito ayuda. Ubicación: https://www.google.com/maps",
          });
        }
      } catch (error) {
        console.log("Error SMS:", error);
      }
      setTipoPermiso("llamada");
    } else {
      setModalVisible(false);
      navigation.navigate("TutorialUbicacion");
    }
  };

  const handleCancelarModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/imagesAlertaMujer/logoAlertaMujer.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Card style={cardStyles.card}>
            <Text style={cardStyles.title}>
              Sistema de mensajes{"\n"}y llamadas
            </Text>

            <View style={cardStyles.innerContainer}>
              <Text style={cardStyles.description}>
                <Text style={{ fontWeight: "bold" }}>
                  Cuando activas una alerta, el sistema contacta a tus personas de confianza automáticamente:{"\n\n"}
                </Text>

                <Text style={{ fontWeight: "bold" }}>📩 Mensaje automático:</Text>
                {"\n"}Se envía un SMS con tu ubicación exacta.{"\n\n"}

                <Text style={{ fontWeight: "bold" }}>📞 Llamada de emergencia:</Text>
                {"\n"}Se realiza una llamada de auxilio a tus contactos.
              </Text>
            </View>
          </Card>

          <View style={{ flex: 1 }} />

          <View style={[styles.footer, { paddingBottom: 40 }]}>
            <CustomButton title="Continuar" onPress={handleIniciarFlujo} />

            <View style={{ marginTop: 10, width: "100%", alignItems: "center" }}>
              <CustomButton2
                title="Regresar"
                onPress={() => navigation.navigate("TutorialBoton")}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <CustomePermisos
        visible={modalVisible}
        tipo={tipoPermiso}
        onConfirmar={handleConfirmarModal}
        onCancelar={handleCancelarModal}
      />
    </SafeAreaView>
  );
}
