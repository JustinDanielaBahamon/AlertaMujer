import { MaterialIcons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { evidenceSource, getAlertEvidence, type SavedEvidence } from "../../../services/evidence.service";

const ICON: Record<SavedEvidence["type"], keyof typeof MaterialIcons.glyphMap> = {
  video: "videocam",
  audio: "mic",
  photo: "photo",
  document: "description",
};

// Same format as the rest of the detail ("10:17 p. m.")
const time = (d: Date) => d.toLocaleTimeString("es-CO", { timeZone: "America/Bogota", hour: "numeric", minute: "2-digit" });
const size = (bytes: number | null) =>
  bytes == null ? "" : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** Videos, audios and photos recorded during the alert, with their player. */
export default function AlertEvidence({ alertId }: { alertId: number }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const e = t.detalle;
  const [list, setList] = useState<SavedEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [opened, setOpened] = useState<SavedEvidence | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getAlertEvidence(alertId)
      .then(setList)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [alertId]);

  useEffect(load, [load]);

  const open = (ev: SavedEvidence) => {
    setMediaError(false);
    setLoadingMedia(true);
    setOpened(ev);
  };

  // Number of each evidence within its type: "Video 1", "Video 2"... (they are recorded in parts)
  const label = (ev: SavedEvidence) => {
    const n = list.filter((x) => x.type === ev.type && x.date <= ev.date).length;
    const name = { video: e.evidencia_video, audio: e.evidencia_audio, photo: e.evidencia_foto, document: e.evidencia_documento }[ev.type];
    return `${name} ${n}`;
  };

  const count = (type: SavedEvidence["type"]) => list.filter((x) => x.type === type).length;

  return (
    <>
      <View style={[local.card, { backgroundColor: theme.containerBackground }]}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.contactAccent} />
        ) : error ? (
          <TouchableOpacity onPress={load} style={local.emptyRow}>
            <MaterialIcons name="refresh" size={18} color={theme.contactAccent} />
            <Text style={[local.text, { color: theme.contactSubtext }]}>{e.evidencias_error}</Text>
          </TouchableOpacity>
        ) : list.length === 0 ? (
          <View style={local.emptyRow}>
            <MaterialIcons name="videocam-off" size={18} color={theme.contactSubtext} />
            <Text style={[local.text, { color: theme.contactSubtext }]}>{e.evidencias_vacio}</Text>
          </View>
        ) : (
          <>
            <View style={local.summary}>
              {(["video", "audio", "photo"] as const)
                .filter((type) => count(type) > 0)
                .map((type) => (
                  <View key={type} style={[local.chip, { backgroundColor: `${theme.contactAccent}1A` }]}>
                    <MaterialIcons name={ICON[type]} size={14} color={theme.contactAccent} />
                    <Text style={[local.chipText, { color: theme.contactAccent }]}>{count(type)}</Text>
                  </View>
                ))}
            </View>
            {list.map((ev) => (
              <TouchableOpacity
                key={ev.id}
                style={local.row}
                onPress={() => open(ev)}
                disabled={!ev.hasFile || ev.type === "document"}
                accessibilityRole="button"
              >
                <View style={[local.icon, { backgroundColor: theme.contactAccent }]}>
                  <MaterialIcons name={ICON[ev.type]} size={18} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[local.title, { color: theme.text }]}>{label(ev)}</Text>
                  <Text style={[local.text, { color: theme.contactSubtext }]}>
                    {time(ev.date)}
                    {ev.sizeBytes != null ? ` · ${size(ev.sizeBytes)}` : ""}
                    {!ev.hasFile ? ` · ${e.evidencia_sin_archivo}` : ""}
                  </Text>
                </View>
                {ev.hasFile && ev.type !== "document" && (
                  <MaterialIcons name={ev.type === "photo" ? "zoom-in" : "play-circle-filled"} size={28} color={theme.contactAccent} />
                )}
              </TouchableOpacity>
            ))}
            <Text style={[local.note, { color: theme.contactSubtext }]}>{e.evidencias_nota}</Text>
          </>
        )}
      </View>

      <Modal visible={!!opened} transparent animationType="fade" onRequestClose={() => setOpened(null)}>
        <Pressable style={local.background} onPress={() => setOpened(null)}>
          <Pressable style={local.visor}>
            {opened && (
              <>
                <View style={local.viewerHeader}>
                  <Text style={local.viewerTitle}>{label(opened)}</Text>
                  <TouchableOpacity onPress={() => setOpened(null)} accessibilityLabel={t.modal.cerrar}>
                    <MaterialIcons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={opened.type === "audio" ? local.audioMedia : local.media}>
                  {opened.type === "photo" ? (
                    <Image
                      source={evidenceSource(opened.id)}
                      style={StyleSheet.absoluteFill}
                      resizeMode="contain"
                      onLoadEnd={() => setLoadingMedia(false)}
                      onError={() => {
                        setLoadingMedia(false);
                        setMediaError(true);
                      }}
                    />
                  ) : (
                    <>
                      {opened.type === "audio" && (
                        <MaterialIcons name="graphic-eq" size={56} color="#d8b4fe" style={local.audioIcon} />
                      )}
                      <Video
                        source={evidenceSource(opened.id)}
                        style={opened.type === "audio" ? local.videoAudio : StyleSheet.absoluteFill}
                        resizeMode={ResizeMode.CONTAIN}
                        useNativeControls
                        shouldPlay
                        onLoad={() => setLoadingMedia(false)}
                        onError={() => {
                          setLoadingMedia(false);
                          setMediaError(true);
                        }}
                      />
                    </>
                  )}
                  {loadingMedia && !mediaError && <ActivityIndicator color="#fff" style={local.center} />}
                  {mediaError && <Text style={[local.center, local.mediaError]}>{e.evidencia_error_reproducir}</Text>}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const local = StyleSheet.create({
  card: { borderRadius: 18, padding: 14, gap: 10, marginBottom: 16 },
  emptyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summary: { flexDirection: "row", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipText: { fontSize: 12, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "700" },
  text: { fontSize: 12 },
  note: { fontSize: 11, marginTop: 2 },
  background: { flex: 1, backgroundColor: "rgba(10,4,20,0.88)", justifyContent: "center", padding: 16 },
  visor: { borderRadius: 18, overflow: "hidden", backgroundColor: "#12081f" },
  viewerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  viewerTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  media: { width: "100%", aspectRatio: 9 / 12, backgroundColor: "#000" },
  audioMedia: { width: "100%", height: 200, backgroundColor: "#1d1030", justifyContent: "flex-end" },
  audioIcon: { position: "absolute", alignSelf: "center", top: 48 },
  videoAudio: { width: "100%", height: 70 },
  center: { position: "absolute", alignSelf: "center", top: "45%" },
  mediaError: { color: "#fff", textAlign: "center", paddingHorizontal: 24 },
});
