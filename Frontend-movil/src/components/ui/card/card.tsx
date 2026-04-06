import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  style?: any;
}

export default function CardBase({ title, description, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      
      {title && <Text style={styles.title}>{title}</Text>}
      {description && <Text style={styles.description}>{description}</Text>}

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
    elevation: 5,

    alignSelf: "center", // 🔥 se centra sola
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#555",
    flexWrap: "wrap",   // 🔥 permite que el texto baje de línea
    lineHeight: 20,     // 🔥 mejora lectura
  },
});