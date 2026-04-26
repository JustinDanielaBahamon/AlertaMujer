import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../../src/components/ui/card/card";
import PermisosModal from "../../../src/components/ui/modalMesanje/permisosMLL";
import { useSeguridadTutorialViewModel, type SeguridadFeatureItem, } from "./useSeguridadTutorialViewModel";
import { SEGURIDAD_COLORS, seguridadStyle } from "./seguridadStyle";

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
      <Animated.View style={[seguridadStyle.bgCircleBase,
        { width: 200, height: 200, borderRadius: 100, backgroundColor: SEGURIDAD_COLORS.circle1,
          opacity: 0.08, top: -55, right: -60, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[seguridadStyle.bgCircleBase,
        { width: 130, height: 130, borderRadius: 65, backgroundColor: SEGURIDAD_COLORS.circle2,
          opacity: 0.09, top: 50, left: -40, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[seguridadStyle.bgCircleBase,
        { width: 90, height: 90, borderRadius: 45, backgroundColor: SEGURIDAD_COLORS.circle3,
          opacity: 0.08, top: 170, right: 10, transform: [{ translateY: f3 }] }]} />
      <Animated.View style={[seguridadStyle.bgCircleBase,
        { width: 55, height: 55, borderRadius: 28, backgroundColor: SEGURIDAD_COLORS.circle4,
          opacity: 0.12, top: 110, left: "44%" as any, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[seguridadStyle.bgCircleBase,
        { width: 70, height: 70, borderRadius: 35, backgroundColor: SEGURIDAD_COLORS.circle2,
          opacity: 0.07, top: 230, left: 20, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[seguridadStyle.bgRingBase,
        { width: 100, height: 100, borderRadius: 50, borderColor: SEGURIDAD_COLORS.circle1,
          opacity: 0.10, top: 30, right: 30, transform: [{ translateY: f3 }] }]} />
    </>
  );
}

// ─── Fila de característica animada ──────────────────────────────────────────
function FeatureRow({ item, enterDelay }: { item: SeguridadFeatureItem; enterDelay: number }) {
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
      <View style={[seguridadStyle.featureRow, {
        backgroundColor: item.colorLight,
        borderColor:     item.colorBorder,
        shadowColor:     item.color,
      }]}>
        <View style={[seguridadStyle.featureRowAccent, { backgroundColor: item.color }]} />

        <View style={[seguridadStyle.rowIconWrap, {
          backgroundColor: item.color + "25",
          borderWidth: 1.5,
          borderColor: item.color + "40",
        }]}>
          <Text style={seguridadStyle.rowIcon}>{item.emoji}</Text>
        </View>

        <View style={seguridadStyle.rowTextContainer}>
          <Text style={[seguridadStyle.rowTitle, { color: item.color }]}>{item.title}</Text>
          <Text style={seguridadStyle.rowDesc}>{item.desc}</Text>
        </View>

        <View style={[seguridadStyle.badge, { backgroundColor: item.color + "20" }]}>
          <Text style={[seguridadStyle.badgeText, { color: item.color }]}>{item.badge}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
interface Props {
  vmExterno?: ReturnType<typeof useSeguridadTutorialViewModel>;
}

export default function CamaraMicrofonoTutorial({ vmExterno }: Props) {
  const vmInterno = useSeguridadTutorialViewModel();
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
    <View style={seguridadStyle.screenBg}>
      <BackgroundCircles />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

        {/* Lottie */}
        <View style={seguridadStyle.lottieSection}>
          <LottieView
            source={require("../../../assets/imagesAlertaMujer/ScTutorial/seguridad.json")}
            autoPlay
            loop
            resizeMode="contain"
            style={seguridadStyle.lottie}
          />
        </View>

        {/* Card animada */}
        <Animated.View style={[{ flex: 1 }, cardAnimStyle]}>
          <Card title={`Seguridad en\n`} titleHighlight="Video y Audio">
            <ScrollView
              style={seguridadStyle.cardScroll}
              contentContainerStyle={seguridadStyle.cardScrollContent}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {/* Sección principal */}
              <View style={seguridadStyle.sectionRow}>
                <Text style={seguridadStyle.sectionLabel}>TU EVIDENCIA SEGURA</Text>
                <View style={seguridadStyle.sectionLine} />
              </View>

              {vm.featureRows.map((item, index) => (
                <FeatureRow
                  key={item.id}
                  item={item}
                  enterDelay={200 + index * 110}
                />
              ))}

              <View style={seguridadStyle.divider} />

              {/* Detalle descriptivo */}
              <View style={{ gap: 4 }}>
                {vm.featureRows.map((item) => (
                  <View key={`desc-${item.id}`} style={seguridadStyle.descRow}>
                    <View style={[seguridadStyle.descDot, { backgroundColor: item.color }]} />
                    <View style={seguridadStyle.descTextWrap}>
                      <Text>
                        <Text style={[seguridadStyle.descHighlight, { color: item.color }]}>
                          {item.highlightLabel}
                        </Text>
                        <Text style={seguridadStyle.descBold}>{item.boldLabel} </Text>
                        <Text style={seguridadStyle.descNormal}>{item.detailDesc}</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={seguridadStyle.divider} />

              {/* Sección permisos — muestra los dos (cámara y audio) */}
              <View style={seguridadStyle.sectionRow}>
                <Text style={seguridadStyle.sectionLabel}>PERMISOS NECESARIOS</Text>
                <View style={seguridadStyle.sectionLine} />
              </View>

              <View style={seguridadStyle.permisosCard}>
                {/* Cámara */}
                <View style={seguridadStyle.permisosRow}>
                  <Text style={seguridadStyle.permisosEmoji}>📷</Text>
                  <View style={seguridadStyle.permisosTitleWrap}>
                    <Text style={seguridadStyle.permisosTitle}>Acceso a cámara</Text>
                    <Text style={seguridadStyle.permisosDesc}>
                      Necesaria para grabar video como evidencia en emergencias.
                    </Text>
                  </View>
                </View>

                <View style={seguridadStyle.permisosSeparator} />

                {/* Micrófono */}
                <View style={seguridadStyle.permisosRow}>
                  <Text style={seguridadStyle.permisosEmoji}>🎙️</Text>
                  <View style={seguridadStyle.permisosTitleWrap}>
                    <Text style={seguridadStyle.permisosTitle}>Acceso a micrófono</Text>
                    <Text style={seguridadStyle.permisosDesc}>
                      Necesario para grabar audio y capturar tu entorno sonoro.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Badge inferior */}
              <View style={seguridadStyle.bottomBadge}>
                <Text style={{ fontSize: 16 }}>🛡️</Text>
                <Text style={seguridadStyle.bottomBadgeText}>Grabación encriptada</Text>
              </View>

            </ScrollView>
          </Card>
        </Animated.View>

      </SafeAreaView>

      {/* Overlay advertencia — lógica original intacta */}
      {vm.mostrarAdvertencia && (
        <View style={seguridadStyle.overlayBg}>
          <View style={seguridadStyle.warningBox}>
            <Text style={seguridadStyle.warningText}>
              ⚠️ Sin cámara y micrófono no podrás grabar evidencia en caso de emergencia.
            </Text>
            <TouchableOpacity onPress={vm.reintentarPermisos} style={seguridadStyle.btnPrimary}>
              <Text style={seguridadStyle.btnPrimaryText}>Activar permisos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={vm.continuarSinPermisos} style={seguridadStyle.btnSecondary}>
              <Text style={seguridadStyle.btnSecondaryText}>Continuar sin permisos</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <PermisosModal
        visible={vm.modalVisible}
        tipo={vm.tipoPermiso}
        onConfirmar={vm.confirmarModal}
        onCancelar={vm.cancelarModal}
      />
    </View>
  );
}