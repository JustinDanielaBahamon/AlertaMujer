import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from "../../../features/tutorial/styles/universalStyle";

interface Props {
  title?: string;
  titleHighlight?: string;
  children?: React.ReactNode;
  style?: any;
  // ← optional: custom colors per screen
  gradientColors?: readonly [string, string, ...string[]];
}

export default function CardBase({
  title,
  titleHighlight,
  children,
  style,
  gradientColors = ["#ffffff", "#f8f8f8", "#e3aee7"], // ← default same as welcome
}: Props) {
  return (
    <View style={[localStyles.cardWrapper, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={localStyles.gradient}
      >
        {/* Purple top accent */}
        <View style={localStyles.cardAccent} />

        {/* Title */}
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

        {/* Content */}
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
    // ← no backgroundColor, the gradient replaces it
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