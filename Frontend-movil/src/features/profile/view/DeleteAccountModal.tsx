import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { DELETE_CONFIRMATION } from "../../../services/users.service";

type Props = {
  visible: boolean;
  deleting: boolean;
  error: string | null;
  onConfirm: (confirmation: string) => void;
  onClose: () => void;
};

/** Confirmation to delete the account: explains what is deleted and asks to type ELIMINAR. */
export default function DeleteAccountModal({ visible, deleting, error, onConfirm, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const p = t.perfil;
  const [text, setText] = useState("");
  const ready = text.trim().toUpperCase() === DELETE_CONFIRMATION;
  const accent = theme.icon;

  const close = () => {
    if (deleting) return;
    setText("");
    onClose();
  };

  const whatIsDeleted = [p.eliminar_borra_datos, p.eliminar_borra_contactos, p.eliminar_borra_ubicaciones, p.eliminar_borra_grabaciones];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.background}>
        <View style={[styles.card, { backgroundColor: theme.containerBackground }]}>
          <View style={[styles.icon, { backgroundColor: accent + "22" }]}>
            <Ionicons name="trash-outline" size={28} color={accent} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{p.eliminar_titulo}</Text>
          <Text style={[styles.text, { color: theme.text }]}>{p.eliminar_intro}</Text>

          {whatIsDeleted.map((line) => (
            <View key={line} style={styles.row}>
              <Ionicons name="close-circle-outline" size={16} color={accent} />
              <Text style={[styles.rowText, { color: theme.text }]}>{line}</Text>
            </View>
          ))}
          <Text style={[styles.notice, { color: theme.text }]}>{p.eliminar_irreversible}</Text>

          <Text style={[styles.label, { color: theme.text }]}>
            {p.eliminar_escribe.replace("{palabra}", DELETE_CONFIRMATION)}
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!deleting}
            placeholder={DELETE_CONFIRMATION}
            placeholderTextColor={accent + "60"}
            style={[styles.input, { borderColor: ready ? accent : accent + "50", color: theme.text }]}
          />
          {!!error && <Text style={[styles.error, { color: accent }]}>{error}</Text>}

          <TouchableOpacity
            onPress={() => onConfirm(text)}
            disabled={!ready || deleting}
            style={[styles.button, { backgroundColor: accent }, (!ready || deleting) && { opacity: 0.4 }]}
            accessibilityRole="button"
          >
            {deleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{p.eliminar_confirmar}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={close} style={styles.cancel} disabled={deleting}>
            <Text style={[styles.cancelText, { color: accent }]}>{t.modal.cancelar}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  card: { borderRadius: 22, padding: 20 },
  icon: { alignSelf: "center", width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", textAlign: "center", marginTop: 12 },
  text: { fontSize: 13, lineHeight: 19, opacity: 0.8, textAlign: "center", marginTop: 6, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  rowText: { flex: 1, fontSize: 13 },
  notice: { fontSize: 12, fontWeight: "700", marginTop: 8, opacity: 0.85 },
  label: { fontSize: 13, fontWeight: "600", marginTop: 14 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6, fontSize: 15, fontWeight: "700", letterSpacing: 1 },
  error: { fontSize: 12, fontWeight: "600", marginTop: 8 },
  button: { marginTop: 16, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  cancel: { alignItems: "center", paddingVertical: 12 },
  cancelText: { fontSize: 14, fontWeight: "700" },
});
