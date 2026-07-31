import { LinearGradient } from 'expo-linear-gradient';
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../../components/ui/card/card";
import PermissionsModal from "../../../components/ui/modalMesanje/permisosMLL";
import { SECURITY_COLORS, securityStyle } from "../styles/securityStyle";
import { useSecurityTutorialViewModel, type SecurityFeatureItem, } from "../viewModel/useSecurityTutorialViewModel";
import { useLocale } from "../../../contexts/LocaleContext";

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
      <Animated.View style={[securityStyle.bgCircleBase,
        { width: 200, height: 200, borderRadius: 100, backgroundColor: SECURITY_COLORS.circle1,
          opacity: 0.08, top: -55, right: -60, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[securityStyle.bgCircleBase,
        { width: 130, height: 130, borderRadius: 65, backgroundColor: SECURITY_COLORS.circle2,
          opacity: 0.09, top: 50, left: -40, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[securityStyle.bgCircleBase,
        { width: 90, height: 90, borderRadius: 45, backgroundColor: SECURITY_COLORS.circle3,
          opacity: 0.08, top: 170, right: 10, transform: [{ translateY: f3 }] }]} />
      <Animated.View style={[securityStyle.bgCircleBase,
        { width: 55, height: 55, borderRadius: 28, backgroundColor: SECURITY_COLORS.circle4,
          opacity: 0.12, top: 110, left: "44%" as any, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[securityStyle.bgCircleBase,
        { width: 70, height: 70, borderRadius: 35, backgroundColor: SECURITY_COLORS.circle2,
          opacity: 0.07, top: 230, left: 20, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[securityStyle.bgRingBase,
        { width: 100, height: 100, borderRadius: 50, borderColor: SECURITY_COLORS.circle1,
          opacity: 0.10, top: 30, right: 30, transform: [{ translateY: f3 }] }]} />
    </>
  );
}

// ─── Fila de característica animada ──────────────────────────────────────────
function FeatureRow({ item, enterDelay }: { item: SecurityFeatureItem; enterDelay: number }) {
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
      <View style={[securityStyle.featureRow, {
        backgroundColor: item.colorLight,
        borderColor:     item.colorBorder,
        shadowColor:     item.color,
      }]}>
        <View style={[securityStyle.featureRowAccent, { backgroundColor: item.color }]} />

        <View style={[securityStyle.rowIconWrap, {
          backgroundColor: item.color + "25",
          borderWidth: 1.5,
          borderColor: item.color + "40",
        }]}>
          <Text style={securityStyle.rowIcon}>{item.emoji}</Text>
        </View>

        <View style={securityStyle.rowTextContainer}>
          <Text style={[securityStyle.rowTitle, { color: item.color }]}>{item.title}</Text>
          <Text style={securityStyle.rowDesc}>{item.desc}</Text>
        </View>

        <View style={[securityStyle.badge, { backgroundColor: item.color + "20" }]}>
          <Text style={[securityStyle.badgeText, { color: item.color }]}>{item.badge}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
interface Props {
  externalVm?: ReturnType<typeof useSecurityTutorialViewModel>;
}

export default function CameraAndMicrophoneTutorial({ externalVm }: Props) {
  const { t } = useLocale();
  const internalVm = useSecurityTutorialViewModel();
  const vm = externalVm ?? internalVm;

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
    <View style={securityStyle.screenBg}>
      <LinearGradient
        colors={["#f3afed", "#FCE7F3", "#b026bd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
      <BackgroundCircles />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

        {/* Lottie */}
        <View style={securityStyle.lottieSection}>
          <LottieView
            source={require("@assets/imagesAlertaMujer/ScTutorial/seguridad.json")}
            autoPlay
            loop
            resizeMode="contain"
            style={securityStyle.lottie}
          />
        </View>

        {/* Card animada */}
        <Animated.View style={[{ flex: 1 }, cardAnimStyle]}>
          <Card title={`${t.tutorial.seguridad_titulo_1}\n`} titleHighlight={t.tutorial.seguridad_titulo_2}>
            <ScrollView
              style={securityStyle.cardScroll}
              contentContainerStyle={securityStyle.cardScrollContent}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {/* Sección principal */}
              <View style={securityStyle.sectionRow}>
                <Text style={securityStyle.sectionLabel}>{t.tutorial.seguridad_evidencia_titulo}</Text>
                <View style={securityStyle.sectionLine} />
              </View>

              {vm.featureRows.map((item, index) => (
                <FeatureRow
                  key={item.id}
                  item={item}
                  enterDelay={200 + index * 110}
                />
              ))}

              <View style={securityStyle.divider} />

              {/* Detalle descriptivo */}
              <View style={{ gap: 4 }}>
                {vm.featureRows.map((item) => (
                  <View key={`desc-${item.id}`} style={securityStyle.descRow}>
                    <View style={[securityStyle.descDot, { backgroundColor: item.color }]} />
                    <View style={securityStyle.descTextWrap}>
                      <Text>
                        <Text style={[securityStyle.descHighlight, { color: item.color }]}>
                          {item.highlightLabel}
                        </Text>
                        <Text style={securityStyle.descBold}>{item.boldLabel} </Text>
                        <Text style={securityStyle.descNormal}>{item.detailDesc}</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={securityStyle.divider} />

              {/* Sección permisos — muestra los dos (cámara y audio) */}
              <View style={securityStyle.sectionRow}>
                <Text style={securityStyle.sectionLabel}>{t.tutorial.seguridad_permisos_titulo}</Text>
                <View style={securityStyle.sectionLine} />
              </View>

              <View style={securityStyle.permisosCard}>
                {/* Cámara */}
                <View style={securityStyle.permisosRow}>
                  <Text style={securityStyle.permisosEmoji}>📷</Text>
                  <View style={securityStyle.permisosTitleWrap}>
                    <Text style={securityStyle.permisosTitle}>{t.tutorial.seguridad_permisos_camara_titulo}</Text>
                    <Text style={securityStyle.permisosDesc}>
                      {t.tutorial.seguridad_permisos_camara_desc}
                    </Text>
                  </View>
                </View>

                <View style={securityStyle.permisosSeparator} />

                {/* Micrófono */}
                <View style={securityStyle.permisosRow}>
                  <Text style={securityStyle.permisosEmoji}>🎙️</Text>
                  <View style={securityStyle.permisosTitleWrap}>
                    <Text style={securityStyle.permisosTitle}>{t.tutorial.seguridad_permisos_microfono_titulo}</Text>
                    <Text style={securityStyle.permisosDesc}>
                      {t.tutorial.seguridad_permisos_microfono_desc}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Badge inferior */}
              <View style={securityStyle.bottomBadge}>
                <Text style={{ fontSize: 16 }}>🛡️</Text>
                <Text style={securityStyle.bottomBadgeText}>{t.tutorial.seguridad_badge_inferior}</Text>
              </View>

            </ScrollView>
          </Card>
        </Animated.View>

      </SafeAreaView>

      {/* Overlay advertencia — lógica original intacta */}
      {vm.showWarning && (
        <View style={securityStyle.overlayBg}>
          <View style={securityStyle.warningBox}>
            <Text style={securityStyle.warningText}>
              {t.tutorial.seguridad_warning_texto}
            </Text>
            <TouchableOpacity onPress={vm.retryPermissions} style={securityStyle.btnPrimary}>
              <Text style={securityStyle.btnPrimaryText}>{t.tutorial.seguridad_btn_activar_permisos}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={vm.continueWithoutPermissions} style={securityStyle.btnSecondary}>
              <Text style={securityStyle.btnSecondaryText}>{t.tutorial.seguridad_btn_continuar_sin_permisos}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <PermissionsModal
        visible={vm.modalVisible}
        tipo={vm.permissionType}
        onConfirmar={vm.confirmModal}
        onCancelar={vm.cancelModal}
      />
      </LinearGradient>
    </View>
  );
}