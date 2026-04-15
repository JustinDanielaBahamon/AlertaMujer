import React from "react";
import { View, Text } from "react-native";
import { styles } from "./cardStyle";

interface Props {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  style?: any;
}

export default function CardBase({ title, description, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {/* Título por fuera del contenedor oscuro para que resalte */}
      {title && <Text style={styles.title}>{title}</Text>}

      {/* Contenedor oscuro interno */}
      <View style={styles.innerContainer}>
        {description && <Text style={styles.description}>{description}</Text>}
        {children}
      </View>
    </View>
  );
}