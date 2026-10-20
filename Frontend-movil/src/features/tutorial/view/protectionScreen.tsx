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
import { useProtectionTutorialViewModel, type ProteccionItem } from "../viewModel/useProtectionTutorialViewModel";

// ─── Tarjeta de un ajuste: estado + botón para activarlo ──────────────────────
function TarjetaAjuste({ item, onActivar, enterDelay }: { item: ProteccionItem; onActivar: () => void; enterDelay: number }) {
  const { t } = useLocale();
  const entrada = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entrada, { toValue: 1, duration: 380, delay: enterDelay, useNativeDriver: true }).start();
  }, []);

  const listo = item.listo === true;
  const sinVerificar = item.listo === null;
  const abreAjustes = item.abreAjustes || sinVerificar;

  return (
    <Animated.View
      style={{
        opacity: entrada,
        transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
      }}
    >
      <View style={[estilos.tarjeta, listo ? estilos.tarjetaLista : estilos.tarjetaPendiente]}>
        <View style={[estilos.acento, { backgroundColor: listo ? P.row2Color : P.row1Border }]} />
        <View style={estilos.fila}>
          <View style={estilos.iconoWrap}>
            <MaterialIcons name={item.icono as never} size={22} color={P.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.titulo}>{item.titulo}</Text>
            <Text style={estilos.desc}>{item.desc}</Text>
          </View>
          <View style={[estilos.chip, listo && estilos.chipListo]}>
            {listo && <MaterialIcons name="check" size={12} color="#FFFFFF" />}
            <Text style={[estilos.chipTexto, listo && estilos.chipTextoListo]}>
              {listo ? t.tutorial.proteccion_activo : sinVerificar ? t.tutorial.proteccion_revisar : t.tutorial.proteccion_falta}
            </Text>
          </View>
        </View>
        {!listo && (
          <TouchableOpacity onPress={onActivar} style={estilos.boton} activeOpacity={0.85} accessibilityRole="button">
            <MaterialIcons name={abreAjustes ? "settings" : "check-circle"} size={16} color="#FFFFFF" />
            <Text style={estilos.botonTexto}>
              {abreAjustes ? t.tutorial.proteccion_abrir_ajuste : t.tutorial.proteccion_activar}
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
  const porcentaje = vm.total > 0 ? Math.round((vm.listos / vm.total) * 100) : 0;

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
                <Text style={estilos.intro}>{t.tutorial.proteccion_intro}</Text>

                <View style={notificationStyle.sectionRow}>
                  <Text style={notificationStyle.sectionLabel}>{t.tutorial.proteccion_seccion}</Text>
                  <View style={notificationStyle.sectionLine} />
                  <Text style={estilos.contador}>
                    {vm.listos}/{vm.total}
                  </Text>
                </View>
                <View style={estilos.barraFondo}>
                  <View style={[estilos.barraRelleno, { width: `${porcentaje}%` as `${number}%` }]} />
                </View>

                {vm.cargando && <ActivityIndicator color={P.accent} style={{ marginVertical: 20 }} />}
                {vm.items.map((item, i) => (
                  <TarjetaAjuste key={item.id} item={item} onActivar={() => vm.activar(item.id)} enterDelay={150 + i * 90} />
                ))}

                <TouchableOpacity onPress={vm.empezar} style={notificationStyle.btnFinalizar} activeOpacity={0.85}>
                  <Text style={notificationStyle.btnFinalizarText}>{t.tutorial.proteccion_empezar}</Text>
                </TouchableOpacity>
                <Text style={estilos.nota}>{t.tutorial.proteccion_nota}</Text>
              </ScrollView>
            </Card>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const estilos = StyleSheet.create({
  intro: { fontSize: 13, lineHeight: 19, color: "#4B5563", marginBottom: 14 },
  contador: { fontSize: 11, fontWeight: "800", color: P.accent },
  barraFondo: { height: 6, borderRadius: 3, backgroundColor: P.sectionLine, marginBottom: 14, overflow: "hidden" },
  barraRelleno: { height: 6, borderRadius: 3, backgroundColor: P.row2Color },
  tarjeta: {
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
  tarjetaLista: { backgroundColor: P.row2Light, borderColor: P.row2Border },
  tarjetaPendiente: { backgroundColor: "#FFFFFF", borderColor: P.row1Border },
  acento: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconoWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: P.accent + "18",
    borderWidth: 1.5,
    borderColor: P.accent + "30",
  },
  titulo: { fontSize: 14, fontWeight: "800", color: P.accentDark },
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
  chipListo: { backgroundColor: P.row2Color, borderColor: P.row2Color },
  chipTexto: { fontSize: 11, fontWeight: "800", color: P.accent },
  chipTextoListo: { color: "#FFFFFF" },
  boton: {
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
  botonTexto: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  nota: { fontSize: 11, color: "#6B7280", textAlign: "center", marginTop: 10 },
});
