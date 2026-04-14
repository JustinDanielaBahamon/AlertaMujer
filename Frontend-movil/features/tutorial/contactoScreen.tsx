import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

import Card from "../../src/components/ui/card/card";
import { useContactoTutorialViewModel } from "./useContactoTutorialViewModel";

const { width } = Dimensions.get("window");

export default function ContactosTutorial() {
  const vm = useContactoTutorialViewModel();

  return (
    <View style={{ width: width }}> 
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* ELIMINADO EL HEADER PORQUE YA ESTÁ FIJO EN EL PADRE */}

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

          {/* ELIMINADOS LOS PUNTOS MANUALES PORQUE EL PADRE LOS MANEJA DINÁMICAMENTE */}

          <View style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}