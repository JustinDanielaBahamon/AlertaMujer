import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
}

export default function SecondaryButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
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
    borderWidth: 1,
    borderColor: "#6a16f1",
  },
  text: {
    color: "#fcf6f6",
    fontWeight: "bold",
    fontSize: 16,
  },
});