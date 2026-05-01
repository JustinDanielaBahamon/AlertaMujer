import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, Text, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../../src/components/ui/card/card";
import { BUTTON_COLORS, buttonStyle } from "./buttonStyle";
import { useButtonTutorialViewModel, type TapOption, } from "./useButtonTutorialViewModel";
import { LinearGradient } from 'expo-linear-gradient';

// ─── Decorative background circles ───────────────────────────────────────────
function BackgroundCircles() {
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeFloat = (anim: Animated.Value, duration: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -12, duration, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      );
    makeFloat(floatAnim1, 3200, 0).start();
    makeFloat(floatAnim2, 2800, 600).start();
    makeFloat(floatAnim3, 3600, 1200).start();
  }, []);

  return (
    <>
      <Animated.View style={[buttonStyle.bgCircleBase,
        { width: 200, height: 200, borderRadius: 100, backgroundColor: BUTTON_COLORS.circle1,
          opacity: 0.09, top: -55, right: -60, transform: [{ translateY: floatAnim1 }] }]} />
      <Animated.View style={[buttonStyle.bgCircleBase,
        { width: 130, height: 130, borderRadius: 65, backgroundColor: BUTTON_COLORS.circle2,
          opacity: 0.10, top: 50, left: -40, transform: [{ translateY: floatAnim2 }] }]} />
      <Animated.View style={[buttonStyle.bgCircleBase,
        { width: 90, height: 90, borderRadius: 45, backgroundColor: BUTTON_COLORS.circle3,
          opacity: 0.09, top: 160, right: 10, transform: [{ translateY: floatAnim3 }] }]} />
      <Animated.View style={[buttonStyle.bgCircleBase,
        { width: 55, height: 55, borderRadius: 28, backgroundColor: BUTTON_COLORS.circle4,
          opacity: 0.13, top: 100, left: "44%", transform: [{ translateY: floatAnim1 }] }]} />
      <Animated.View style={[buttonStyle.bgCircleBase,
        { width: 70, height: 70, borderRadius: 35, backgroundColor: BUTTON_COLORS.circle3,
          opacity: 0.08, top: 220, left: 20, transform: [{ translateY: floatAnim2 }] }]} />
      <Animated.View style={[buttonStyle.bgRingBase,
        { width: 100, height: 100, borderRadius: 50, borderColor: BUTTON_COLORS.circle1,
          opacity: 0.10, top: 30, right: 30, transform: [{ translateY: floatAnim3 }] }]} />
    </>
  );
}

