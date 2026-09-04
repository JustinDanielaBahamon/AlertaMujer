import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import Card from "../../../components/ui/card/card";
import ModalConfirmacion from "@/components/ui/modalConfirmacion/confirmacion";
import { useLocationTutorialViewModel, PLACEHOLDER_MUNICIPALITY } from "../viewModel/useLocationTutorialViewModel";
import { locationStyle, UBIC_COLORS } from "../styles/locationStyle";
import { useLocale } from "../../../contexts/LocaleContext";

interface LocationScreenProps {
  externalVm?: ReturnType<typeof useLocationTutorialViewModel>;
}

export default function LocationScreen({ externalVm }: LocationScreenProps) {
  const { t } = useLocale();
  const internalVM = useLocationTutorialViewModel();
  const vm = externalVm ?? internalVM;

  // ── Animación de entrada de la tarjeta ────────────────────────────────────
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

  // ── Animación de sacudida en error ────────────────────────────────────────
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (vm.showValidationBanner) triggerShake();
  }, [vm.showValidationBanner]);

  const municipalityNotSelected =
    !vm.municipality || vm.municipality === PLACEHOLDER_MUNICIPALITY;

  return (
    <View style={locationStyle.screenBg}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

        {/* Lottie */}
        <View style={locationStyle.lottieSection}>
          <LottieView
            ref={vm.lottieRef}
            source={require("@assets/imagesAlertaMujer/ScTutorial/ubicacion.json")}
            autoPlay
            loop
            resizeMode="contain"
            style={locationStyle.lottie}
          />
        </View>

        {/* Tarjeta */}
        <Animated.View style={[{ flex: 1 }, cardAnimStyle]}>
          <Card title={`${t.tutorial.ubicacion_titulo_1}\n`} titleHighlight={t.tutorial.ubicacion_titulo_2}>
            <ScrollView
              style={locationStyle.cardScroll}
              contentContainerStyle={locationStyle.cardScrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {/* Ícono circular + info card */}
              <View style={locationStyle.headerIconWrap}>
                <MaterialIcons name="map" size={28} color={UBIC_COLORS.accent} />
              </View>

              <View style={locationStyle.infoCard}>
                <MaterialIcons name="info-outline" size={20} color={UBIC_COLORS.accent} />
                <Text style={locationStyle.infoDesc}>
                  {t.tutorial.ubicacion_ayuda_desc}
                </Text>
              </View>

              {/* Banner de validación */}
              {vm.showValidationBanner && (
                <Animated.View
                  style={[locationStyle.validationBanner, { transform: [{ translateX: shakeAnim }] }]}
                >
                  <MaterialIcons name="warning-amber" size={18} color={UBIC_COLORS.warningText} />
                  <Text style={locationStyle.validationBannerText}>
                    {t.tutorial.ubicacion_validacion_banner}
                  </Text>
                </Animated.View>
              )}

              {/* Departamento — fijo, ya NO es un selector interactivo */}
              <View style={locationStyle.fieldLabelRow}>
                <View style={locationStyle.fieldLabelDot} />
                <Text style={locationStyle.fieldLabel}>
                  {t.tutorial.ubicacion_departamento_label.toUpperCase()}
                </Text>
              </View>
              <View style={locationStyle.fixedField}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <MaterialIcons name="place" size={16} color={UBIC_COLORS.accent} />
                  <Text style={locationStyle.fixedFieldValue}>{vm.department}</Text>
                </View>
                <Text style={locationStyle.fixedBadge}>{t.tutorial.ubicacion_fijo_badge}</Text>
              </View>

              {/* Municipio — sigue siendo el único selector real */}
              <View style={locationStyle.fieldLabelRow}>
                <View style={locationStyle.fieldLabelDot} />
                <Text style={locationStyle.fieldLabel}>
                  {t.tutorial.ubicacion_municipio_label.toUpperCase()}
                </Text>
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
                  <Picker.Item
                    label={t.tutorial.ubicacion_municipio_placeholder}
                    value={PLACEHOLDER_MUNICIPALITY}
                    color={UBIC_COLORS.placeholder}
                  />
                  {vm.municipalitiesHuila.map((muni) => (
                    <Picker.Item key={muni} label={muni} value={muni} />
                  ))}
                </Picker>
              </View>
              {vm.errors.municipality && (
                <View style={locationStyle.errorRow}>
                  <MaterialIcons name="error-outline" size={13} color={UBIC_COLORS.errorColor} />
                  <Text style={locationStyle.errorText}>{vm.errors.municipality}</Text>
                </View>
              )}

              <View style={locationStyle.divider} />

              {/* Resumen de selección */}
              <View style={locationStyle.fieldLabelRow}>
                <View style={locationStyle.fieldLabelDot} />
                <Text style={locationStyle.fieldLabel}>
                  {t.tutorial.ubicacion_seleccion_titulo.toUpperCase()}
                </Text>
              </View>

              <View style={locationStyle.seleccionCard}>
                <View style={locationStyle.seleccionRow}>
                  <MaterialIcons name="map" size={16} color={UBIC_COLORS.accent} />
                  <Text style={locationStyle.seleccionLabel}>
                    {t.tutorial.ubicacion_departamento_texto}
                  </Text>
                  <Text style={locationStyle.seleccionValue}>{vm.department}</Text>
                </View>

                <View style={locationStyle.seleccionRowDivider} />

                <View style={locationStyle.seleccionRow}>
                  <MaterialIcons
                    name="place"
                    size={16}
                    color={municipalityNotSelected ? UBIC_COLORS.border : UBIC_COLORS.accent}
                  />
                  <Text style={locationStyle.seleccionLabel}>
                    {t.tutorial.ubicacion_municipio_texto}
                  </Text>
                  <Text style={[
                    locationStyle.seleccionValue,
                    municipalityNotSelected && { color: UBIC_COLORS.placeholder, fontStyle: "italic", fontWeight: "400" },
                  ]}>
                    {municipalityNotSelected ? t.tutorial.ubicacion_sin_seleccionar : vm.municipality}
                  </Text>
                </View>
              </View>

              {/* Botón guardar */}
              <TouchableOpacity
                onPress={vm.openConfirmation}
                style={locationStyle.btnGuardar}
                activeOpacity={0.85}
              >
                <MaterialIcons name="save" size={18} color="#FFFFFF" />
                <Text style={locationStyle.btnGuardarText}>{t.tutorial.ubicacion_guardar_boton}</Text>
              </TouchableOpacity>

              {/* Insignia inferior */}
              <View style={locationStyle.bottomBadge}>
                <MaterialIcons name="verified-user" size={14} color={UBIC_COLORS.accent} />
                <Text style={locationStyle.bottomBadgeText}>{t.tutorial.ubicacion_datos_protegidos}</Text>
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
    </View>
  );
}