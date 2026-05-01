import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../../src/components/ui/card/card";
import CustomePermisos from "../../../src/components/ui/modalMesanje/permisosMLL";
import { messageStyle, MSG_COLORS } from "./messageStyle";
import { useMessagesTutorialViewModel, type FeatureItem } from "./useMessagesTutorialViewModel";
import { LinearGradient } from 'expo-linear-gradient';

// ─── Círculos de fondo decorativos ───────────────────────────────────────────
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
      <Animated.View style={[messageStyle.bgCircleBase,
        { width: 200, height: 200, borderRadius: 100, backgroundColor: MSG_COLORS.circle1,
          opacity: 0.08, top: -55, right: -60, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[messageStyle.bgCircleBase,
        { width: 130, height: 130, borderRadius: 65, backgroundColor: MSG_COLORS.circle2,
          opacity: 0.09, top: 50, left: -40, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[messageStyle.bgCircleBase,
        { width: 90, height: 90, borderRadius: 45, backgroundColor: MSG_COLORS.circle3,
          opacity: 0.08, top: 170, right: 10, transform: [{ translateY: f3 }] }]} />
      <Animated.View style={[messageStyle.bgCircleBase,
        { width: 55, height: 55, borderRadius: 28, backgroundColor: MSG_COLORS.circle4,
          opacity: 0.12, top: 110, left: "44%", transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[messageStyle.bgCircleBase,
        { width: 70, height: 70, borderRadius: 35, backgroundColor: MSG_COLORS.circle2,
          opacity: 0.07, top: 230, left: 20, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[messageStyle.bgRingBase,
        { width: 100, height: 100, borderRadius: 50, borderColor: MSG_COLORS.circle1,
          opacity: 0.10, top: 30, right: 30, transform: [{ translateY: f3 }] }]} />
    </>
  );
}

// ─── fila de animacion ──────────────────────────────────────────────────────
function FeatureRow({ item, enterDelay }: { item: FeatureItem; enterDelay: number }) {
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
      <View style={[messageStyle.featureRow, {
        backgroundColor: item.colorLight,
        borderColor:     item.colorBorder,
        shadowColor:     item.color,
      }]}>
        <View style={[messageStyle.featureRowAccent, { backgroundColor: item.color }]} />
        <View style={[messageStyle.rowIconWrap, {
          backgroundColor: item.color + "25",
          borderWidth: 1.5,
          borderColor: item.color + "40",
        }]}>
          <Text style={messageStyle.rowIcon}>{item.emoji}</Text>
        </View>
        <View style={messageStyle.rowTextContainer}>
          <Text style={[messageStyle.rowTitle, { color: item.color }]}>{item.title}</Text>
          <Text style={messageStyle.rowDesc}>{item.desc}</Text>
        </View>
        <View style={[messageStyle.badge, { backgroundColor: item.color + "20" }]}>
          <Text style={[messageStyle.badgeText, { color: item.color }]}>{item.badge}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────────────
interface Props {
  externalVm?: ReturnType<typeof useMessagesTutorialViewModel>;
}

export default function MessagesScreen({ externalVm }: Props) {
  const internalVm = useMessagesTutorialViewModel();
  const vm = externalVm ?? internalVm;

  // ── Animación de entrada de tarjeta de primavera ────────────────────────────────────────
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      delay: 200,
      tension: 60,
      friction: 8,
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
   // 1️ Vista exterior — igual que antes
    <View style={messageStyle.screenBg}>

      {/* 2️⃣ LinearGradient cubre todo el interior */}
      <LinearGradient
        colors={["#f3afed", "#FCE7F3", "#b026bd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        {/* 3️⃣ Los círculos van DENTRO del degradado */}
        <BackgroundCircles />

        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

          {/* Lottie animation */}
          <View style={messageStyle.lottieSection}>
            <LottieView
              source={require("../../../assets/imagesAlertaMujer/ScTutorial/Message.json")}
              autoPlay
              loop
              resizeMode="contain"
              style={messageStyle.lottie}
            />
          </View>

          {/* Animated card */}
          <Animated.View style={[{ flex: 1 }, cardAnimStyle]}>
            <Card title={`Mensajes y\n`} titleHighlight="Llamadas">
              <ScrollView
                style={messageStyle.cardScroll}
                contentContainerStyle={messageStyle.cardScrollContent}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
              >
                <View style={messageStyle.sectionRow}>
                  <Text style={messageStyle.sectionLabel}>CÓMO TE PROTEGEMOS</Text>
                  <View style={messageStyle.sectionLine} />
                </View>

                {vm.featureRows.map((item, index) => (
                  <FeatureRow
                    key={item.id}
                    item={item}
                    enterDelay={200 + index * 110}
                  />
                ))}

                <View style={messageStyle.divider} />

                <View style={{ gap: 4 }}>
                  {vm.featureRows.map((item) => (
                    <View key={`desc-${item.id}`} style={messageStyle.descRow}>
                      <View style={[messageStyle.descDot, { backgroundColor: item.color }]} />
                      <View style={messageStyle.descTextWrap}>
                        <Text>
                          <Text style={[messageStyle.descHighlight, { color: item.color }]}>
                            {item.highlightLabel}
                          </Text>
                          <Text style={messageStyle.descBold}>{item.boldLabel} </Text>
                          <Text style={messageStyle.descNormal}>{item.detailDesc}</Text>
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={messageStyle.divider} />

                <View style={messageStyle.sectionRow}>
                  <Text style={messageStyle.sectionLabel}>PERMISOS NECESARIOS</Text>
                  <View style={messageStyle.sectionLine} />
                </View>

                <View style={messageStyle.permisosCard}>
                  <View style={messageStyle.permisosRow}>
                    <Text style={messageStyle.permisosEmoji}>🔐</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={messageStyle.permisosTitle}>Activa los permisos</Text>
                      <Text style={messageStyle.permisosDesc}>
                        SMS y llamadas son necesarios para que las alertas funcionen correctamente.
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={messageStyle.bottomBadge}>
                  <Text style={{ fontSize: 16 }}>📡</Text>
                  <Text style={messageStyle.bottomBadgeText}>Alerta en segundos</Text>
                </View>

              </ScrollView>
            </Card>
          </Animated.View>

        </SafeAreaView>

        {/* 4️⃣ La superposición de advertencia también va DENTRO del degradado */}
        {vm.showWarning && (
          <View style={messageStyle.overlayBg}>
            <View style={messageStyle.warningBox}>
              <Text style={messageStyle.warningText}>
                ⚠️ Sin estos permisos las alertas de emergencia no funcionarán correctamente.
              </Text>
              <TouchableOpacity onPress={vm.retryPermissions} style={messageStyle.btnPrimary}>
                <Text style={messageStyle.btnPrimaryText}>Activar permisos</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={vm.continueWithoutPermissions} style={messageStyle.btnSecondary}>
                <Text style={messageStyle.btnSecondaryText}>Continuar sin permisos</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <CustomePermisos
          visible={vm.modalVisible}
          tipo={vm.permissionType}
          onConfirmar={vm.confirmModal}
          onCancelar={vm.cancelModal}
        />

      {/* 5️⃣ Cerrar LinearGradient */}
      </LinearGradient>

    {/* 6️⃣ Cerrar vista externa */}
    </View>
  );
}