// ─── Animated interactive row ─────────────────────────────────────────────────
function TapRow({ item, isActive, onPress, enterDelay }: {
  item: TapOption;
  isActive: boolean;
  onPress: () => void;
  enterDelay: number;
}) {
  const slideAnim   = useRef(new Animated.Value(28)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const borderAnim  = useRef(new Animated.Value(0)).current;
  const glowAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: 0, duration: 380, delay: enterDelay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 380, delay: enterDelay, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(borderAnim, { toValue: isActive ? 1 : 0, duration: 220, useNativeDriver: false }),
      Animated.timing(glowAnim,   { toValue: isActive ? 1 : 0, duration: 260, useNativeDriver: false }),
    ]).start();
  }, [isActive]);

  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30 }).start();

  const animatedBorderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [item.colorBorder, item.color] });
  const animatedShadow      = glowAnim.interpolate({   inputRange: [0, 1], outputRange: [2, 8] });

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}: ${item.desc}`}
      >
        <Animated.View style={[buttonStyle.tapRow, {
          backgroundColor: isActive ? item.colorLight : "#ffffff",
          borderColor: animatedBorderColor,
          borderWidth: isActive ? 2 : 1.5,
          shadowColor: item.color,
          shadowOpacity: isActive ? 0.18 : 0.05,
          shadowRadius: animatedShadow,
          elevation: isActive ? 5 : 2,
        }]}>
          {isActive && <View style={[buttonStyle.tapRowAccent, { backgroundColor: item.color }]} />}

          <View style={[buttonStyle.rowIconWrap, {
            backgroundColor: isActive ? item.color + "25" : item.color + "14",
            borderWidth: isActive ? 1.5 : 0,
            borderColor: item.color + "40",
          }]}>
            <Text style={buttonStyle.rowIcon}>{item.emoji}</Text>
          </View>

          <View style={buttonStyle.rowTextContainer}>
            <Text style={[buttonStyle.rowTitle, isActive && { color: item.color }]}>{item.title}</Text>
            <Text style={buttonStyle.rowDesc}>{item.desc}</Text>
          </View>

          <View style={[buttonStyle.badge, { backgroundColor: isActive ? item.color + "20" : item.color + "12" }]}>
            <Text style={[buttonStyle.badgeText, { color: item.color }]}>{item.badge}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Animated SOS button ──────────────────────────────────────────────────────
function SOSButton({ onTap }: { onTap: (msg: string) => void }) {
  const scaleAnim    = useRef(new Animated.Value(1)).current;
  const ring1Anim    = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.5)).current;
  const ring2Anim    = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const makePulse = (scale: Animated.Value, opacity: Animated.Value, initOpacity: number, delay = 0) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.6, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 1200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1,           duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: initOpacity,  duration: 0, useNativeDriver: true }),
        ]),
      ]));
    const loop1 = makePulse(ring1Anim, ring1Opacity, 0.5);
    const loop2 = makePulse(ring2Anim, ring2Opacity, 0.3, 500);
    loop1.start();
    loop2.start();
    return () => { loop1.stop(); loop2.stop(); };
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.86, duration: 90, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 16 }),
    ]).start();
    onTap("🚨 Botón SOS activado");
  };

  return (
    <View style={buttonStyle.sosWrapper}>
      <Animated.View style={[buttonStyle.sosRing, { transform: [{ scale: ring2Anim }], opacity: ring2Opacity }]} />
      <Animated.View style={[buttonStyle.sosRing, { transform: [{ scale: ring1Anim }], opacity: ring1Opacity }]} />
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <Animated.View style={[buttonStyle.sosBtn, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={buttonStyle.sosBtnText}>SOS</Text>
          <Text style={buttonStyle.sosBtnSub}>Toca aquí</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ActivationTutorial() {
  const {
    activeRow,
    feedback,
    cardAnimStyle,
    feedbackOpacity,
    tapOptions,
    handleTapRow,
    handleSOSTap,
  } = useButtonTutorialViewModel();

  return (
    <View style={buttonStyle.screenBg}>

      <LinearGradient
        colors={["#f3afed", "#fff7f7", "#b026bd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <BackgroundCircles />

        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

          {/* Lottie animation */}
          <View style={buttonStyle.lottieSection}>
            <LottieView
              source={require("../../../assets/imagesAlertaMujer/ScTutorial/Alerta.json")}
              autoPlay
              loop
              resizeMode="contain"
              style={buttonStyle.lottie}
            />
          </View>

          {/* Animated card */}
          <Animated.View style={[{ flex: 1 }, cardAnimStyle]}>
            <Card title={`Cómo funciona el\n`} titleHighlight="botón">
              <ScrollView
                style={buttonStyle.cardScroll}
                contentContainerStyle={buttonStyle.cardScrollContent}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
              >
                {/* Gestures section */}
                <View style={buttonStyle.sectionRow}>
                  <Text style={buttonStyle.sectionLabel}>GESTOS DISPONIBLES</Text>
                  <View style={buttonStyle.sectionLine} />
                </View>

                {tapOptions.map((item, index) => (
                  <TapRow
                    key={item.id!}
                    item={item}
                    isActive={activeRow === item.id}
                    onPress={() => handleTapRow(item.id)}
                    enterDelay={200 + index * 110}
                  />
                ))}

                <View style={buttonStyle.divider} />

                {/* Descriptive detail */}
                <View style={{ gap: 4 }}>
                  {tapOptions.map((item) => (
                    <View key={`desc-${item.id}`} style={buttonStyle.descRow}>
                      <View style={[buttonStyle.descDot, { backgroundColor: item.color }]} />
                      <View style={buttonStyle.descTextWrap}>
                        <Text>
                          <Text style={[buttonStyle.descHighlight, { color: item.color }]}>{item.highlightLabel}</Text>
                          <Text style={buttonStyle.descBold}>{item.boldLabel} </Text>
                          <Text style={buttonStyle.descNormal}>{item.detailDesc}</Text>
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={buttonStyle.divider} />

                {/* Demo section */}
                <View style={buttonStyle.sectionRow}>
                  <Text style={buttonStyle.sectionLabel}>PRUEBA EL BOTÓN</Text>
                  <View style={buttonStyle.sectionLine} />
                </View>

                <View style={buttonStyle.demoContainer}>
                  <Text style={buttonStyle.demoHint}>Toca el botón para ver cómo funciona</Text>
                  <SOSButton onTap={handleSOSTap} />
                  <Animated.View style={[buttonStyle.feedbackPill, { opacity: feedbackOpacity }]}>
                    <Text style={buttonStyle.feedbackText}>{feedback}</Text>
                  </Animated.View>
                </View>

                {/* Bottom badge */}
                <View style={buttonStyle.bottomBadge}>
                  <Text style={{ fontSize: 16 }}>🚨</Text>
                  <Text style={buttonStyle.bottomBadgeText}>Alerta en segundos</Text>
                </View>

              </ScrollView>
            </Card>
          </Animated.View>

        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}