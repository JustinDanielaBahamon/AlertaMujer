import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useTheme } from "../../contexts/ThemeContext";
import { updateMe } from "../../services/users.service";
import { createAjustesPantallaStyles } from "../settings/styles/ajustesPantalla.styles";
import { fechaAIso, formatearFecha } from "./perfilIncompleto";

const TIPOS = ["C.C", "T.I", "Documento extranjero"] as const;

type Errores = Partial<Record<"telefono" | "tipo" | "documento" | "fecha" | "general", string>>;

/**
 * Las cuentas creadas con Google solo traen nombre y correo. Antes de usar la app se piden los datos
 * que el registro normal exige: con el teléfono y el documento cada persona tiene una sola cuenta.
 */
export default function CompletarRegistroScreen({ alTerminar }: { alTerminar: () => void }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const c = t.completarRegistro;
  const { user, signOut } = useAuth();
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const accent = theme.icono;

  const [telefono, setTelefono] = useState("");
  const [tipo, setTipo] = useState<string>("");
  const [documento, setDocumento] = useState("");
  const [fecha, setFecha] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    const e: Errores = {};
    const tel = telefono.replace(/\D/g, "");
    if (tel.length !== 10) e.telefono = c.error_telefono;
    if (!tipo) e.tipo = c.error_tipo;
    if (!documento.trim() || documento.trim().length < 5) e.documento = c.error_documento;
    const iso = fechaAIso(fecha);
    if (!iso) e.fecha = c.error_fecha;
    setErrores(e);
    if (Object.keys(e).length) return;

    setGuardando(true);
    try {
      await updateMe({ telephone: tel, documentType: tipo, documentNumber: documento.trim(), birthdate: iso! });
      alTerminar();
    } catch (err: any) {
      const campos = err?.response?.data?.fieldErrors ?? {};
      setErrores({
        telefono: campos.telephone,
        documento: campos.documentNumber,
        general: campos.telephone || campos.documentNumber ? undefined : c.error_guardar,
      });
    } finally {
      setGuardando(false);
    }
  };

  const campo = (icono: keyof typeof Ionicons.glyphMap, error: string | undefined, input: React.ReactNode) => (
    <>
      <View style={[local.campo, { borderColor: error ? "#A21CAF" : accent + "50" }]}>
        <Ionicons name={icono} size={18} color={accent} />
        {input}
      </View>
      {!!error && <Text style={local.error}>{error}</Text>}
    </>
  );

  return (
    <KeyboardAvoidingView behavior="height" style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />
      <View style={styles.header}>
        <Text style={[styles.tituloHeader, { marginLeft: 8 }]}>{c.titulo}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          {c.intro.replace("{nombre}", (user?.nombre || "").split(" ")[0] || "")}
        </Text>

        <View style={styles.tarjeta}>
          <Text style={[local.etiqueta, { color: theme.text }]}>{c.telefono}</Text>
          {campo("call-outline", errores.telefono,
            <TextInput
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              maxLength={14}
              placeholder="300 123 4567"
              placeholderTextColor={accent + "70"}
              style={[local.input, { color: theme.text }]}
            />)}

          <Text style={[local.etiqueta, { color: theme.text, marginTop: 14 }]}>{c.tipo_documento}</Text>
          <View style={local.chips}>
            {TIPOS.map((op) => (
              <TouchableOpacity
                key={op}
                onPress={() => setTipo(op)}
                style={[local.chip, { borderColor: accent }, tipo === op && { backgroundColor: accent }]}
              >
                <Text style={[local.chipTexto, { color: tipo === op ? "#fff" : accent }]}>
                  {op === "Documento extranjero" ? t.registro.doc_extranjero : op}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {!!errores.tipo && <Text style={local.error}>{errores.tipo}</Text>}

          <Text style={[local.etiqueta, { color: theme.text, marginTop: 14 }]}>{t.registro.num_documento}</Text>
          {campo("card-outline", errores.documento,
            <TextInput
              value={documento}
              onChangeText={setDocumento}
              maxLength={20}
              autoCapitalize="characters"
              style={[local.input, { color: theme.text }]}
            />)}
          <View style={local.ayuda}>
            <Ionicons name="information-circle-outline" size={15} color={accent} style={{ marginTop: 1 }} />
            <Text style={[local.ayudaTexto, { color: theme.text }]}>{t.registro.documento_para_que}</Text>
          </View>

          <Text style={[local.etiqueta, { color: theme.text, marginTop: 14 }]}>{c.fecha}</Text>
          {campo("calendar-outline", errores.fecha,
            <TextInput
              value={fecha}
              onChangeText={(v) => setFecha(formatearFecha(v))}
              keyboardType="number-pad"
              maxLength={10}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={accent + "70"}
              style={[local.input, { color: theme.text }]}
            />)}
        </View>

        {!!errores.general && <Text style={[local.error, { color: theme.headerText }]}>{errores.general}</Text>}

        <TouchableOpacity
          onPress={guardar}
          disabled={guardando}
          style={[local.boton, { backgroundColor: accent }, guardando && { opacity: 0.6 }]}
          accessibilityRole="button"
        >
          {guardando ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark-circle" size={20} color="#fff" />}
          <Text style={local.botonTexto}>{c.guardar}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={signOut} style={local.salir}>
          <Text style={[local.salirTexto, { color: theme.headerText }]}>{c.otra_cuenta}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const local = StyleSheet.create({
  etiqueta: { fontSize: 12, fontWeight: "700", opacity: 0.75, letterSpacing: 0.4, textTransform: "uppercase" },
  campo: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, marginTop: 6 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  error: { color: "#A21CAF", fontSize: 12, marginTop: 4, marginLeft: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 },
  chipTexto: { fontSize: 13, fontWeight: "700" },
  ayuda: { flexDirection: "row", gap: 6, marginTop: 6 },
  ayudaTexto: { flex: 1, fontSize: 12, lineHeight: 17, opacity: 0.8 },
  boton: { flexDirection: "row", gap: 8, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  botonTexto: { color: "#fff", fontSize: 16, fontWeight: "800" },
  salir: { alignItems: "center", paddingVertical: 10 },
  salirTexto: { fontSize: 13, fontWeight: "600", textDecorationLine: "underline", opacity: 0.85 },
});
