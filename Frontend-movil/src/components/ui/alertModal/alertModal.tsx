import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./alertModal.styles";
import { useDialogColors } from "../dialogColors";

export type AlertType = "success" | "error" | "warning";

interface AlertModalProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttonTextValue: string;
  onClose: () => void;
}

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

// Icon and colors by message type
const CONFIG: Record<
  AlertType,
  { icon: IconName; color: string; background: string }
> = {
  success: { icon: "check", color: "#6B3FA0", background: "#F3E8FF" },
  error: { icon: "close", color: "#D32F2F", background: "#FDECEC" },
  warning: { icon: "priority-high", color: "#BC27BE", background: "#FBE9FB" },
};

export default function AlertModal({
  visible,
  type,
  title,
  message,
  buttonTextValue,
  onClose,
}: AlertModalProps) {
  const dialog = useDialogColors();
  const cfg = CONFIG[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, dialog.card]}>
          {/* Icon inside a circle */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: cfg.background, borderColor: cfg.color },
            ]}
          >
            <MaterialIcons name={cfg.icon} size={42} color={cfg.color} />
          </View>

          <Text style={[styles.title, dialog.title]}>{title}</Text>
          <Text style={[styles.message, dialog.text]}>{message}</Text>

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
