import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./modalAlerta.styles";

export type AlertType = "exito" | "error" | "aviso";

interface AlertModalProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttonTextValue: string;
  onClose: () => void;
}

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

// Icono y colores según el tipo de mensaje
const CONFIG: Record<
  AlertType,
  { icon: IconName; color: string; background: string }
> = {
  exito: { icon: "check", color: "#6B3FA0", background: "#F3E8FF" },
  error: { icon: "close", color: "#D32F2F", background: "#FDECEC" },
  aviso: { icon: "priority-high", color: "#BC27BE", background: "#FBE9FB" },
};

export default function AlertModal({
  visible,
  type,
  title,
  message,
  buttonTextValue,
  onClose,
}: AlertModalProps) {
  const cfg = CONFIG[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icono dentro de un círculo */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: cfg.background, borderColor: cfg.color },
            ]}
          >
            <MaterialIcons name={cfg.icon} size={42} color={cfg.color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{buttonTextValue}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
