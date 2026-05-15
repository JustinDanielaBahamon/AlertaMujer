import { LinearGradient } from 'expo-linear-gradient';
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../../components/ui/card/card";
import PermissionsModal from "../../../components/ui/modalMesanje/permisosMLL";
import { CONTACT_COLORS, contactStyle } from "../styles/contactStyle";
import { useContactTutorialViewModel, type ContactFeatureItem, } from "../viewModel/useContactTutorialViewModel";

// ─── Círculos decorativos de fondo ───────────────────────────────────────────
function BackgroundCircles() {
  const f1 = useRef(new Animated.Value(0)).current;
  const f2 = useRef(new Animated.Value(0)).current;
  const f3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = (anim: Animated.Value, dur: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -12, duration: dur, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,   duration: dur,         useNativeDriver: true }),
        ])
      );
    float(f1, 3200, 0).start();
    float(f2, 2800, 600).start();
    float(f3, 3600, 1200).start();
  }, []);

  return (
    <>
      <Animated.View style={[contactStyle.bgCircleBase,
        { width: 200, height: 200, borderRadius: 100, backgroundColor: CONTACT_COLORS.circle1,
          opacity: 0.09, top: -55, right: -60, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[contactStyle.bgCircleBase,
        { width: 130, height: 130, borderRadius: 65, backgroundColor: CONTACT_COLORS.circle2,
          opacity: 0.10, top: 50, left: -40, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[contactStyle.bgCircleBase,
        { width: 90, height: 90, borderRadius: 45, backgroundColor: CONTACT_COLORS.circle3,
          opacity: 0.09, top: 170, right: 10, transform: [{ translateY: f3 }] }]} />
      <Animated.View style={[contactStyle.bgCircleBase,
        { width: 55, height: 55, borderRadius: 28, backgroundColor: CONTACT_COLORS.circle4,
          opacity: 0.13, top: 110, left: "44%" as any, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[contactStyle.bgCircleBase,
        { width: 70, height: 70, borderRadius: 35, backgroundColor: CONTACT_COLORS.circle2,
          opacity: 0.08, top: 230, left: 20, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[contactStyle.bgRingBase,
        { width: 100, height: 100, borderRadius: 50, borderColor: CONTACT_COLORS.circle1,
          opacity: 0.10, top: 30, right: 30, transform: [{ translateY: f3 }] }]} />
    </>
  );
}

// ─── Fila de característica animada ──────────────────────────────────────────
function FeatureRow({ item, enterDelay }: { item: ContactFeatureItem; enterDelay: number }) {
  const slideAnim   = useRef(new Animated.Value(28)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: 0, duration: 380, delay: enterDelay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 380, delay: enterDelay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[contactStyle.featureRow, {
        backgroundColor: item.colorLight,
        borderColor:     item.colorBorder,
        shadowColor:     item.color,
      }]}>
        <View style={[contactStyle.featureRowAccent, { backgroundColor: item.color }]} />

        <View style={[contactStyle.rowIconWrap, {
          backgroundColor: item.color + "25",
          borderWidth: 1.5,
          borderColor: item.color + "40",
        }]}>
          <Text style={contactStyle.rowIcon}>{item.emoji}</Text>
        </View>

        <View style={contactStyle.rowTextContainer}>
          <Text style={[contactStyle.rowTitle, { color: item.color }]}>{item.title}</Text>
          <Text style={contactStyle.rowDesc}>{item.desc}</Text>
        </View>

        <View style={[contactStyle.badge, { backgroundColor: item.color + "20" }]}>
          <Text style={[contactStyle.badgeText, { color: item.color }]}>{item.badge}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
interface Props {
   externalVm?: ReturnType<typeof useContactTutorialViewModel>;
}

export default function ContactosScreen({  externalVm }: Props) {
  const internalVm = useContactTutorialViewModel();
  const vm =  externalVm ?? internalVm;

  // ── Animación card spring ────────────────────────────────────────────────
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1, delay: 200,
      tension: 60, friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const cardAnimStyle = {
    opacity: cardAnim,
    transform: [{
      translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }),
    }],
  };

  return (
     <View style={contactStyle.screenBg}>

      <LinearGradient
        colors={["#f3afed", "#FCE7F3", "#b026bd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
         <BackgroundCircles />
    

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

        {/* Lottie */}
        <View style={contactStyle.lottieSection}>
          <LottieView
            source={require("@assets/imagesAlertaMujer/ScTutorial/Contacto.json")}
            autoPlay
            loop
            resizeMode="contain"
            style={contactStyle.lottie}
          />
        </View>

        {/* Card animada */}
        <Animated.View style={[{ flex: 1 }, cardAnimStyle]}>
          <Card title={`Tu Red de\n`} titleHighlight="Apoyo">
            <ScrollView
              style={contactStyle.cardScroll}
              contentContainerStyle={contactStyle.cardScrollContent}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {/* Sección principal */}
              <View style={contactStyle.sectionRow}>
                <Text style={contactStyle.sectionLabel}>TU RED DE FAMILIA</Text>
                <View style={contactStyle.sectionLine} />
              </View>

              {vm.featureRows.map((item, index) => (
                <FeatureRow
                  key={item.id}
                  item={item}
                  enterDelay={200 + index * 110}
                />
              ))}

              <View style={contactStyle.divider} />

              {/* Detalle descriptivo */}
              <View style={{ gap: 4 }}>
                {vm.featureRows.map((item) => (
                  <View key={`desc-${item.id}`} style={contactStyle.descRow}>
                    <View style={[contactStyle.descDot, { backgroundColor: item.color }]} />
                    <View style={contactStyle.descTextWrap}>
                      <Text>
                        <Text style={[contactStyle.descHighlight, { color: item.color }]}>
                          {item.highlightLabel}
                        </Text>
                        <Text style={contactStyle.descBold}>{item.boldLabel} </Text>
                        <Text style={contactStyle.descNormal}>{item.detailDesc}</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={contactStyle.divider} />

              {/* Sección permisos */}
              <View style={contactStyle.sectionRow}>
                <Text style={contactStyle.sectionLabel}>PERMISOS NECESARIOS</Text>
                <View style={contactStyle.sectionLine} />
              </View>

              <View style={contactStyle.permisosCard}>
                <View style={contactStyle.permisosRow}>
                  <Text style={contactStyle.permisosEmoji}>👥</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={contactStyle.permisosTitle}>Acceso a contactos</Text>
                    <Text style={contactStyle.permisosDesc}>
                      Necesitamos acceder a tus contactos para que puedas elegir tu red de confianza.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Badge inferior */}
              <View style={contactStyle.bottomBadge}>
                <Text style={{ fontSize: 16 }}>❤️</Text>
                <Text style={contactStyle.bottomBadgeText}>Siempre conectada</Text>
              </View>

            </ScrollView>
          </Card>
        </Animated.View>

      </SafeAreaView>

      {/* Overlay advertencia — lógica original intacta */}
      {vm.showWarning && (
        <View style={contactStyle.overlayBg}>
          <View style={contactStyle.warningBox}>
            <Text style={contactStyle.warningText}>
              ⚠️ Sin acceso a contactos no podrás elegir personas de confianza para tus alertas.
            </Text>
            <TouchableOpacity onPress={vm.retryPermissions} style={contactStyle.btnPrimary}>
              <Text style={contactStyle.btnPrimaryText}>Activar permisos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={vm.continueWithoutPermissions} style={contactStyle.btnSecondary}>
              <Text style={contactStyle.btnSecondaryText}>Continuar sin permisos</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PermissionsModal
        visible={vm.modalVisible}
        tipo="contacto"
        onConfirmar={vm.confirmModal}
        onCancelar={vm.cancelModal}
      />
      </LinearGradient>
    </View>
  );
}