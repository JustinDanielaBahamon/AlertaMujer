import React, { useEffect, useRef } from "react";
import {View,Text,Animated,ScrollView,TouchableOpacity,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import LottieView from "lottie-react-native";
import Card from "../../../src/components/ui/card/card";
import ModalConfirmacion from "@/src/components/ui/modalConfirmacion/confirmacion";
import { useUbicacionTutorialViewModel, PLACEHOLDER_MUNICIPIO } from "./useUbicacionTutorialViewModel";
import { ubicacionStyle, UBIC_COLORS } from "./ubicacionStyle";
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
      <Animated.View style={[ubicacionStyle.bgCircleBase,
        { width: 200, height: 200, borderRadius: 100, backgroundColor: UBIC_COLORS.circle1,
          opacity: 0.08, top: -55, right: -60, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[ubicacionStyle.bgCircleBase,
        { width: 130, height: 130, borderRadius: 65, backgroundColor: UBIC_COLORS.circle2,
          opacity: 0.09, top: 50, left: -40, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[ubicacionStyle.bgCircleBase,
        { width: 90, height: 90, borderRadius: 45, backgroundColor: UBIC_COLORS.circle3,
          opacity: 0.08, top: 170, right: 10, transform: [{ translateY: f3 }] }]} />
      <Animated.View style={[ubicacionStyle.bgCircleBase,
        { width: 55, height: 55, borderRadius: 28, backgroundColor: UBIC_COLORS.circle4,
          opacity: 0.12, top: 110, left: "44%" as any, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[ubicacionStyle.bgCircleBase,
        { width: 70, height: 70, borderRadius: 35, backgroundColor: UBIC_COLORS.circle2,
          opacity: 0.07, top: 230, left: 20, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[ubicacionStyle.bgRingBase,
        { width: 100, height: 100, borderRadius: 50, borderColor: UBIC_COLORS.circle1,
          opacity: 0.10, top: 30, right: 30, transform: [{ translateY: f3 }] }]} />
    </>
  );
}
interface UbicacionScreenProps {
  vmExterno?: ReturnType<typeof useUbicacionTutorialViewModel>;
}
// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function UbicacionScreen({ vmExterno }: UbicacionScreenProps) {
  const vmInterno = useUbicacionTutorialViewModel();
  const vm = vmExterno ?? vmInterno;

  // ── Animación card de entrada (spring) ──────────────────────────────────
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

  // ── Shake animation para errores ─────────────────────────────────────────
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // Dispara shake cuando aparece el banner de validación
  useEffect(() => {
    if (vm.showValidationBanner) triggerShake();
  }, [vm.showValidationBanner]);

  const municipioNoSeleccionado =
    !vm.municipio || vm.municipio === PLACEHOLDER_MUNICIPIO;

  return (
    <View style={ubicacionStyle.screenBg}>

      <LinearGradient
        colors={["#FFF0F6", "#FCE7F3", "#b026bd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >

      <BackgroundCircles />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

        {/* Lottie */}
        <View style={ubicacionStyle.lottieSection}>
          <LottieView
            ref={vm.lottieRef}
            source={require("../../../assets/imagesAlertaMujer/ScTutorial/ubicacion.json")}
            autoPlay
            loop
            resizeMode="contain"
            style={ubicacionStyle.lottie}
          />
        </View>

        {/* Card animada */}
        <Animated.View style={[{ flex: 1 }, cardAnimStyle]}>
          <Card title={`Tu\n`} titleHighlight="Ubicación">
            <ScrollView
              style={ubicacionStyle.cardScroll}
              contentContainerStyle={ubicacionStyle.cardScrollContent}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {/* Sección: configurar ubicación */}
              <View style={ubicacionStyle.sectionRow}>
                <Text style={ubicacionStyle.sectionLabel}>CONFIGURA TU UBICACIÓN</Text>
                <View style={ubicacionStyle.sectionLine} />
              </View>

              {/* Info card */}
              <View style={ubicacionStyle.infoCard}>
                <View style={ubicacionStyle.infoCardAccent} />
                <View style={ubicacionStyle.infoIconWrap}>
                  <Text style={ubicacionStyle.infoIcon}>📍</Text>
                </View>
                <View style={ubicacionStyle.infoTextContainer}>
                  <Text style={ubicacionStyle.infoTitle}>Ayuda local</Text>
                  <Text style={ubicacionStyle.infoDesc}>
                    Selecciona tu ubicación para que los servicios de emergencia sepan dónde encontrarte.
                  </Text>
                </View>
              </View>

              {/* Banner de validación con shake */}
              {vm.showValidationBanner && (
                <Animated.View
                  style={[ubicacionStyle.validationBanner,
                    { transform: [{ translateX: shakeAnim }] }]}
                >
                  <Text style={{ fontSize: 18 }}>⚠️</Text>
                  <Text style={ubicacionStyle.validationBannerText}>
                    Por favor selecciona tu departamento y municipio antes de continuar.
                  </Text>
                </Animated.View>
              )}

              {/* Picker Departamento */}
              <View style={ubicacionStyle.pickerGroup}>
                <View style={ubicacionStyle.pickerLabelRow}>
                  <View style={ubicacionStyle.pickerLabelDot} />
                  <Text style={ubicacionStyle.pickerLabel}>DEPARTAMENTO</Text>
                </View>
                <View style={[
                  ubicacionStyle.pickerWrap,
                  vm.errors.departamento ? ubicacionStyle.pickerWrapError : null,
                ]}>
                  <Picker
                    selectedValue={vm.departamento}
                    onValueChange={vm.setDepartamento}
                    style={ubicacionStyle.picker}
                  >
                    <Picker.Item label="Huila" value="Huila" />
                  </Picker>
                </View>
                {vm.errors.departamento && (
                  <View style={ubicacionStyle.errorRow}>
                    <Text style={{ fontSize: 12 }}>🔴</Text>
                    <Text style={ubicacionStyle.errorText}>{vm.errors.departamento}</Text>
                  </View>
                )}
              </View>

              {/* Picker Municipio */}
              <View style={ubicacionStyle.pickerGroup}>
                <View style={ubicacionStyle.pickerLabelRow}>
                  <View style={ubicacionStyle.pickerLabelDot} />
                  <Text style={ubicacionStyle.pickerLabel}>MUNICIPIO</Text>
                </View>
                <View style={[
                  ubicacionStyle.pickerWrap,
                  vm.errors.municipio ? ubicacionStyle.pickerWrapError : null,
                ]}>
                  <Picker
                    selectedValue={vm.municipio}
                    onValueChange={vm.setMunicipio}
                    style={ubicacionStyle.picker}
                  >
                    {/* Opción placeholder */}
                    <Picker.Item
                      label="Selecciona tu municipio..."
                      value={PLACEHOLDER_MUNICIPIO}
                      color="#9CA3AF"
                    />
                    {vm.municipiosHuila.map((muni) => (
                      <Picker.Item key={muni} label={muni} value={muni} />
                    ))}
                  </Picker>
                </View>
                {vm.errors.municipio && (
                  <View style={ubicacionStyle.errorRow}>
                    <Text style={{ fontSize: 12 }}>🔴</Text>
                    <Text style={ubicacionStyle.errorText}>{vm.errors.municipio}</Text>
                  </View>
                )}
              </View>

              <View style={ubicacionStyle.divider} />

              {/* Resumen de selección actual */}
              <View style={ubicacionStyle.sectionRow}>
                <Text style={ubicacionStyle.sectionLabel}>TU SELECCIÓN</Text>
                <View style={ubicacionStyle.sectionLine} />
              </View>

              <View style={ubicacionStyle.seleccionCard}>
                <View style={ubicacionStyle.seleccionRow}>
                  <Text style={{ fontSize: 16 }}>🗺️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={ubicacionStyle.seleccionLabel}>Departamento</Text>
                    <Text style={ubicacionStyle.seleccionValue}>{vm.departamento || "—"}</Text>
                  </View>
                  <View style={ubicacionStyle.seleccionBadge}>
                    <Text style={ubicacionStyle.seleccionBadgeText}>Fijo</Text>
                  </View>
                </View>
                <View style={[ubicacionStyle.seleccionRow, { borderTopWidth: 1, borderTopColor: UBIC_COLORS.divider, paddingTop: 8 }]}>
                  <Text style={{ fontSize: 16 }}>📌</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={ubicacionStyle.seleccionLabel}>Municipio</Text>
                    <Text style={[ubicacionStyle.seleccionValue,
                      municipioNoSeleccionado && { color: "#9CA3AF", fontStyle: "italic", fontWeight: "400" }
                    ]}>
                      {municipioNoSeleccionado ? "Sin seleccionar" : vm.municipio}
                    </Text>
                  </View>
                  {!municipioNoSeleccionado && (
                    <View style={ubicacionStyle.seleccionBadge}>
                      <Text style={ubicacionStyle.seleccionBadgeText}>✓ OK</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Botón guardar */}
              <TouchableOpacity
                onPress={vm.abrirConfirmacion}
                style={ubicacionStyle.btnGuardar}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 18 }}>💾</Text>
                <Text style={ubicacionStyle.btnGuardarText}>Guardar Ubicación</Text>
              </TouchableOpacity>

              {/* Badge inferior */}
              <View style={ubicacionStyle.bottomBadge}>
                <Text style={{ fontSize: 16 }}>🛡️</Text>
                <Text style={ubicacionStyle.bottomBadgeText}>Datos protegidos</Text>
              </View>

            </ScrollView>
          </Card>
        </Animated.View>

      </SafeAreaView>

      <ModalConfirmacion
        visible={vm.modalConfirmacionVisible}
        departamento={vm.departamento}
        municipio={vm.municipio}
        onConfirmar={vm.confirmarUbicacion}
        onRegresar={vm.cerrarConfirmacion}
        soloConfirmar={vm.yaConfirmado} // ← nuevo prop
      />
      </LinearGradient>

    </View>
  );
}