import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, type LatLng } from "../../../components/map/MapLibreMap";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";

// Neiva, until her location arrives
const DEFAULT_REGION = { latitude: 2.9271, longitude: -75.2874, latitudeDelta: 0.03, longitudeDelta: 0.03 };
const NEAR = { latitudeDelta: 0.012, longitudeDelta: 0.012 };

type Props = {
  visible: boolean;
  origin: LatLng | null;
  point: LatLng | null;
  label: string;
  onPick: (point: LatLng) => void;
  onClose: () => void;
};

/** Full-screen map to mark where she is going: she taps the destination, the map opens on her location. */
export default function TripDestinationPicker({ visible, origin, point, label, onPick, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const tr = t.trayecto;
  const insets = useSafeAreaInsets();
  const accent = theme.icon;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={local.container}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={DEFAULT_REGION}
          region={origin ? { ...origin, ...NEAR } : undefined}
          onPress={(e) => onPick(e.nativeEvent.coordinate)}
        >
          {origin && <Marker coordinate={origin} title={tr.mapa_tu_ubicacion} pinColor={theme.headerText} />}
          {point && <Marker coordinate={point} title={tr.mapa_destino} pinColor={accent} />}
        </MapView>

        <View style={[local.top, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} style={[local.round, { backgroundColor: theme.containerBackground }]}>
            <Ionicons name="close" size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={[local.hint, { backgroundColor: theme.containerBackground }]}>
            <Text style={[local.hintText, { color: theme.text }]}>{tr.mapa_instruccion}</Text>
          </View>
        </View>

        <View style={[local.bottom, { paddingBottom: insets.bottom + 16, backgroundColor: theme.containerBackground }]}>
          <View style={local.labelRow}>
            <Ionicons name="flag" size={18} color={accent} />
            <Text style={[local.label, { color: theme.text }]} numberOfLines={2}>
              {point ? label || tr.mapa_punto_marcado : tr.mapa_sin_punto}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            disabled={!point}
            style={[local.button, { backgroundColor: accent }, !point && { opacity: 0.5 }]}
            accessibilityRole="button"
          >
            <Text style={local.buttonText}>{tr.mapa_usar_punto}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const local = StyleSheet.create({
  container: { flex: 1 },
  top: { position: "absolute", left: 16, right: 16, flexDirection: "row", gap: 10, alignItems: "center" },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", elevation: 4 },
  hint: { flex: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, elevation: 4 },
  hintText: { fontSize: 13, fontWeight: "600" },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, gap: 12, borderTopLeftRadius: 22, borderTopRightRadius: 22, elevation: 8 },
  labelRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  label: { flex: 1, fontSize: 14, fontWeight: "600" },
  button: { height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
