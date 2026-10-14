import React from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { IMAGENES_PRECARGA } from "../../../contexts/ThemeContext";

// Monta todas las imágenes de los temas fuera de la vista para que queden
// decodificadas en memoria. Así, al cambiar de color aparecen al instante.
export default function PrecargaImagenes() {
  const { width } = useWindowDimensions();
  const tam = Math.round(width * 0.68 * 1.1); // mismo tamaño que el botón de Inicio

  return (
    <View pointerEvents="none" style={estilos.oculto}>
      {IMAGENES_PRECARGA.map((fuente, i) => (
        <Image
          key={i}
          source={fuente}
          fadeDuration={0}
          resizeMode="contain"
          style={{ width: tam, height: tam }}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  oculto: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0.01,
    overflow: "hidden",
  },
});