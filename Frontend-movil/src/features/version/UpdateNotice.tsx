import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { APK_DOWNLOAD_URL } from "../../constants/links";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getPublicSettings } from "../../services/settings.service";
import { isOlderVersion } from "./version";

// "Más tarde" vuelve a avisar al día siguiente
const POSTPONED_KEY = "@alerta_mujer:aviso_version_pospuesto";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Aviso de actualización: si la versión instalada es anterior a la mínima que pide la
 * administración, ofrece descargar el APK nuevo. No bloquea la app: en una emergencia el botón de
 * alerta tiene que seguir funcionando aunque la versión sea vieja. Se monta una vez en App.tsx.
 */
export default function UpdateNotice() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocale();
  const v = t.version;
  const [minima, setMinima] = useState<string | null>(null);
  const installed = Constants.expoConfig?.version ?? null;

  useEffect(() => {
    if (!user?.id) return;
    let enabled = true;
    (async () => {
      try {
        const { minAppVersion } = await getPublicSettings();
        if (!isOlderVersion(installed, minAppVersion)) return;
        const postponed = Number(await AsyncStorage.getItem(POSTPONED_KEY).catch(() => null)) || 0;
        if (enabled && Date.now() - postponed > ONE_DAY_MS) setMinima(minAppVersion);
      } catch {
        // Sin conexión: se revisa la próxima vez que se abra la app
      }
    })();
    return () => {
      enabled = false;
    };
  }, [user?.id, installed]);

  const later = () => {
    AsyncStorage.setItem(POSTPONED_KEY, String(Date.now())).catch(() => {});
    setMinima(null);
  };

  const download = () => {
    Linking.openURL(APK_DOWNLOAD_URL).catch(() => {});
    setMinima(null);
  };

  const accent = theme.icon;
  return (
    <Modal visible={!!minima} transparent animationType="fade" onRequestClose={later}>
      <View style={styles.background}>
        <View style={[styles.card, { backgroundColor: theme.containerBackground }]}>
          <View style={[styles.icon, { backgroundColor: accent + "22" }]}>
            <Ionicons name="cloud-download-outline" size={30} color={accent} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{v.titulo}</Text>
          <Text style={[styles.text, { color: theme.text }]}>{v.texto}</Text>
          <View style={[styles.versions, { backgroundColor: accent + "12" }]}>
            <Text style={[styles.version, { color: theme.text }]}>
              {v.instalada}: <Text style={styles.bold}>{installed}</Text>
            </Text>
            <Text style={[styles.version, { color: theme.text }]}>
              {v.minima}: <Text style={styles.bold}>{minima}</Text>
            </Text>
          </View>
          <Text style={[styles.note, { color: theme.text }]}>{v.nota}</Text>
          <TouchableOpacity onPress={download} style={[styles.button, { backgroundColor: accent }]} accessibilityRole="button">
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>{v.descargar}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={later} style={styles.secondary}>
            <Text style={[styles.secondaryText, { color: accent }]}>{v.mas_tarde}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  card: { borderRadius: 22, padding: 22, alignItems: "center" },
  icon: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", marginTop: 12, textAlign: "center" },
  text: { fontSize: 13, lineHeight: 19, opacity: 0.8, textAlign: "center", marginTop: 6 },
  versions: { alignSelf: "stretch", borderRadius: 12, padding: 10, marginTop: 14, gap: 2 },
  version: { fontSize: 13 },
  bold: { fontWeight: "800" },
  note: { fontSize: 12, opacity: 0.7, textAlign: "center", marginTop: 10 },
  button: { alignSelf: "stretch", flexDirection: "row", gap: 8, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 16 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  secondary: { paddingVertical: 12 },
  secondaryText: { fontSize: 14, fontWeight: "700" },
});
