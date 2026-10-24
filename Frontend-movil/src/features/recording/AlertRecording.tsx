import { MaterialIcons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme, type AppTheme } from "../../contexts/ThemeContext";
import { useAlertRecording } from "./useAlertRecording";

const NEON = "#C026D3";

const MODE_TEXT = {
  video: "Grabando video y audio",
  audio: "Grabando audio",
  pausada: "Grabación en pausa",
  sin_permiso: "Falta el permiso de micrófono",
} as const;

/**
 * "Evidence" card of the active alert. Closed by default: whoever sees her screen (the aggressor, a
 * thief) must not notice she is being recorded, so neither the camera image nor a recording light is
 * shown. It keeps recording while closed; she opens it like a dropdown to see the video or audio.
 */
export default function AlertRecording({ alertId, alertStart }: { alertId: number | null; alertStart: Date | null }) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const g = useAlertRecording(alertId, alertStart, open);
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
      ? "Lo grabado se envía por partes a la nube para tus contactos."
      : `${uploaded} ${uploaded === 1 ? "parte enviada" : "partes enviadas"} a tus contactos` +
        (pendingItems > 0 ? ` · ${pendingItems} por enviar` : "");

  return (
    <View style={s.card}>
      <TouchableOpacity
        style={s.heading}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <MaterialIcons name="folder-special" size={20} color={theme.contactAccent} />
        <Text style={s.title}>Evidencia</Text>
        {open ? (
          <View style={s.status}>
            <Animated.View style={[s.point, !recordingNow && s.offDot, { opacity: recordingNow ? pulse : 1 }]} />
            <Text style={s.statusText}>{MODE_TEXT[g.mode]}</Text>
          </View>
        ) : (
          <Text style={s.closedHint}>Toca para ver</Text>
        )}
        <MaterialIcons name={open ? "expand-less" : "expand-more"} size={22} color={theme.contactSubtext} />
      </TouchableOpacity>

      {/* The camera stays mounted while closed (it keeps recording), but its image is not shown */}
      {g.showCamera && (
        <View style={open ? s.cameraFrame : s.hiddenCamera} pointerEvents={open ? "auto" : "none"}>
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

      {/* A missing permission is shown even closed: without it nothing is recorded */}
      {!open && g.mode === "sin_permiso" && <Text style={s.error}>{MODE_TEXT.sin_permiso}</Text>}
      {open && (
        <>
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
        </>
      )}
      {!open && g.mode === "sin_permiso" && (
        <TouchableOpacity style={[s.button, s.primaryButton, s.closedPermission]} onPress={g.givePermission} activeOpacity={0.85}>
          <MaterialIcons name="mic" size={18} color="#FFFFFF" />
          <Text style={s.primaryButtonText}>Dar permiso</Text>
        </TouchableOpacity>
      )}
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
    // Closed: the camera keeps working (the recording does not depend on the preview size) but is invisible
    hiddenCamera: { position: "absolute", width: 2, height: 2, opacity: 0, overflow: "hidden" },
    closedHint: { marginLeft: "auto", fontSize: 12, fontWeight: "600", color: theme.contactSubtext },
    closedPermission: { flex: 0, marginTop: 10, paddingHorizontal: 16 },
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
