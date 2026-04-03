import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  color?: string;
}

export default function PrimaryButton({ title, onPress, color }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color || "#E53935" }]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  
  button: {
    width: "90%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 5,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});