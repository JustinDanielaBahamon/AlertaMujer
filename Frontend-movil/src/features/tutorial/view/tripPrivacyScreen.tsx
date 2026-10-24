import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import TutorialLottie from "../component/TutorialLottie";
import { COLORS, styles as universalStyles } from "../styles/universalStyle";

/**
 * Tutorial step: "Avísame si no llego" and what the app does in the background (location, evidence,
 * alert activation), with the privacy policy one tap away.
 */
export default function TripPrivacyScreen() {
  const { t } = useLocale();
  const tu = t.tutorial;
  const navigation = useNavigation<any>();

  const rows: [string, string, string][] = [
    ["🧭", tu.viaje_titulo, tu.viaje_desc],
    ["📍", tu.segundo_plano_titulo, tu.segundo_plano_desc],
    ["🎥", tu.evidencias_titulo, tu.evidencias_desc],
    ["🚨", tu.activacion_titulo, tu.activacion_desc],
  ];

  return (
    <View style={local.page}>
      <View style={local.lottieSection}>
        <TutorialLottie
          source={require("@assets/imagesAlertaMujer/ScTutorial/ubicacion.json")}
          resizeMode="contain"
          style={local.lottie}
        />
      </View>
      <View style={[universalStyles.cardLarge, local.card]}>
        <LinearGradient
          colors={["#ffffff", "#f8f8f8", "#e3aee7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={local.gradient}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={universalStyles.cardAccent} />
            <Text style={universalStyles.cardTitle}>
              {tu.privacidad_titulo_1}{"\n"}
              <Text style={universalStyles.cardTitleHighlight}>{tu.privacidad_titulo_2}</Text>
            </Text>
            <View style={universalStyles.divider} />
            {rows.map(([icon, title, desc]) => (
              <View key={title} style={universalStyles.row}>
                <Text style={universalStyles.rowIcon}>{icon}</Text>
                <View style={universalStyles.rowTextContainer}>
                  <Text style={universalStyles.rowTitle}>{title}</Text>
                  <Text style={universalStyles.rowDesc}>{desc}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => navigation.navigate("PrivacyPolicy")}
              style={local.policy}
              accessibilityRole="link"
            >
              <Text style={local.policyText}>{tu.ver_politica}</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  page: { flex: 1, alignItems: "center" },
  lottieSection: { width: "100%", height: 170, alignItems: "center", justifyContent: "center" },
  lottie: { width: "100%", height: 170 },
  card: { padding: 0, overflow: "hidden", flexShrink: 1 },
  gradient: { flex: 1, padding: 22, borderRadius: 28 },
  policy: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 16, marginTop: 6 },
  policyText: { color: COLORS.purpleDark, fontSize: 14, fontWeight: "800", textDecorationLine: "underline" },
});
