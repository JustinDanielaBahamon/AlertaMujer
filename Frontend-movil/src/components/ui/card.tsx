import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function CardBase({ title, description, children }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    elevation: 5, // sombra Android
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
});