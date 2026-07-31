import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from "react";
import { Animated, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TutorialPager } from "../component/TutorialPager";
import ActivationTutorial from "../view/buttonScreen";
import ContactsScreen from "../view/contactScreen";
import { useContactTutorialViewModel } from "../viewModel/useContactTutorialViewModel";
import LocationScreen from "../view/locationScreen";
import MessagesScreen from "../view/messageScreen";
import { useMessagesTutorialViewModel } from "../viewModel/useMessagesTutorialViewModel";
import NotificationScreen from "../view/notificationScreen";
import { useNotificationTutorialViewModel } from "../viewModel/useNotificationTutorialViewModel";
import SecurityScreen from "../view/securityScreen";
import { useSecurityTutorialViewModel } from "../viewModel/useSecurityTutorialViewModel";
import { COLORS, styles as universalStyles } from "../styles/universalStyle";
import { useLocationTutorialViewModel } from "../viewModel/useLocationTutorialViewModel";
import { useLocale } from "../../../contexts/LocaleContext";


export default function Welcome() {
  const { t } = useLocale();
  const messagesVM     = useMessagesTutorialViewModel();
  const contactsVM     = useContactTutorialViewModel();
  const locationVM     = useLocationTutorialViewModel();
  const securityVM     = useSecurityTutorialViewModel();
  const notificationVM = useNotificationTutorialViewModel();

  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1, delay: 300, tension: 60, friction: 8, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" translucent={false} />

      {/* ── Gradient covers the ENTIRE screen, SafeAreaView goes INSIDE ── */}
      <LinearGradient
        colors={["#a031e0", "#f7f7f7e7", "#b026bd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={localStyles.safeArea} edges={['top', 'bottom']}>
          <TutorialPager
            paginasConBloqueo={{
              2: messagesVM.requestPermissions,
              3: locationVM.requestLocationConfirmation,
              4: contactsVM.requestPermissions,
              5: securityVM.requestPermissions,
              6: notificationVM.requestPermissions,
            }}
          >
            {/* ── PAGE 0: WELCOME ── */}
            <View style={localStyles.page}>

              {/* Decorative circles */}
              <View style={localStyles.bgGradient}>
                <View style={localStyles.bgCircle1} />
                <View style={localStyles.bgCircle2} />
                <View style={localStyles.bgCircle3} />
              </View>

              {/* Lottie animation */}
              <View style={localStyles.lottieSection}>
                <LottieView
                  source={require('@assets/imagesAlertaMujer/ScTutorial/forwomensday.json')}
                  autoPlay
                  loop
                  resizeMode="cover"
                  style={localStyles.lottie}
                />
              </View>

              {/* Card with internal gradient */}
              <Animated.View style={[
                universalStyles.cardLarge,
                {
                  opacity: cardAnim,
                  transform: [{
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  }],
                  padding: 0,
                  overflow: 'hidden',
                },
              ]}>
                <LinearGradient
                  colors={["#ffffff", "#f8f8f8", "#e3aee7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, padding: 24, borderRadius: 28 }}
                >
                  <View style={universalStyles.cardAccent} />

                  <Text style={universalStyles.cardTitle}>
                    {t.tutorial.bienvenida_titulo_1}{'\n'}
                    <Text style={universalStyles.cardTitleHighlight}>{t.tutorial.bienvenida_titulo_2}</Text>
                  </Text>

                  <View style={universalStyles.divider} />

                  <View style={universalStyles.row}>
                    <Text style={universalStyles.rowIcon}>🤝</Text>
                    <View style={universalStyles.rowTextContainer}>
                      <Text style={universalStyles.rowTitle}>{t.tutorial.bienvenida_red_titulo}</Text>
                      <Text style={universalStyles.rowDesc}>{t.tutorial.bienvenida_red_desc}</Text>
                    </View>
                  </View>

                  <View style={universalStyles.row}>
                    <Text style={universalStyles.rowIcon}>📍</Text>
                    <View style={universalStyles.rowTextContainer}>
                      <Text style={universalStyles.rowTitle}>{t.tutorial.bienvenida_ubicacion_titulo}</Text>
                      <Text style={universalStyles.rowDesc}>{t.tutorial.bienvenida_ubicacion_desc}</Text>
                    </View>
                  </View>

                  <View style={universalStyles.row}>
                    <Text style={universalStyles.rowIcon}>🚨</Text>
                    <View style={universalStyles.rowTextContainer}>
                      <Text style={universalStyles.rowTitle}>{t.tutorial.bienvenida_alerta_titulo}</Text>
                      <Text style={universalStyles.rowDesc}>{t.tutorial.bienvenida_alerta_desc}</Text>
                    </View>
                  </View>

                </LinearGradient>
              </Animated.View>

            </View>

            {/* ── Otras paginas ── */}
            <ActivationTutorial />
            <MessagesScreen externalVm={messagesVM} />
            <LocationScreen externalVm={locationVM} />
            <ContactsScreen externalVm={contactsVM} />
            <SecurityScreen externalVm={securityVM} />
            <NotificationScreen externalVm={notificationVM} />

          </TutorialPager>
        </SafeAreaView>
      </LinearGradient>

    </SafeAreaProvider>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    
  },
  page: {
    flex: 1,
    alignItems: 'center',
    
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