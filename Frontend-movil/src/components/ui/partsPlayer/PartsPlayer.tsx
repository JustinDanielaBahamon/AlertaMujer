import { MaterialIcons } from "@expo/vector-icons";
import { ResizeMode, Video, type AVPlaybackStatus } from "expo-av";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type RecordingPart = {
  id: number;
  created: Date;
  source: { uri: string; headers?: Record<string, string> };
};

const dos = (n: number) => String(n).padStart(2, "0");
const time = (d: Date) => `${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;

/**
 * Plays the parts of a recording one after another, as if they were a single file (the app uploads
 * video and audio in ~45 s chunks). The numbered buttons jump to any part.
 */
export default function PartsPlayer({
  parts,
  type,
  color,
}: {
  parts: RecordingPart[];
  type: "video" | "audio";
  color: string;
}) {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const playOnLoad = useRef(false);
  const current = parts[Math.min(index, parts.length - 1)];
  // The tracking refreshes every few seconds with new objects: the player only gets a new source when the
  // address really changes, otherwise it would reload the part she is watching
  const uri = current?.source?.uri;
  const headers = JSON.stringify(current?.source?.headers ?? {});
  const source = useMemo(
    () => (uri ? { uri, headers: JSON.parse(headers) as Record<string, string> } : undefined),
    [uri, headers],
  );

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [current?.id]);

  if (!current) return null;

  const onStatusChange = (s: AVPlaybackStatus) => {
    if (!s.isLoaded) {
      if (s.error) setError(true);
      return;
    }
    if (loading) setLoading(false);
    if (s.didJustFinish && index < parts.length - 1) {
      playOnLoad.current = true; // the next part starts by itself
      setIndex(index + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={type === "audio" ? styles.audioMedia : styles.media}>
        {type === "audio" && <MaterialIcons name="graphic-eq" size={48} color={color} style={styles.audioIcon} />}
        <Video
          key={current.id}
          source={source}
          style={type === "audio" ? styles.videoAudio : StyleSheet.absoluteFill}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay={playOnLoad.current}
          onPlaybackStatusUpdate={onStatusChange}
          onError={() => setError(true)}
        />
        {loading && !error && <ActivityIndicator color="#fff" style={styles.center} />}
        {error && <Text style={[styles.center, styles.error]}>No se pudo cargar esta parte</Text>}
      </View>

      {parts.length > 1 && (
        <View style={styles.parts}>
          {parts.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => {
                playOnLoad.current = true;
                setIndex(i);
              }}
              style={[styles.part, { borderColor: color }, i === index && { backgroundColor: color }]}
              accessibilityLabel={`Parte ${i + 1}`}
            >
              <Text style={[styles.partText, { color: i === index ? "#fff" : color }]}>{i + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Text style={[styles.footer, { color }]}>
        {parts.length > 1 ? `Parte ${index + 1} de ${parts.length} · ` : ""}
        {time(current.created)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  media: { width: "100%", aspectRatio: 3 / 4, maxHeight: 420, borderRadius: 14, overflow: "hidden", backgroundColor: "#000" },
  audioMedia: { width: "100%", height: 150, borderRadius: 14, overflow: "hidden", backgroundColor: "#1d1030", justifyContent: "flex-end" },
  audioIcon: { position: "absolute", alignSelf: "center", top: 30 },
  videoAudio: { width: "100%", height: 60 },
  center: { position: "absolute", alignSelf: "center", top: "45%" },
  error: { color: "#fff", fontSize: 13 },
  parts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  part: { minWidth: 42, height: 42, borderRadius: 12, borderWidth: 1.5, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  partText: { fontSize: 15, fontWeight: "800" },
  footer: { fontSize: 12, fontWeight: "600" },
});
