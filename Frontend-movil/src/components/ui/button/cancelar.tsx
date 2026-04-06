import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  // Añadimos estas dos opciones
  bgColor?: string; 
  textColor?: string;
 
}

export default function SecondaryButton({ title, onPress, bgColor = "#ffffff", textColor = "#000000" }: Props) {
  return (
    <TouchableOpacity 
      // Combinamos el estilo base con el color que elijamos
      style={[styles.button, { backgroundColor: bgColor }]} 
      onPress={onPress}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "90%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ffffff",
    // Quitamos el color fijo de aquí para que mande la prop
  },

  text: {
    
    fontWeight: "bold",
    fontSize: 16,
  },
});