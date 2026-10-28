import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ShakeSensor, { type LocalEvidenceFile } from "../../../../modules/shake-sensor";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";

// Builds made before the local copy existed do not have these functions
const supported = () => Platform.OS === "android" && typeof ShakeSensor?.localEvidence === "function";

const time = (ms: number) =>
  new Date(ms).toLocaleTimeString("es-CO", { timeZone: "America/Bogota", hour: "numeric", minute: "2-digit" });
const size = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const isAudio = (f: LocalEvidenceFile) => /\.(m4a|aac|mp3|3gp)$/i.test(f.name);

/**
 * The private copy of the evidence kept in the app's own folder (not in the gallery). She can
 * download it to Descargas/AlertaMujer, share it or delete it. Hidden when there is no copy.
 */
export default function LocalEvidence({ alertId }: { alertId: number }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const e = t.detalle;
  const [files, setFiles] = useState<LocalEvidenceFile[]>([]);

  const load = useCallback(() => {
    if (!supported()) return;
    try {
      setFiles(ShakeSensor.localEvidence(alertId));
    } catch {
      setFiles([]);
    }
  }, [alertId]);

  useEffect(load, [load]);

  if (files.length === 0) return null;

  const download = (f: LocalEvidenceFile) => {
    try {
      const path = ShakeSensor.exportEvidence(f.uri);
      Alert.alert(e.copia_titulo, path ? e.copia_descargada : e.copia_error);
    } catch {
      Alert.alert(e.copia_titulo, e.copia_error);
    }
  };

  const share = (f: LocalEvidenceFile) => {
    try {
      if (!ShakeSensor.shareEvidence(f.uri)) Alert.alert(e.copia_titulo, e.copia_error);
    } catch {
      Alert.alert(e.copia_titulo, e.copia_error);
    }
  };

  const remove = () =>
    Alert.alert(e.copia_borrar, e.copia_borrar_pregunta, [
      { text: t.modal.cerrar, style: "cancel" },
      {
        text: e.copia_borrar,
        style: "destructive",
        onPress: () => {
          try {
            ShakeSensor.deleteLocalEvidence(alertId);
          } finally {
            load();
          }
        },
      },
    ]);

  return (
    <View style={[local.card, { backgroundColor: theme.containerBackground }]}>
      <View style={local.header}>
        <MaterialIcons name="smartphone" size={18} color={theme.contactAccent} />
        <Text style={[local.heading, { color: theme.text }]}>{e.copia_titulo}</Text>
      </View>
      {files.map((f) => (
        <View key={f.uri} style={local.row}>
          <View style={[local.icon, { backgroundColor: theme.contactAccent }]}>
            <MaterialIcons name={isAudio(f) ? "mic" : "videocam"} size={18} color="#fff" />
          </View>
          <Text style={[local.text, { color: theme.contactSubtext, flex: 1 }]}>
            {time(f.modifiedMs)} · {size(f.sizeBytes)}
          </Text>
          <TouchableOpacity onPress={() => download(f)} style={local.action} accessibilityLabel={e.copia_descargar}>
            <MaterialIcons name="file-download" size={24} color={theme.contactAccent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => share(f)} style={local.action} accessibilityLabel={e.copia_compartir}>
            <MaterialIcons name="share" size={22} color={theme.contactAccent} />
          </TouchableOpacity>
        </View>
      ))}
      <Text style={[local.note, { color: theme.contactSubtext }]}>{e.copia_nota}</Text>
      <TouchableOpacity onPress={remove} style={local.removeRow} accessibilityRole="button">
        <MaterialIcons name="delete-outline" size={18} color={theme.contactSubtext} />
        <Text style={[local.text, { color: theme.contactSubtext }]}>{e.copia_borrar}</Text>
      </TouchableOpacity>
    </View>
  );
}

const local = StyleSheet.create({
  card: { borderRadius: 18, padding: 14, gap: 10, marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  heading: { fontSize: 14, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 12 },
  action: { padding: 4 },
  note: { fontSize: 11 },
  removeRow: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
});
