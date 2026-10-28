import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { updateMe } from "../../services/users.service";
import { styles } from "../authentication/styles/signUp.styles";
import { dateToIso, formatDateText } from "./profileIncomplete";
import { documentFilter, isValidCellphone, isValidDocument } from "../../utils/validators";

const TYPES = ["C.C", "T.I", "Documento extranjero"] as const;
const PURPLE = "#6A3FC9";
const ERROR = "#A21CAF";

type Errors = Partial<Record<"telefono" | "tipo" | "documento" | "fecha" | "general", string>>;

/**
 * Accounts created with Google only bring name and email. Before using the app we ask for the data
 * the regular sign-up requires: with the phone and the document each person has a single account.
 * It looks like the sign-up screen, so it reads as the last step of signing up.
 */
export default function CompleteSignUpScreen({ onDone }: { onDone: () => void }) {
  const { t } = useLocale();
  const c = t.completarRegistro;
  const { user, signOut } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [type, setType] = useState<string>("");
  const [document, setDocument] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const e: Errors = {};
    const tel = phoneNumber.replace(/\D/g, "");
    if (!isValidCellphone(tel)) e.telefono = c.error_telefono;
    if (!type) e.tipo = c.error_tipo;
    if (!isValidDocument(type, document.trim())) e.documento = c.error_documento;
    const iso = dateToIso(date);
    if (!iso) e.fecha = c.error_fecha;
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await updateMe({ telephone: tel, documentType: type, documentNumber: document.trim(), birthdate: iso! });
      onDone();
    } catch (err: any) {
      const fields = err?.response?.data?.fieldErrors ?? {};
      setErrors({
        telefono: fields.telephone,
        documento: fields.documentNumber,
        general: fields.telephone || fields.documentNumber ? undefined : c.error_guardar,
      });
    } finally {
      setSaving(false);
    }
  };

  const error = (text?: string) => (text ? <Text style={local.error}>{text}</Text> : null);
  const firstName = (user?.nombre || "").split(" ")[0] || "";

  return (
    <SafeAreaView style={styles.Screen}>
      <StatusBar style="dark" backgroundColor="rgb(202, 171, 222)" />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "rgb(202, 171, 222)" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.MainContainer}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.LogoContainer}>
            <Image source={require("@assets/imagesAlertaMujer/logos/logoAlertaMujer.png")} style={styles.LogoImage} />
          </View>

          <View style={styles.FormContainer}>
            <View style={local.step}>
              <Ionicons name="logo-google" size={14} color={PURPLE} />
              <Text style={local.stepText}>Último paso del registro</Text>
            </View>
            <Text style={styles.FormTitle}>{c.titulo}</Text>
            <Text style={local.intro}>{c.intro.replace("{nombre}", firstName)}</Text>

            {/* Phone: only digits, 10 at most */}
            <View style={[styles.inputContainer, errors.telefono && local.inputError]}>
              <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScRegistro/phone.png")} />
              <TextInput
                style={styles.emailInput}
                placeholder={c.telefono}
                placeholderTextColor="#000"
                keyboardType="number-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(v) => setPhoneNumber(v.replace(/\D/g, ""))}
              />
            </View>
            {error(errors.telefono)}

            {/* Document type */}
            <Text style={local.label}>{c.tipo_documento}</Text>
            <View style={local.chips}>
              {TYPES.map((op) => (
                <TouchableOpacity
                  key={op}
                  onPress={() => {
                    setType(op);
                    setDocument((current) => documentFilter(op, current));
                  }}
                  style={[local.chip, type === op && local.chipActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: type === op }}
                >
                  <Text style={[local.chipText, type === op && local.chipTextActive]}>
                    {op === "Documento extranjero" ? t.registro.doc_extranjero : op}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {error(errors.tipo)}

            {/* Document number */}
            <View style={[styles.inputContainer, errors.documento && local.inputError]}>
              <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScRegistro/Documento.png")} />
              <TextInput
                style={styles.emailInput}
                placeholder={t.registro.num_documento}
                placeholderTextColor="#000"
                maxLength={15}
                autoCapitalize="characters"
                keyboardType={type === "Documento extranjero" ? "default" : "number-pad"}
                value={document}
                onChangeText={(v) => setDocument(documentFilter(type, v))}
              />
            </View>
            {errors.documento ? (
              error(errors.documento)
            ) : (
              <View style={local.help}>
                <Ionicons name="information-circle-outline" size={15} color="#6B21A8" style={{ marginTop: 1 }} />
                <Text style={local.helpText}>{t.registro.documento_para_que}</Text>
              </View>
            )}

            {/* Birth date with automatic DD/MM/YYYY format */}
            <View style={[styles.inputContainer, errors.fecha && local.inputError]}>
              <Ionicons name="calendar-outline" size={20} color="#000" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.emailInput}
                placeholder={`${c.fecha} (DD/MM/AAAA)`}
                placeholderTextColor="#000"
                keyboardType="number-pad"
                maxLength={10}
                value={date}
                onChangeText={(v) => setDate(formatDateText(v))}
              />
            </View>
            {error(errors.fecha)}
            {error(errors.general)}

            <TouchableOpacity
              onPress={save}
              disabled={saving}
              style={[styles.continueButton, local.button, saving && { opacity: 0.6 }]}
              accessibilityRole="button"
            >
              {saving && <ActivityIndicator color="#fff" />}
              <Text style={styles.continueText}>{c.guardar}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={signOut} style={local.leaveScreen}>
            <Text style={local.leaveText}>{c.otra_cuenta}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  step: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  stepText: { color: PURPLE, fontSize: 12, fontWeight: "700" },
  intro: { color: "#444", fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 6, marginBottom: 6, marginHorizontal: 6 },
  label: { color: "#000", fontSize: 14, fontWeight: "600", marginTop: 12, marginLeft: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginHorizontal: 10 },
  chip: { borderWidth: 1, borderColor: "#BC27BE", backgroundColor: "#F3E8FF", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText: { color: "#000", fontSize: 14, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  inputError: { borderColor: ERROR, borderWidth: 1.5 },
  error: { color: ERROR, fontSize: 13, marginLeft: 14, marginTop: 3 },
  help: { flexDirection: "row", gap: 6, marginHorizontal: 12, marginTop: 4 },
  helpText: { flex: 1, fontSize: 12, lineHeight: 17, color: "#6B21A8" },
  button: { flexDirection: "row", justifyContent: "center", gap: 8, marginHorizontal: 10 },
  leaveScreen: { alignItems: "center", paddingVertical: 14 },
  leaveText: { color: "#3B0764", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
});
