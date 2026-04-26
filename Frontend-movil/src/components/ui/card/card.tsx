import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from "../../../../features/tutorial/universalStyle";

interface Props {
  title?: string;
  titleHighlight?: string;
  children?: React.ReactNode;
  style?: any;
  // ← opcional: colores personalizados por pantalla
  gradientColors?: readonly [string, string, ...string[]];
}

export default function CardBase({
  title,
  titleHighlight,
  children,
  style,
  gradientColors = ["#edfaf8", "#f8f8f8", "#f3e2fa"], // ← default igual que bienvenida
}: Props) {
  return (
    <View style={[localStyles.cardWrapper, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={localStyles.gradient}
      >
        {/* Acento superior morado */}
        <View style={localStyles.cardAccent} />

        {/* Título */}
        {title && (
          <Text style={localStyles.cardTitle}>
            {title}
            {titleHighlight && (
              <Text style={localStyles.cardTitleHighlight}>{titleHighlight}</Text>
            )}
          </Text>
        )}

        {/* Divisor */}
        {title && <View style={localStyles.divider} />}

        {/* Contenido */}
        {children}
      </LinearGradient>
    </View>
  );
}

const localStyles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 14,
    marginTop: 24,
    marginBottom: 20,
    flex: 1,
    borderRadius: 28,
    shadowColor: COLORS.purpleDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.purpleLight,
    overflow: 'hidden',
    // ← sin backgroundColor, el gradiente lo reemplaza
  },
  gradient: {
    flex: 1,
    borderRadius: 28,
    padding: 24,
  },
  cardAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 5,
    backgroundColor: COLORS.purpleMain,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textTitle,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: 8,
    marginBottom: 16,
  },
  cardTitleHighlight: {
    color: COLORS.purpleMain,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.purpleLight,
    marginBottom: 20,
  },
});