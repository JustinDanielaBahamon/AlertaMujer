import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from 'expo-video'; 
import Card from "../../src/components/ui/card/card";
import { TutorialPager } from "../../src/components/ui/TutorialPager"; // Importación de pantallas del tutorial (Paginación)
// Importamos el ViewModel
import { useBienvenidaTutorialViewModel } from "./useBienvenidaTutorialViewModel";
import ActivacionTutorial from "./botonScreen"; 
import MensajesScreen from "./mensajesScreen"; 
import UbicacionScreen from "./ubicacionScreen";
import ContactosScreen from "./contactoScreen";
import SeguridadScreen from "./seguridadScreen";
import NotificacionScreen from "./notificacionScreen";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

export default function Bienvenido() {
  // Conectamos con el ViewModel para obtener el player
  const { player } = useBienvenidaTutorialViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <TutorialPager>
        
        {/* PÁGINA 1: BIENVENIDA */}
        <View style={{ flex: 1, alignItems: 'center' }}> 
          
          {/* El video ahora está fuera de la Card, usando su propio wrapper */}
          <View style={styles.illustrationWrapper}>
            <VideoView
              style={styles.mainIllustration}
              player={player} 
              nativeControls={false}
              contentFit="contain"
              allowsFullscreen={false}
            />
          </View>

          <Card 
            title={`¡Tu seguridad es\nnuestra prioridad!`}
            style={cardStyles.card} 
          >
            <View>
              <Text style={cardStyles.description}>
                Esta aplicación es tu <Text style={{ fontWeight: 'bold', color: '#faf9f7' }}>
                red de apoyo digital.</Text>{"\n\n"}
                Pedir ayuda y compartir tu ubicación es rápido y fácil.{"\n\n"}
                Conéctate con quienes amas ante cualquier riesgo.
              </Text>
            </View>
          </Card>
        </View>

        {/* PÁGINAS RESTANTES (Mantenemos la paginación intacta) */}
        <ActivacionTutorial />
        <MensajesScreen />
        <UbicacionScreen />
        <ContactosScreen />
        <SeguridadScreen />
        <NotificacionScreen />
        
      </TutorialPager>
    </SafeAreaView>
  );
}