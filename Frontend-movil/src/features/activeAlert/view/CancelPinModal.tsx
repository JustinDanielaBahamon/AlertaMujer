import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme, type AppTheme } from "../../../contexts/ThemeContext";
import { PIN_LENGTH_MAX } from "../../security/cancelPin";

type Props = {
  visible: boolean;
  error: string | null;
  onSubmit: (pin: string) => void;
  onClose: () => void;
  // Other uses (stopping the automatic protection) change the texts; the alert ones by default
  title?: string;
  description?: string;
  confirmLabel?: string;
};

/**
 * PIN to cancel an alert. It looks the same for the normal PIN and the duress PIN: whoever forces her
 * cannot tell which one she typed.
 */
export default function CancelPinModal({ visible, error, onSubmit, onClose, title, description, confirmLabel }: Props) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const s = useMemo(() => createStyles(theme), [theme]);
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (visible) setPin("");
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <MaterialIcons name="lock" size={30} color={theme.icon} />
          <Text style={s.title}>{title ?? t.alertaActiva.pin_titulo}</Text>
          <Text style={s.text}>{description ?? t.alertaActiva.pin_descripcion}</Text>
          <TextInput
            value={pin}
            onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, PIN_LENGTH_MAX))}
            keyboardType="number-pad"
            secureTextEntry
            autoFocus
            maxLength={PIN_LENGTH_MAX}
            style={s.input}
            accessibilityLabel={title ?? t.alertaActiva.pin_titulo}
          />
          {!!error && <Text style={s.error}>{error}</Text>}
          <TouchableOpacity
            style={[s.primary, pin.length < 4 && s.disabled]}
            disabled={pin.length < 4}
            onPress={() => onSubmit(pin)}
          >
            <Text style={s.primaryText}>{confirmLabel ?? t.alertaActiva.pin_confirmar}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondary} onPress={onClose}>
            <Text style={[s.secondaryText, { color: theme.icon }]}>{t.alertaActiva.pin_volver}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(20,0,40,0.55)", justifyContent: "center", padding: 24 },
    card: { backgroundColor: theme.card, borderRadius: 22, padding: 22, alignItems: "center", gap: 10 },
    title: { fontSize: 18, fontWeight: "800", color: theme.text, textAlign: "center" },
    text: { fontSize: 13, color: theme.contactSubtext, textAlign: "center" },
    input: {
      alignSelf: "stretch",
      borderWidth: 1.5,
      borderColor: theme.icon,
      borderRadius: 14,
      paddingVertical: 10,
      fontSize: 24,
      letterSpacing: 10,
      textAlign: "center",
      color: theme.text,
    },
    error: { fontSize: 13, fontWeight: "700", color: "#A21CAF", textAlign: "center" },
    primary: { alignSelf: "stretch", backgroundColor: theme.icon, borderRadius: 16, paddingVertical: 13, alignItems: "center" },
    disabled: { opacity: 0.5 },
    primaryText: { color: "#fff", fontSize: 15, fontWeight: "800" },
    secondary: { paddingVertical: 8 },
    secondaryText: { fontSize: 14, fontWeight: "700" },
  });
