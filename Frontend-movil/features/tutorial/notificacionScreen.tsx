import React from "react";
import { View, Text, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
//import * as Notifications from "expo-notifications";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

import CustomButton from "../../src/components/ui/button/aceptar";
import CustomButton2 from "../../src/components/ui/button/cancelar";
import Card from "../../src/components/ui/card/card";

export default function NotificacionTutorial() {
  const navigation = useNavigation<any>();

  const handlePermisoNotificaciones = async () => {
    // TODO: Descomentar cuando usen development build (Sprint con backend)
    Alert.alert(
      "Modo Demo",
      "En la versión final, aquí se solicitarán permisos de notificación. Por ahora continuamos al home.",
      [
        {
          text: "Continuar",
          onPress: () => navigation.replace("DrawerHome"),
        },
      ]
    );
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

          <View style={{ flex: 1 }} />

          <View style={[styles.footer, { paddingBottom: 40 }]}>
            <CustomButton title="Finalizar y Activar" onPress={handlePermisoNotificaciones} />

            <View style={{ marginTop: 10, width: "100%", alignItems: "center" }}>
              <CustomButton2
                title="Regresar"
                onPress={() => navigation.navigate("TutorialSeguridad")}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
