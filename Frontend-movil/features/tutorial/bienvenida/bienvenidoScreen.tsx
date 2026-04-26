import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from "react";
import { Animated, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TutorialPager } from "../../../src/components/ui/TutorialPager";
import ActivacionTutorial from "../botón/botonScreen";
import ContactosScreen from "../contacto/contactoScreen";
import MensajesScreen from "../mensaje/mensajesScreen";
import { useMensajesTutorialViewModel } from "../mensaje/useMensajesTutorialViewModel";
import NotificacionScreen from "../notificación/notificacionScreen";
import SeguridadScreen from "../seguridad/seguridadScreen";
import UbicacionScreen from "../ubicación/ubicacionScreen";
import { COLORS, styles as universalStyles } from "../universalStyle";
import { useContactoTutorialViewModel } from "../contacto/useContactoTutorialViewModel";
import { useNotificacionTutorialViewModel } from "../notificación/useNotificacionTutorialViewModel";
import { useSeguridadTutorialViewModel } from "../seguridad/useSeguridadTutorialViewModel";
import { useUbicacionTutorialViewModel } from "../ubicación/useUbicacionTutorialViewModel";

export default function Bienvenido() {
  const mensajesVM     = useMensajesTutorialViewModel();
  const contactosVM    = useContactoTutorialViewModel();
  const ubicacionVM    = useUbicacionTutorialViewModel(); 
  const seguridadVM    = useSeguridadTutorialViewModel();
  const notificacionVM = useNotificacionTutorialViewModel();

  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1, delay: 300, tension: 60, friction: 8, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPage} translucent={false} />

      <SafeAreaView style={localStyles.safeArea} edges={['top', 'bottom']}>
        <TutorialPager
          paginasConBloqueo={{
            2: mensajesVM.pedirPermisos,
            3: ubicacionVM.pedirConfirmacionUbicacion,
            4: contactosVM.pedirPermisos,
            5: seguridadVM.pedirPermisos,
            6: notificacionVM.pedirPermisos,
          }}
        >
          {/* ── PÁGINA 0: BIENVENIDA ── */}
          <View style={localStyles.page}>

            {/* Fondo decorativo estático */}
            <View style={localStyles.bgGradient}>
              <View style={localStyles.bgCircle1} />
              <View style={localStyles.bgCircle2} />
              <View style={localStyles.bgCircle3} />
            </View>

            {/* ── LOTTIE ── */}
            <View style={localStyles.lottieSection}>
              <LottieView
                source={require('../../../assets/imagesAlertaMujer/ScTutorial/forwomensday.json')}
                autoPlay
                loop
                resizeMode="cover"
                style={localStyles.lottie}
              />
            </View>

            {/* ── CARD — usa universalStyles ── */}
            <Animated.View style={[
              universalStyles.cardLarge,
              {
                opacity: cardAnim,
                transform: [{
                  translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }),
                }],
              },
            ]}>
              <View style={universalStyles.cardAccent} />

              <Text style={universalStyles.cardTitle}>
                ¡Tu seguridad es{'\n'}
                <Text style={universalStyles.cardTitleHighlight}>nuestra prioridad!</Text>
              </Text>

              <View style={universalStyles.divider} />

              <View style={universalStyles.row}>
                <Text style={universalStyles.rowIcon}>🤝</Text>
                <View style={universalStyles.rowTextContainer}>
                  <Text style={universalStyles.rowTitle}>Red de apoyo digital</Text>
                  <Text style={universalStyles.rowDesc}>Conecta con las personas de confianza en segundos.</Text>
                </View>
              </View>

              <View style={universalStyles.row}>
                <Text style={universalStyles.rowIcon}>📍</Text>
                <View style={universalStyles.rowTextContainer}>
                  <Text style={universalStyles.rowTitle}>Ubicación en tiempo real</Text>
                  <Text style={universalStyles.rowDesc}>Comparte dónde estás con un solo toque.</Text>
                </View>
              </View>

              <View style={universalStyles.row}>
                <Text style={universalStyles.rowIcon}>🚨</Text>
                <View style={universalStyles.rowTextContainer}>
                  <Text style={universalStyles.rowTitle}>Alerta inmediata</Text>
                  <Text style={universalStyles.rowDesc}>Pide ayuda rápido ante cualquier situación de riesgo.</Text>
                </View>
              </View>

              <View style={universalStyles.badge}>
                <Text style={universalStyles.badgeText}>🛡️ Protección inmediata</Text>
              </View>
            </Animated.View>

          </View>

          {/* ── OTRAS PÁGINAS ── */}
          <ActivacionTutorial />
          <MensajesScreen vmExterno={mensajesVM} />
          <UbicacionScreen vmExterno={ubicacionVM} /> 
          <ContactosScreen vmExterno={contactosVM} />
          <SeguridadScreen vmExterno={seguridadVM} />
          <NotificacionScreen vmExterno={notificacionVM} />

        </TutorialPager>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Solo estilos exclusivos de esta pantalla
const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bgPage,
  },
  bgGradient: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  bgCircle1: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: COLORS.purpleLight, top: -80, left: -60, opacity: 0.6,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: COLORS.purpleSoft, top: 60, right: -50, opacity: 0.4,
  },
  bgCircle3: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: COLORS.purplePale, bottom: 200, left: -30, opacity: 0.15,
  },
  lottieSection: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: '100%',
    height: 220,
  },
});