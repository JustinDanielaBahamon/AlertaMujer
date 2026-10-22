import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  // We add these two options
  bgColor?: string; 
  textColor?: string;
 
}

export default function SecondaryButton({ title, onPress, bgColor = "#ffffff", textColor = "#000000" }: Props) {
  return (
    <TouchableOpacity 
      // We combine the base style with the chosen color
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
    // The fixed color is removed here so the prop wins
  },

  text: {
    
    fontWeight: "bold",
    fontSize: 16,
  },
});