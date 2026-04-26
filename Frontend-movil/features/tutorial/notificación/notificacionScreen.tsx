import React, { useEffect, useRef } from "react";
import {View,Text,Animated,TouchableOpacity,ScrollView,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import Card from "../../../src/components/ui/card/card";
import PermisosModal from "../../../src/components/ui/modalMesanje/permisosMLL";
import {useNotificacionTutorialViewModel,type NotifFeatureItem,} from "./useNotificacionTutorialViewModel";
import { notificacionStyle, NOTIF_COLORS } from "./notificacionStyle";
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
      <Animated.View style={[notificacionStyle.bgCircleBase,
        { width: 200, height: 200, borderRadius: 100, backgroundColor: NOTIF_COLORS.circle1,
          opacity: 0.09, top: -55, right: -60, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[notificacionStyle.bgCircleBase,
        { width: 130, height: 130, borderRadius: 65, backgroundColor: NOTIF_COLORS.circle2,
          opacity: 0.09, top: 50, left: -40, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[notificacionStyle.bgCircleBase,
        { width: 90, height: 90, borderRadius: 45, backgroundColor: NOTIF_COLORS.circle3,
          opacity: 0.08, top: 170, right: 10, transform: [{ translateY: f3 }] }]} />
      <Animated.View style={[notificacionStyle.bgCircleBase,
        { width: 55, height: 55, borderRadius: 28, backgroundColor: NOTIF_COLORS.circle4,
          opacity: 0.13, top: 110, left: "44%" as any, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[notificacionStyle.bgCircleBase,
        { width: 70, height: 70, borderRadius: 35, backgroundColor: NOTIF_COLORS.circle2,
          opacity: 0.07, top: 230, left: 20, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[notificacionStyle.bgRingBase,
        { width: 100, height: 100, borderRadius: 50, borderColor: NOTIF_COLORS.circle1,
          opacity: 0.10, top: 30, right: 30, transform: [{ translateY: f3 }] }]} />
    </>
  );
}

// ─── Fila de característica animada ──────────────────────────────────────────
function FeatureRow({ item, enterDelay }: { item: NotifFeatureItem; enterDelay: number }) {
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
      <View style={[notificacionStyle.featureRow, {
        backgroundColor: item.colorLight,
        borderColor:     item.colorBorder,
        shadowColor:     item.color,
      }]}>
        <View style={[notificacionStyle.featureRowAccent, { backgroundColor: item.color }]} />

        <View style={[notificacionStyle.rowIconWrap, {
          backgroundColor: item.color + "25",
          borderWidth: 1.5,
          borderColor: item.color + "40",
        }]}>
          <Text style={notificacionStyle.rowIcon}>{item.emoji}</Text>
        </View>

        <View style={notificacionStyle.rowTextContainer}>
          <Text style={[notificacionStyle.rowTitle, { color: item.color }]}>{item.title}</Text>
          <Text style={notificacionStyle.rowDesc}>{item.desc}</Text>
        </View>

        <View style={[notificacionStyle.badge, { backgroundColor: item.color + "20" }]}>
          <Text style={[notificacionStyle.badgeText, { color: item.color }]}>{item.badge}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

interface Props {
  vmExterno?: ReturnType<typeof useNotificacionTutorialViewModel>;
}

export default function NotificacionTutorial({ vmExterno }: Props) {
  const vmInterno = useNotificacionTutorialViewModel();
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

    <View style={notificacionStyle.screenBg}>
      <LinearGradient
              colors={["#FFF0F6", "#FCE7F3", "#b026bd"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            >
      <BackgroundCircles />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

        {/* Lottie */}
        <View style={notificacionStyle.lottieSection}>
          <LottieView
            source={require("../../../assets/imagesAlertaMujer/ScTutorial/Notificacion.json")}
            autoPlay
            loop
            resizeMode="contain"
            style={notificacionStyle.lottie}
          />
        </View>

        {/* Card animada */}
        <Animated.View style={[{ flex: 1 }, cardAnimStyle]}>
          <Card title={`Mantente\n`} titleHighlight="Informada">
            <ScrollView
              style={notificacionStyle.cardScroll}
              contentContainerStyle={notificacionStyle.cardScrollContent}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {/* Sección principal */}
              <View style={notificacionStyle.sectionRow}>
                <Text style={notificacionStyle.sectionLabel}>SIEMPRE INFORMADA</Text>
                <View style={notificacionStyle.sectionLine} />
              </View>

              {vm.featureRows.map((item, index) => (
                <FeatureRow
                  key={item.id}
                  item={item}
                  enterDelay={200 + index * 110}
                />
              ))}

              <View style={notificacionStyle.divider} />

              {/* Detalle descriptivo */}
              <View style={{ gap: 4 }}>
                {vm.featureRows.map((item) => (
                  <View key={`desc-${item.id}`} style={notificacionStyle.descRow}>
                    <View style={[notificacionStyle.descDot, { backgroundColor: item.color }]} />
                    <View style={notificacionStyle.descTextWrap}>
                      <Text>
                        <Text style={[notificacionStyle.descHighlight, { color: item.color }]}>
                          {item.highlightLabel}
                        </Text>
                        <Text style={notificacionStyle.descBold}>{item.boldLabel} </Text>
                        <Text style={notificacionStyle.descNormal}>{item.detailDesc}</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={notificacionStyle.divider} />

              {/* Sección permisos */}
              <View style={notificacionStyle.sectionRow}>
                <Text style={notificacionStyle.sectionLabel}>PERMISOS NECESARIOS</Text>
                <View style={notificacionStyle.sectionLine} />
              </View>

              <View style={notificacionStyle.permisosCard}>
                <View style={notificacionStyle.permisosRow}>
                  <Text style={notificacionStyle.permisosEmoji}>🔔</Text>
                  <View style={notificacionStyle.permisosTitleWrap}>
                    <Text style={notificacionStyle.permisosTitle}>Notificaciones push</Text>
                    <Text style={notificacionStyle.permisosDesc}>
                      Necesarias para recibir alertas SOS y avisos de tu red de apoyo en tiempo real.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Botón Finalizar — dentro del scroll para que sea visible */}
              <TouchableOpacity
                onPress={vm.abrirModal}
                style={notificacionStyle.btnFinalizar}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 18 }}>🚀</Text>
                <Text style={notificacionStyle.btnFinalizarText}>Finalizar y Activar</Text>
              </TouchableOpacity>

              {/* Badge inferior */}
              <View style={notificacionStyle.bottomBadge}>
                <Text style={{ fontSize: 16 }}>⚡</Text>
                <Text style={notificacionStyle.bottomBadgeText}>Alertas en tiempo real</Text>
              </View>

            </ScrollView>
          </Card>
        </Animated.View>

      </SafeAreaView>

      {/* Overlay advertencia */}
      {vm.mostrarAdvertencia && (
        <View style={notificacionStyle.overlayBg}>
          <View style={notificacionStyle.warningBox}>
            <Text style={notificacionStyle.warningText}>
              ⚠️ Sin notificaciones no recibirás avisos cuando tu red de apoyo responda.
            </Text>
            <TouchableOpacity onPress={vm.reintentarPermisos} style={notificacionStyle.btnPrimary}>
              <Text style={notificacionStyle.btnPrimaryText}>Activar notificaciones</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={vm.continuarSinPermisos} style={notificacionStyle.btnSecondary}>
              <Text style={notificacionStyle.btnSecondaryText}>Ir al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PermisosModal
        visible={vm.modalVisible}
        tipo="notificacion"
        onConfirmar={vm.confirmarModal}
        onCancelar={vm.cancelarModal}
      />
      </LinearGradient>
    </View>
  );
}
    
