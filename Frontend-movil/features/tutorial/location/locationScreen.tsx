import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import Card from "../../../src/components/ui/card/card";
import ModalConfirmacion from "@/src/components/ui/modalConfirmacion/confirmacion";
import { useLocationTutorialViewModel, PLACEHOLDER_MUNICIPALITY } from "./useLocationTutorialViewModel";
import { locationStyle, UBIC_COLORS } from "./locationStyle";
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
      <Animated.View style={[locationStyle.bgCircleBase,
        { width: 200, height: 200, borderRadius: 100, backgroundColor: UBIC_COLORS.circle1,
          opacity: 0.08, top: -55, right: -60, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[locationStyle.bgCircleBase,
        { width: 130, height: 130, borderRadius: 65, backgroundColor: UBIC_COLORS.circle2,
          opacity: 0.09, top: 50, left: -40, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[locationStyle.bgCircleBase,
        { width: 90, height: 90, borderRadius: 45, backgroundColor: UBIC_COLORS.circle3,
          opacity: 0.08, top: 170, right: 10, transform: [{ translateY: f3 }] }]} />
      <Animated.View style={[locationStyle.bgCircleBase,
        { width: 55, height: 55, borderRadius: 28, backgroundColor: UBIC_COLORS.circle4,
          opacity: 0.12, top: 110, left: "44%" as any, transform: [{ translateY: f1 }] }]} />
      <Animated.View style={[locationStyle.bgCircleBase,
        { width: 70, height: 70, borderRadius: 35, backgroundColor: UBIC_COLORS.circle2,
          opacity: 0.07, top: 230, left: 20, transform: [{ translateY: f2 }] }]} />
      <Animated.View style={[locationStyle.bgRingBase,
        { width: 100, height: 100, borderRadius: 50, borderColor: UBIC_COLORS.circle1,
          opacity: 0.10, top: 30, right: 30, transform: [{ translateY: f3 }] }]} />
    </>
  );
}

// ─── Propiedades ─────────────────────────────────────────────────────────────
interface LocationScreenProps {
  externalVm?: ReturnType<typeof useLocationTutorialViewModel>;
}

// ─── Pantalla principal ───────────────────────────────────────────────────────────────
export default function LocationScreen({ externalVm }: LocationScreenProps) {
  const internalVM = useLocationTutorialViewModel();
  const vm = externalVm ?? internalVM;

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

    // ── Animación  ─────────────────────────────────
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

   // Activar vibración cuando aparezca el banner de validación
  useEffect(() => {
    if (vm.showValidationBanner) triggerShake();
  }, [vm.showValidationBanner]);

  const municipalityNotSelected =
    !vm.municipality || vm.municipality === PLACEHOLDER_MUNICIPALITY;

  return (
    <View style={locationStyle.screenBg}>

      <LinearGradient
        colors={["#f3afed", "#FCE7F3", "#b026bd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <BackgroundCircles />

        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

          {/* Lottie animacion  */}
          <View style={locationStyle.lottieSection}>
            <LottieView
              ref={vm.lottieRef}
              source={require("../../../assets/imagesAlertaMujer/ScTutorial/ubicacion.json")}
              autoPlay
              loop
              resizeMode="contain"
              style={locationStyle.lottie}
            />
          </View>

          {/* tarjeta  */}
          <Animated.View style={[{ flex: 1 }, cardAnimStyle]}>
            <Card title={`Tu\n`} titleHighlight="Ubicación">
              <ScrollView
                style={locationStyle.cardScroll}
                contentContainerStyle={locationStyle.cardScrollContent}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
              >
                {/* seleccion de la ubicacion  */}
                <View style={locationStyle.sectionRow}>
                  <Text style={locationStyle.sectionLabel}>CONFIGURA TU UBICACIÓN</Text>
                  <View style={locationStyle.sectionLine} />
                </View>

                {/* Info card */}
                <View style={locationStyle.infoCard}>
                  <View style={locationStyle.infoCardAccent} />
                  <View style={locationStyle.infoIconWrap}>
                    <Text style={locationStyle.infoIcon}>📍</Text>
                  </View>
                  <View style={locationStyle.infoTextContainer}>
                    <Text style={locationStyle.infoTitle}>Ayuda local</Text>
                    <Text style={locationStyle.infoDesc}>
                      Selecciona tu ubicación para que los servicios de emergencia sepan dónde encontrarte.
                    </Text>
                  </View>
                </View>

                {/* Banner de validación con sacudida */}
                {vm.showValidationBanner && (
                  <Animated.View
                    style={[locationStyle.validationBanner,
                      { transform: [{ translateX: shakeAnim }] }]}
                  >
                    <Text style={{ fontSize: 18 }}>⚠️</Text>
                    <Text style={locationStyle.validationBannerText}>
                      Por favor selecciona tu departamento y municipio antes de continuar.
                    </Text>
                  </Animated.View>
                )}

                {/* Selector de departamento */}
                <View style={locationStyle.pickerGroup}>
                  <View style={locationStyle.pickerLabelRow}>
                    <View style={locationStyle.pickerLabelDot} />
                    <Text style={locationStyle.pickerLabel}>DEPARTAMENTO</Text>
                  </View>
                  <View style={[
                    locationStyle.pickerWrap,
                    vm.errors.department ? locationStyle.pickerWrapError : null,
                  ]}>
                    <Picker
                      selectedValue={vm.department}
                      onValueChange={vm.setDepartment}
                      style={locationStyle.picker}
                    >
                      <Picker.Item label="Huila" value="Huila" />
                    </Picker>
                  </View>
                  {vm.errors.department && (
                    <View style={locationStyle.errorRow}>
                      <Text style={{ fontSize: 12 }}>🔴</Text>
                      <Text style={locationStyle.errorText}>{vm.errors.department}</Text>
                    </View>
                  )}
                </View>

                {/* Selector de municipio */}
                <View style={locationStyle.pickerGroup}>
                  <View style={locationStyle.pickerLabelRow}>
                    <View style={locationStyle.pickerLabelDot} />
                    <Text style={locationStyle.pickerLabel}>MUNICIPIO</Text>
                  </View>
                  <View style={[
                    locationStyle.pickerWrap,
                    vm.errors.municipality ? locationStyle.pickerWrapError : null,
                  ]}>
                    <Picker
                      selectedValue={vm.municipality}
                      onValueChange={vm.setMunicipality}
                      style={locationStyle.picker}
                    >
                      {/* Opción de marcador de posición */}
                      <Picker.Item
                        label="Selecciona tu municipio..."
                        value={PLACEHOLDER_MUNICIPALITY}
                        color="#9CA3AF"
                      />
                      {vm.municipalitiesHuila.map((muni) => (
                        <Picker.Item key={muni} label={muni} value={muni} />
                      ))}
                    </Picker>
                  </View>
                  {vm.errors.municipality && (
                    <View style={locationStyle.errorRow}>
                      <Text style={{ fontSize: 12 }}>🔴</Text>
                      <Text style={locationStyle.errorText}>{vm.errors.municipality}</Text>
                    </View>
                  )}
                </View>

                <View style={locationStyle.divider} />

                {/* Resumen de la selección actual */}
                <View style={locationStyle.sectionRow}>
                  <Text style={locationStyle.sectionLabel}>TU SELECCIÓN</Text>
                  <View style={locationStyle.sectionLine} />
                </View>

                <View style={locationStyle.seleccionCard}>
                  <View style={locationStyle.seleccionRow}>
                    <Text style={{ fontSize: 16 }}>🗺️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={locationStyle.seleccionLabel}>Departamento</Text>
                      <Text style={locationStyle.seleccionValue}>{vm.department || "—"}</Text>
                    </View>
                    <View style={locationStyle.seleccionBadge}>
                      <Text style={locationStyle.seleccionBadgeText}>Fijo</Text>
                    </View>
                  </View>
                  <View style={[locationStyle.seleccionRow, { borderTopWidth: 1, borderTopColor: UBIC_COLORS.divider, paddingTop: 8 }]}>
                    <Text style={{ fontSize: 16 }}>📌</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={locationStyle.seleccionLabel}>Municipio</Text>
                      <Text style={[locationStyle.seleccionValue,
                        municipalityNotSelected && { color: "#9CA3AF", fontStyle: "italic", fontWeight: "400" }
                      ]}>
                        {municipalityNotSelected ? "Sin seleccionar" : vm.municipality}
                      </Text>
                    </View>
                    {!municipalityNotSelected && (
                      <View style={locationStyle.seleccionBadge}>
                        <Text style={locationStyle.seleccionBadgeText}>✓ OK</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* boton de guardar */}
                <TouchableOpacity
                  onPress={vm.openConfirmation}
                  style={locationStyle.btnGuardar}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontSize: 18 }}>💾</Text>
                  <Text style={locationStyle.btnGuardarText}>Guardar Ubicación</Text>
                </TouchableOpacity>

                {/* Insignia inferior */}
                <View style={locationStyle.bottomBadge}>
                  <Text style={{ fontSize: 16 }}>🛡️</Text>
                  <Text style={locationStyle.bottomBadgeText}>Datos protegidos</Text>
                </View>

              </ScrollView>
            </Card>
          </Animated.View>

        </SafeAreaView>

        <ModalConfirmacion
            visible={vm.confirmationModalVisible}
            departamento={vm.department}
            municipio={vm.municipality}
            onConfirmar={vm.confirmLocation}
            onRegresar={vm.closeConfirmation}
            soloConfirmar={vm.alreadyConfirmed}
        />
      </LinearGradient>

    </View>
  );
}