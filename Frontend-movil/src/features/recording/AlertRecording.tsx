import { MaterialIcons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme, type AppTheme } from "../../contexts/ThemeContext";
import { SECONDS_PER_CHUNK, useAlertRecording } from "./useAlertRecording";

const NEON = "#C026D3";

const MODE_TEXT = {
  video: "Grabando video y audio",
  audio: "Grabando audio",
  pausada: "Grabación en pausa",
  sin_permiso: "Falta el permiso de micrófono",
} as const;

/** "Evidence" card of the active alert: camera view, status and what was already uploaded. */
export default function AlertRecording({ alertId }: { alertId: number | null }) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const g = useAlertRecording(alertId);
  const recordingNow = g.mode === "video" || g.mode === "audio";
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!recordingNow) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [recordingNow, pulse]);

  const { uploaded, pendingItems } = g.uploads;
  const uploadsText =
    uploaded === 0 && pendingItems === 0
      ? `Cada ${SECONDS_PER_CHUNK} s se envía lo grabado a la nube para tus contactos.`
      : `${uploaded} ${uploaded === 1 ? "parte enviada" : "partes enviadas"} a tus contactos` +
        (pendingItems > 0 ? ` · ${pendingItems} por enviar` : "");

  return (
    <View style={s.card}>
      <View style={s.heading}>
        <MaterialIcons name="videocam" size={20} color={theme.contactAccent} />
        <Text style={s.title}>Evidencia</Text>
        <View style={s.status}>
          <Animated.View style={[s.point, !recordingNow && s.offDot, { opacity: recordingNow ? pulse : 1 }]} />
          <Text style={s.statusText}>{MODE_TEXT[g.mode]}</Text>
        </View>
      </View>

      {g.showCamera && (
        <View style={s.cameraFrame}>
          <CameraView
            ref={g.cameraRef}
            style={s.camera}
            mode="video"
            facing={g.frontal ? "front" : "back"}
            videoQuality="480p"
            mute={g.muted}
            onCameraReady={g.onCameraReady}
            onMountError={g.onCameraError}
          />
        </View>
      )}

      <Text style={s.detail}>{uploadsText}</Text>
      {recordingNow && <Text style={s.note}>Si apagas la pantalla o sales de la app, se sigue grabando el audio.</Text>}
      {!!g.error && <Text style={s.error}>{g.error}</Text>}

      <View style={s.buttons}>
        {g.mode === "sin_permiso" ? (
          <TouchableOpacity style={[s.button, s.primaryButton]} onPress={g.givePermission} activeOpacity={0.85}>
            <MaterialIcons name="mic" size={18} color="#FFFFFF" />
            <Text style={s.primaryButtonText}>Dar permiso</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.button, g.turnedOn ? s.secondaryButton : s.primaryButton]}
            onPress={g.toggle}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name={g.turnedOn ? "pause" : "fiber-manual-record"}
              size={18}
              color={g.turnedOn ? theme.contactAccent : "#FFFFFF"}
            />
            <Text style={g.turnedOn ? s.secondaryButtonText : s.primaryButtonText}>
              {g.turnedOn ? "Pausar" : "Grabar"}
            </Text>
          </TouchableOpacity>
        )}
        {g.showCamera && (
          <TouchableOpacity style={[s.button, s.secondaryButton]} onPress={g.switchCamera} activeOpacity={0.85}>
            <MaterialIcons name="flip-camera-android" size={18} color={theme.contactAccent} />
            <Text style={s.secondaryButtonText}>Cambiar cámara</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: { marginTop: 16, padding: 14, borderRadius: 18, backgroundColor: theme.containerBackground },
    heading: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { fontSize: 16, fontWeight: "700", color: theme.text },
    status: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
    point: { width: 10, height: 10, borderRadius: 5, backgroundColor: NEON },
    offDot: { backgroundColor: theme.contactSubtext },
    statusText: { fontSize: 12, fontWeight: "700", color: theme.contactAccent, flexShrink: 1 },
    cameraFrame: { marginTop: 12, height: 200, borderRadius: 14, overflow: "hidden", backgroundColor: "#000000" },
    camera: { flex: 1 },
    detail: { marginTop: 10, fontSize: 13, color: theme.text },
    note: { marginTop: 4, fontSize: 12, color: theme.contactSubtext },
    error: { marginTop: 6, fontSize: 12, fontWeight: "600", color: "#A21CAF" },
    buttons: { flexDirection: "row", gap: 8, marginTop: 12 },
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 22,
    },
    primaryButton: { backgroundColor: theme.contactAccent },
    primaryButtonText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
    secondaryButton: { borderWidth: 1, borderColor: `${theme.contactAccent}55`, backgroundColor: `${theme.contactAccent}12` },
    secondaryButtonText: { fontSize: 14, fontWeight: "700", color: theme.contactAccent },
  });
