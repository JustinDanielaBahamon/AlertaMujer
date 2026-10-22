import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useTheme } from "../../contexts/ThemeContext";
import { updateMe } from "../../services/users.service";
import { createSettingsScreenStyles } from "../settings/styles/ajustesPantalla.styles";
import { dateToIso, formatDateText } from "./perfilIncompleto";

const TYPES = ["C.C", "T.I", "Documento extranjero"] as const;

type Errors = Partial<Record<"telefono" | "tipo" | "documento" | "fecha" | "general", string>>;

/**
 * Las cuentas creadas con Google solo traen nombre y correo. Antes de usar la app se piden los datos
 * que el registro normal exige: con el teléfono y el documento cada persona tiene una sola cuenta.
 */
export default function CompleteSignUpScreen({ onDone }: { onDone: () => void }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const c = t.completarRegistro;
  const { user, signOut } = useAuth();
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const accent = theme.icon;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [type, setType] = useState<string>("");
  const [document, setDocument] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const e: Errors = {};
    const tel = phoneNumber.replace(/\D/g, "");
    if (tel.length !== 10) e.telefono = c.error_telefono;
    if (!type) e.tipo = c.error_tipo;
    if (!document.trim() || document.trim().length < 5) e.documento = c.error_documento;
    const iso = dateToIso(date);
    if (!iso) e.fecha = c.error_fecha;
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await updateMe({ telephone: tel, documentType: type, documentNumber: document.trim(), birthdate: iso! });
      onDone();
    } catch (err: any) {
      const campos = err?.response?.data?.fieldErrors ?? {};
      setErrors({
        telefono: campos.telephone,
        documento: campos.documentNumber,
        general: campos.telephone || campos.documentNumber ? undefined : c.error_guardar,
      });
    } finally {
      setSaving(false);
    }
  };

  const field = (icon: keyof typeof Ionicons.glyphMap, error: string | undefined, input: React.ReactNode) => (
    <>
      <View style={[local.field, { borderColor: error ? "#A21CAF" : accent + "50" }]}>
        <Ionicons name={icon} size={18} color={accent} />
        {input}
      </View>
      {!!error && <Text style={local.error}>{error}</Text>}
    </>
  );

  return (
    <KeyboardAvoidingView behavior="height" style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />
      <View style={styles.header}>
        <Text style={[styles.headerTitleText, { marginLeft: 8 }]}>{c.titulo}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          {c.intro.replace("{nombre}", (user?.nombre || "").split(" ")[0] || "")}
        </Text>

        <View style={styles.card}>
          <Text style={[local.label, { color: theme.text }]}>{c.telefono}</Text>
          {field("call-outline", errors.telefono,
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={14}
              placeholder="300 123 4567"
              placeholderTextColor={accent + "70"}
              style={[local.input, { color: theme.text }]}
            />)}

          <Text style={[local.label, { color: theme.text, marginTop: 14 }]}>{c.tipo_documento}</Text>
          <View style={local.chips}>
            {TYPES.map((op) => (
              <TouchableOpacity
                key={op}
                onPress={() => setType(op)}
                style={[local.chip, { borderColor: accent }, type === op && { backgroundColor: accent }]}
              >
                <Text style={[local.chipText, { color: type === op ? "#fff" : accent }]}>
                  {op === "Documento extranjero" ? t.registro.doc_extranjero : op}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {!!errors.tipo && <Text style={local.error}>{errors.tipo}</Text>}

          <Text style={[local.label, { color: theme.text, marginTop: 14 }]}>{t.registro.num_documento}</Text>
          {field("card-outline", errors.documento,
            <TextInput
              value={document}
              onChangeText={setDocument}
              maxLength={20}
              autoCapitalize="characters"
              style={[local.input, { color: theme.text }]}
            />)}
          <View style={local.help}>
            <Ionicons name="information-circle-outline" size={15} color={accent} style={{ marginTop: 1 }} />
            <Text style={[local.helpText, { color: theme.text }]}>{t.registro.documento_para_que}</Text>
          </View>

          <Text style={[local.label, { color: theme.text, marginTop: 14 }]}>{c.fecha}</Text>
          {field("calendar-outline", errors.fecha,
            <TextInput
              value={date}
              onChangeText={(v) => setDate(formatDateText(v))}
              keyboardType="number-pad"
              maxLength={10}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={accent + "70"}
              style={[local.input, { color: theme.text }]}
            />)}
        </View>

        {!!errors.general && <Text style={[local.error, { color: theme.headerText }]}>{errors.general}</Text>}

        <TouchableOpacity
          onPress={save}
          disabled={saving}
          style={[local.button, { backgroundColor: accent }, saving && { opacity: 0.6 }]}
          accessibilityRole="button"
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark-circle" size={20} color="#fff" />}
          <Text style={local.buttonText}>{c.guardar}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={signOut} style={local.leaveScreen}>
          <Text style={[local.leaveText, { color: theme.headerText }]}>{c.otra_cuenta}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const local = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "700", opacity: 0.75, letterSpacing: 0.4, textTransform: "uppercase" },
  field: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, marginTop: 6 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  error: { color: "#A21CAF", fontSize: 12, marginTop: 4, marginLeft: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { fontSize: 13, fontWeight: "700" },
  help: { flexDirection: "row", gap: 6, marginTop: 6 },
  helpText: { flex: 1, fontSize: 12, lineHeight: 17, opacity: 0.8 },
  button: { flexDirection: "row", gap: 8, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  leaveScreen: { alignItems: "center", paddingVertical: 10 },
  leaveText: { fontSize: 13, fontWeight: "600", textDecorationLine: "underline", opacity: 0.85 },
});
