import React from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { PRELOAD_IMAGES } from "../../../contexts/ThemeContext";

// Mounts every theme image off screen so they stay
// decoded in memory. That way they appear instantly when the color changes.
export default function ImagePreload() {
  const { width } = useWindowDimensions();
  const tam = Math.round(width * 0.68 * 1.1); // same size as the Home button

  return (
    <View pointerEvents="none" style={styles.hidden}>
      {PRELOAD_IMAGES.map((source, i) => (
        <Image
          key={i}
          source={source}
          fadeDuration={0}
          resizeMode="contain"
          style={{ width: tam, height: tam }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0.01,
    overflow: "hidden",
  },
});