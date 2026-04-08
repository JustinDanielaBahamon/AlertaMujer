import React from "react";
import { View, Text,  } from "react-native";
import {styles} from "./cardStyle";

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

