import React, { useRef } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from 'expo-video'; 
import Card from "../../src/components/ui/card/card";
import { TutorialPager } from "../../src/components/ui/TutorialPager";
import { useBienvenidaTutorialViewModel } from "./useBienvenidaTutorialViewModel";
import ActivacionTutorial from "./botonScreen"; 
import MensajesScreen from "./mensajesScreen"; 
import UbicacionScreen from "./ubicacionScreen";
import ContactosScreen from "./contactoScreen";
import SeguridadScreen from "./seguridadScreen";
import NotificacionScreen from "./notificacionScreen";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import { useMensajesTutorialViewModel } from "./useMensajesTutorialViewModel";
import { useContactoTutorialViewModel } from "./useContactoTutorialViewModel"; // 🆕

export default function Bienvenido() {
  const { player } = useBienvenidaTutorialViewModel();

  // 🆕 ViewModel de mensajes instanciado aquí para pasar pedirPermisos al pager
  const mensajesVM = useMensajesTutorialViewModel();
  const contactosVM = useContactoTutorialViewModel(); // 🆕

  return (
    <SafeAreaView style={styles.container}>
      <TutorialPager
        paginasConBloqueo={{
          2: mensajesVM.pedirPermisos, // índice 2 = MensajesScreen
          4: contactosVM.pedirPermisos,
        }}
      >
        
        {/* PÁGINA 0: BIENVENIDA */}
        <View style={{ flex: 1, alignItems: 'center' }}> 
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

        {/* PÁGINA 1: BOTÓN SOS */}
        <ActivacionTutorial />
        {/* PÁGINA 2: MENSAJES — al deslizar muestra permisos */}
        <MensajesScreen vmExterno={mensajesVM} />
        {/* PÁGINA 3: UBICACIÓN */}
        <UbicacionScreen />

        {/* PÁGINA 4: CONTACTOS */}
        <ContactosScreen vmExterno={contactosVM} />

        {/* PÁGINA 5: SEGURIDAD */}
        <SeguridadScreen />

        {/* PÁGINA 6: NOTIFICACIONES */}
        <NotificacionScreen />
        
      </TutorialPager>
    </SafeAreaView>
  );
}