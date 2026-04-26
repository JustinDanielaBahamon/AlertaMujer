import React, { useEffect, useRef } from "react";
import {View,Text,Animated,TouchableOpacity,ScrollView,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import Card from "../../../src/components/ui/card/card";
import PermisosModal from "../../../src/components/ui/modalMesanje/permisosMLL";
import {useContactoTutorialViewModel,type ContactoFeatureItem,} from "./useContactoTutorialViewModel";
import { contactoStyle, CONTACTO_COLORS } from "./contactoStyle";
import { LinearGradient } from 'expo-linear-gradient';
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
      <Animated.View style={[contactoStyle.bgCircleBase,
        { width: 200, height: 200, borderRadius: 100, backgroundColor: CONTACTO_COLORS.circle1,
          opacity: 0.09, top: -55, right: -60, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[contactoStyle.bgCircleBase,
        { width: 130, height: 130, borderRadius: 65, backgroundColor: CONTACTO_COLORS.circle2,
          opacity: 0.10, top: 50, left: -40, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[contactoStyle.bgCircleBase,
        { width: 90, height: 90, borderRadius: 45, backgroundColor: CONTACTO_COLORS.circle3,
          opacity: 0.09, top: 170, right: 10, transform: [{ translateY: f3 }] }]} />
      <Animated.View style={[contactoStyle.bgCircleBase,
        { width: 55, height: 55, borderRadius: 28, backgroundColor: CONTACTO_COLORS.circle4,
          opacity: 0.13, top: 110, left: "44%" as any, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[contactoStyle.bgCircleBase,
        { width: 70, height: 70, borderRadius: 35, backgroundColor: CONTACTO_COLORS.circle2,
          opacity: 0.08, top: 230, left: 20, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[contactoStyle.bgRingBase,
        { width: 100, height: 100, borderRadius: 50, borderColor: CONTACTO_COLORS.circle1,
          opacity: 0.10, top: 30, right: 30, transform: [{ translateY: f3 }] }]} />
    </>
  );
}

// ─── Fila de característica animada ──────────────────────────────────────────
function FeatureRow({ item, enterDelay }: { item: ContactoFeatureItem; enterDelay: number }) {
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
      <View style={[contactoStyle.featureRow, {
        backgroundColor: item.colorLight,
        borderColor:     item.colorBorder,
        shadowColor:     item.color,
      }]}>
        <View style={[contactoStyle.featureRowAccent, { backgroundColor: item.color }]} />

        <View style={[contactoStyle.rowIconWrap, {
          backgroundColor: item.color + "25",
          borderWidth: 1.5,
          borderColor: item.color + "40",
        }]}>
          <Text style={contactoStyle.rowIcon}>{item.emoji}</Text>
        </View>

        <View style={contactoStyle.rowTextContainer}>
          <Text style={[contactoStyle.rowTitle, { color: item.color }]}>{item.title}</Text>
          <Text style={contactoStyle.rowDesc}>{item.desc}</Text>
        </View>

        <View style={[contactoStyle.badge, { backgroundColor: item.color + "20" }]}>
          <Text style={[contactoStyle.badgeText, { color: item.color }]}>{item.badge}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
interface Props {
  vmExterno?: ReturnType<typeof useContactoTutorialViewModel>;
}

export default function ContactosScreen({ vmExterno }: Props) {
  const vmInterno = useContactoTutorialViewModel();
  const vm = vmExterno ?? vmInterno;

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
     <View style={contactoStyle.screenBg}>

      <LinearGradient
        colors={["#FFF0F6", "#FCE7F3", "#b026bd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
         <BackgroundCircles />
    

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

        {/* Lottie */}
        <View style={contactoStyle.lottieSection}>
          <LottieView
            source={require("../../../assets/imagesAlertaMujer/ScTutorial/Contacto.json")}
            autoPlay
            loop
            resizeMode="contain"
            style={contactoStyle.lottie}
          />
        </View>

        {/* Card animada */}
        <Animated.View style={[{ flex: 1 }, cardAnimStyle]}>
          <Card title={`Tu Red de\n`} titleHighlight="Apoyo">
            <ScrollView
              style={contactoStyle.cardScroll}
              contentContainerStyle={contactoStyle.cardScrollContent}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {/* Sección principal */}
              <View style={contactoStyle.sectionRow}>
                <Text style={contactoStyle.sectionLabel}>TU RED DE FAMILIA</Text>
                <View style={contactoStyle.sectionLine} />
              </View>

              {vm.featureRows.map((item, index) => (
                <FeatureRow
                  key={item.id}
                  item={item}
                  enterDelay={200 + index * 110}
                />
              ))}

              <View style={contactoStyle.divider} />

              {/* Detalle descriptivo */}
              <View style={{ gap: 4 }}>
                {vm.featureRows.map((item) => (
                  <View key={`desc-${item.id}`} style={contactoStyle.descRow}>
                    <View style={[contactoStyle.descDot, { backgroundColor: item.color }]} />
                    <View style={contactoStyle.descTextWrap}>
                      <Text>
                        <Text style={[contactoStyle.descHighlight, { color: item.color }]}>
                          {item.highlightLabel}
                        </Text>
                        <Text style={contactoStyle.descBold}>{item.boldLabel} </Text>
                        <Text style={contactoStyle.descNormal}>{item.detailDesc}</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={contactoStyle.divider} />

              {/* Sección permisos */}
              <View style={contactoStyle.sectionRow}>
                <Text style={contactoStyle.sectionLabel}>PERMISOS NECESARIOS</Text>
                <View style={contactoStyle.sectionLine} />
              </View>

              <View style={contactoStyle.permisosCard}>
                <View style={contactoStyle.permisosRow}>
                  <Text style={contactoStyle.permisosEmoji}>👥</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={contactoStyle.permisosTitle}>Acceso a contactos</Text>
                    <Text style={contactoStyle.permisosDesc}>
                      Necesitamos acceder a tus contactos para que puedas elegir tu red de confianza.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Badge inferior */}
              <View style={contactoStyle.bottomBadge}>
                <Text style={{ fontSize: 16 }}>❤️</Text>
                <Text style={contactoStyle.bottomBadgeText}>Siempre conectada</Text>
              </View>

            </ScrollView>
          </Card>
        </Animated.View>

      </SafeAreaView>

      {/* Overlay advertencia — lógica original intacta */}
      {vm.mostrarAdvertencia && (
        <View style={contactoStyle.overlayBg}>
          <View style={contactoStyle.warningBox}>
            <Text style={contactoStyle.warningText}>
              ⚠️ Sin acceso a contactos no podrás elegir personas de confianza para tus alertas.
            </Text>
            <TouchableOpacity onPress={vm.reintentarPermisos} style={contactoStyle.btnPrimary}>
              <Text style={contactoStyle.btnPrimaryText}>Activar permisos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={vm.continuarSinPermisos} style={contactoStyle.btnSecondary}>
              <Text style={contactoStyle.btnSecondaryText}>Continuar sin permisos</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PermisosModal
        visible={vm.modalVisible}
        tipo="contacto"
        onConfirmar={vm.confirmarModal}
        onCancelar={vm.cancelarModal}
      />
      </LinearGradient>
    </View>
  );
}