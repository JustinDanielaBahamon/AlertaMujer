import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../../components/ui/card/card";
import { useLocale } from "../../../contexts/LocaleContext";
import TutorialLottie from "../component/TutorialLottie";
import { notificationStyle } from "../styles/notificationStyle";
import { TUTORIAL_GRADIENT, TUTORIAL_PALETTE as P } from "../styles/tutorialTheme";
import { useProtectionTutorialViewModel, type ProtectionItem } from "../viewModel/useProtectionTutorialViewModel";

// ─── Tarjeta de un ajuste: estado + botón para activarlo ──────────────────────
function SettingCard({ item, onActivatePress, enterDelay }: { item: ProtectionItem; onActivatePress: () => void; enterDelay: number }) {
  const { t } = useLocale();
  const input = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(input, { toValue: 1, duration: 380, delay: enterDelay, useNativeDriver: true }).start();
  }, []);

  const ready = item.ready === true;
  const unverified = item.ready === null;
  const opensSettings = item.opensSettings || unverified;

  return (
    <Animated.View
      style={{
        opacity: input,
        transform: [{ translateY: input.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
      }}
    >
      <View style={[styles.card, ready ? styles.listCard : styles.pendingCard]}>
        <View style={[styles.accent, { backgroundColor: ready ? P.row2Color : P.row1Border }]} />
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <MaterialIcons name={item.icon as never} size={22} color={P.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
          <View style={[styles.chip, ready && styles.doneChip]}>
            {ready && <MaterialIcons name="check" size={12} color="#FFFFFF" />}
            <Text style={[styles.chipText, ready && styles.doneChipText]}>
              {ready ? t.tutorial.proteccion_activo : unverified ? t.tutorial.proteccion_revisar : t.tutorial.proteccion_falta}
            </Text>
          </View>
        </View>
        {!ready && (
          <TouchableOpacity onPress={onActivatePress} style={styles.button} activeOpacity={0.85} accessibilityRole="button">
            <MaterialIcons name={opensSettings ? "settings" : "check-circle"} size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {opensSettings ? t.tutorial.proteccion_abrir_ajuste : t.tutorial.proteccion_activar}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function ProtectionScreen() {
  const { t } = useLocale();
  const vm = useProtectionTutorialViewModel();
  const percentage = vm.total > 0 ? Math.round((vm.readyItems / vm.total) * 100) : 0;

  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, { toValue: 1, delay: 200, tension: 60, friction: 8, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={notificationStyle.screenBg}>
      <LinearGradient colors={[...TUTORIAL_GRADIENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <View style={[notificationStyle.lottieSection, { height: 160 }]}>
            <TutorialLottie
              source={require("@assets/imagesAlertaMujer/ScTutorial/seguridad.json")}
              resizeMode="contain"
              style={[notificationStyle.lottie, { height: 160 }]}
            />
          </View>

          <Animated.View
            style={{
              flex: 1,
              opacity: cardAnim,
              transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
            }}
          >
            <Card title={`${t.tutorial.proteccion_titulo_1}\n`} titleHighlight={t.tutorial.proteccion_titulo_2}>
              <ScrollView
                style={notificationStyle.cardScroll}
                contentContainerStyle={notificationStyle.cardScrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <Text style={styles.intro}>{t.tutorial.proteccion_intro}</Text>

                <View style={notificationStyle.sectionRow}>
                  <Text style={notificationStyle.sectionLabel}>{t.tutorial.proteccion_seccion}</Text>
                  <View style={notificationStyle.sectionLine} />
                  <Text style={styles.counter}>
                    {vm.readyItems}/{vm.total}
                  </Text>
                </View>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { width: `${percentage}%` as `${number}%` }]} />
                </View>

                {vm.loading && <ActivityIndicator color={P.accent} style={{ marginVertical: 20 }} />}
                {vm.items.map((item, i) => (
                  <SettingCard key={item.id} item={item} onActivatePress={() => vm.activate(item.id)} enterDelay={150 + i * 90} />
                ))}

                <TouchableOpacity onPress={vm.start} style={notificationStyle.finishBtn} activeOpacity={0.85}>
                  <Text style={notificationStyle.finishBtnText}>{t.tutorial.proteccion_empezar}</Text>
                </TouchableOpacity>
                <Text style={styles.note}>{t.tutorial.proteccion_nota}</Text>
              </ScrollView>
            </Card>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, lineHeight: 19, color: "#4B5563", marginBottom: 14 },
  counter: { fontSize: 11, fontWeight: "800", color: P.accent },
  barBackground: { height: 6, borderRadius: 3, backgroundColor: P.sectionLine, marginBottom: 14, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3, backgroundColor: P.row2Color },
  card: {
    borderRadius: 18,
    padding: 13,
    paddingLeft: 17,
    marginBottom: 10,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: P.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  listCard: { backgroundColor: P.row2Light, borderColor: P.row2Border },
  pendingCard: { backgroundColor: "#FFFFFF", borderColor: P.row1Border },
  accent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: P.accent + "18",
    borderWidth: 1.5,
    borderColor: P.accent + "30",
  },
  title: { fontSize: 14, fontWeight: "800", color: P.accentDark },
  desc: { fontSize: 12, lineHeight: 17, color: "#4B5563", marginTop: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: P.accentLight,
    borderWidth: 1,
    borderColor: P.row1Border,
  },
  doneChip: { backgroundColor: P.row2Color, borderColor: P.row2Color },
  chipText: { fontSize: 11, fontWeight: "800", color: P.accent },
  doneChipText: { color: "#FFFFFF" },
  button: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: P.accent,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  note: { fontSize: 11, color: "#6B7280", textAlign: "center", marginTop: 10 },
});
