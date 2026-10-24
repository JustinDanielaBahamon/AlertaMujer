import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import ScreenHeader from "../../../components/ui/ScreenHeader/ScreenHeader";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  checkCancelPin,
  hasCancelPin,
  hasDuressPin,
  PIN_LENGTH_MAX,
  removeCancelPins,
  saveCancelPins,
  validPin,
} from "../../security/cancelPin";
import { isDiscreet, setDiscreet } from "../discreetMode";
import { createSettingsScreenStyles } from "../styles/settingsScreen.styles";

const digits = (v: string) => v.replace(/\D/g, "").slice(0, PIN_LENGTH_MAX);

/**
 * "Seguridad de la alerta": discreet notifications, and the optional PIN to cancel an alert with its
 * duress PIN (it looks like a normal cancel but the alert goes on and her contacts are warned).
 */
export default function AlertSecurityScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const s = t.seguridadAlerta;
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const accent = theme.icon;

  const [discreet, setDiscreetState] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const [hasDuress, setHasDuress] = useState(false);
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState("");
  const [pin, setPin] = useState("");
  const [repeat, setRepeat] = useState("");
  const [duress, setDuress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setDiscreetState(await isDiscreet());
    setHasPin(await hasCancelPin());
    setHasDuress(await hasDuressPin());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleDiscreet = (on: boolean) => {
    setDiscreetState(on);
    void setDiscreet(on);
  };

  const startEditing = () => {
    setCurrent("");
    setPin("");
    setRepeat("");
    setDuress("");
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    setError(null);
    // Changing it asks for the current one: whoever takes her phone cannot replace it
    if (hasPin && (await checkCancelPin(current)) !== "ok") return setError(s.error_actual);
    if (!validPin(pin)) return setError(s.error_largo);
    if (pin !== repeat) return setError(s.error_repetir);
    if (duress && !validPin(duress)) return setError(s.error_largo);
    if (duress && duress === pin) return setError(s.error_igual);
    await saveCancelPins(pin, duress || null);
    setEditing(false);
    await load();
    Alert.alert(s.titulo, s.guardado);
  };

  const remove = async () => {
    if ((await checkCancelPin(current)) !== "ok") return setError(s.error_actual);
    await removeCancelPins();
    setEditing(false);
    await load();
  };

  const field = (value: string, set: (v: string) => void, label: string) => (
    <View style={local.field}>
      <Text style={[local.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(v) => set(digits(v))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={PIN_LENGTH_MAX}
        style={[local.input, { borderColor: accent + "70", color: theme.text }]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title={s.titulo} subtitle={s.subtitulo} icon="lock-closed" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Discreet notifications */}
        <View style={styles.card}>
          <View style={local.row}>
            <Ionicons name="eye-off-outline" size={20} color={accent} />
            <View style={{ flex: 1 }}>
              <Text style={[local.title, { color: theme.text }]}>{s.discreto_titulo}</Text>
              <Text style={[local.desc, { color: theme.text }]}>{s.discreto_desc}</Text>
            </View>
            <Switch value={discreet} onValueChange={toggleDiscreet} trackColor={{ true: accent }} />
          </View>
        </View>

        {/* Cancel PIN and duress PIN */}
        <View style={styles.card}>
          <View style={local.row}>
            <Ionicons name="keypad-outline" size={20} color={accent} />
            <View style={{ flex: 1 }}>
              <Text style={[local.title, { color: theme.text }]}>{s.pin_titulo}</Text>
              <Text style={[local.desc, { color: theme.text }]}>{s.pin_desc}</Text>
              <Text style={[local.state, { color: accent }]}>
                {hasPin ? (hasDuress ? s.estado_con_coaccion : s.estado_con_pin) : s.estado_sin_pin}
              </Text>
            </View>
          </View>

          {!editing ? (
            <TouchableOpacity style={[local.button, { backgroundColor: accent }]} onPress={startEditing}>
              <Text style={local.buttonText}>{hasPin ? s.cambiar : s.crear}</Text>
            </TouchableOpacity>
          ) : (
            <>
              {hasPin && field(current, setCurrent, s.pin_actual)}
              {field(pin, setPin, s.pin_nuevo)}
              {field(repeat, setRepeat, s.pin_repetir)}
              {field(duress, setDuress, s.pin_coaccion)}
              <Text style={[local.desc, { color: theme.text }]}>{s.coaccion_desc}</Text>
              {!!error && <Text style={local.error}>{error}</Text>}
              <TouchableOpacity style={[local.button, { backgroundColor: accent }]} onPress={save}>
                <Text style={local.buttonText}>{s.guardar}</Text>
              </TouchableOpacity>
              {hasPin && (
                <TouchableOpacity style={local.link} onPress={remove}>
                  <Text style={[local.linkText, { color: accent }]}>{s.quitar}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={local.link} onPress={() => setEditing(false)}>
                <Text style={[local.linkText, { color: theme.text }]}>{s.cancelar}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={[styles.card, local.note, { borderColor: accent }]}>
          <Ionicons name="information-circle-outline" size={18} color={accent} />
          <Text style={[local.desc, { color: theme.text, flex: 1, marginTop: 0 }]}>{s.nota}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  title: { fontSize: 15, fontWeight: "800" },
  desc: { fontSize: 12.5, lineHeight: 18, opacity: 0.8, marginTop: 4 },
  state: { fontSize: 12.5, fontWeight: "800", marginTop: 8 },
  field: { marginTop: 12 },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, fontSize: 20, letterSpacing: 8 },
  button: { marginTop: 14, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  link: { alignItems: "center", paddingVertical: 10 },
  linkText: { fontSize: 14, fontWeight: "700" },
  error: { marginTop: 10, fontSize: 13, fontWeight: "700", color: "#A21CAF" },
  note: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1.5 },
});
