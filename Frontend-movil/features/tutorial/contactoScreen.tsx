import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

import CustomButton from "../../src/components/ui/button/aceptar";
import CustomButton2 from "../../src/components/ui/button/cancelar";
import Card from "../../src/components/ui/card/card";
import { useContactoTutorialViewModel } from "./useContactoTutorialViewModel";

export default function ContactosTutorial() {
  const vm = useContactoTutorialViewModel();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
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
              Tus Personas de{"\n"}Confianza
            </Text>

            <View style={cardStyles.innerContainer}>
              <Text style={cardStyles.description}>
                <Text style={{ fontWeight: "bold" }}>
                  Para que la app funcione, necesitamos acceder a tu lista de contactos:{"\n\n"}
                </Text>

                <Text style={{ fontWeight: "bold" }}>👥 Selección rápida:</Text>
                {"\n"}Podrás elegir fácilmente a tus familiares o amigos desde tu agenda sin escribir números manualmente.{"\n\n"}

                <Text style={{ fontWeight: "bold" }}>🛡️ Privacidad garantizada:</Text>
                {'\n'}Solo utilizaremos los contactos que tú selecciones como "Contactos de Emergencia".
              </Text>
            </View>
          </Card>

          <View style={{ flex: 1 }} />

          <View style={[styles.footer, { paddingBottom: 40 }]}>
            <CustomButton title="Permitir acceso" onPress={vm.solicitarPermisoContactos} />

            <View style={{ marginTop: 10, width: "100%", alignItems: "center" }}>
              <CustomButton2 title="Regresar" onPress={vm.regresar} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
