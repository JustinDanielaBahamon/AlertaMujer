import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, type LatLng } from "../../../components/map/MapLibreMap";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { searchPlaces, type FoundPlace } from "../../../services/geocoding.service";

// Neiva, until her location arrives
const DEFAULT_REGION = { latitude: 2.9271, longitude: -75.2874, latitudeDelta: 0.03, longitudeDelta: 0.03 };
const NEAR = { latitudeDelta: 0.012, longitudeDelta: 0.012 };
// Point A in light violet, point B in the theme color
const ORIGIN_COLOR = "#B388FF";

type Props = {
  visible: boolean;
  /** Point A: where she is now (not editable). */
  origin: LatLng | null;
  /** Point B chosen so far. */
  point: LatLng | null;
  destination: string;
  onPick: (point: LatLng, name?: string) => void;
  onClose: () => void;
};

/**
 * Full-screen map to choose point B. Point A is always her current location. She can search an
 * address (the map goes there) or tap the map.
 */
export default function TripDestinationPicker({ visible, origin, point, destination, onPick, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const tr = t.trayecto;
  const insets = useSafeAreaInsets();
  const accent = theme.icon;
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<FoundPlace[]>([]);
  const [searching, setSearching] = useState(false);
  // Where the map looks: the address found, point B, or her location
  const [focus, setFocus] = useState<LatLng | null>(null);

  useEffect(() => {
    if (visible) setFocus(point ?? origin);
  }, [visible, origin?.latitude, origin?.longitude]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setFound([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let active = true;
    const id = setTimeout(() => {
      searchPlaces(query, origin)
        .then((r) => active && setFound(r))
        .finally(() => active && setSearching(false));
    }, 700);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [query]);

  const chooseFound = (f: FoundPlace) => {
    const p = { latitude: f.latitude, longitude: f.longitude };
    Keyboard.dismiss();
    setFound([]);
    setQuery("");
    setFocus(p);
    onPick(p, f.name);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={local.container}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={DEFAULT_REGION}
          region={focus ? { ...focus, ...NEAR } : undefined}
          onPress={(e) => {
            Keyboard.dismiss();
            setFound([]);
            onPick(e.nativeEvent.coordinate);
          }}
        >
          {origin && <Marker coordinate={origin} title={`A · ${tr.mapa_tu_ubicacion}`} pinColor={ORIGIN_COLOR} />}
          {point && <Marker coordinate={point} title={`B · ${tr.mapa_destino}`} pinColor={accent} />}
        </MapView>

        <View style={[local.top, { paddingTop: insets.top + 8 }]}>
          <View style={local.searchRow}>
            <TouchableOpacity onPress={onClose} style={[local.round, { backgroundColor: theme.containerBackground }]}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
            <View style={[local.search, { backgroundColor: theme.containerBackground }]}>
              <Ionicons name="search" size={18} color={accent} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={tr.buscar_destino}
                placeholderTextColor={accent + "80"}
                style={[local.searchInput, { color: theme.text }]}
                returnKeyType="search"
              />
              {searching && <ActivityIndicator size="small" color={accent} />}
            </View>
          </View>
          {found.length > 0 ? (
            <View style={[local.results, { backgroundColor: theme.containerBackground }]}>
              {found.map((f, i) => (
                <TouchableOpacity
                  key={`${f.latitude},${f.longitude},${i}`}
                  onPress={() => chooseFound(f)}
                  style={[local.result, i > 0 && { borderTopWidth: 1, borderTopColor: accent + "20" }]}
                >
                  <Ionicons name="location" size={16} color={accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={[local.resultName, { color: theme.text }]} numberOfLines={1}>{f.name}</Text>
                    {!!f.detail && (
                      <Text style={[local.resultDetail, { color: theme.text }]} numberOfLines={1}>{f.detail}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            !query && (
              <View style={[local.hint, { backgroundColor: theme.containerBackground }]}>
                <Text style={[local.hintText, { color: theme.text }]}>{tr.mapa_instruccion}</Text>
              </View>
            )
          )}
        </View>

        <View style={[local.bottom, { paddingBottom: insets.bottom + 16, backgroundColor: theme.containerBackground }]}>
          <View style={local.labelRow}>
            <View style={[local.dot, { backgroundColor: ORIGIN_COLOR }]}><Text style={local.dotText}>A</Text></View>
            <Text style={[local.label, { color: theme.text }]} numberOfLines={1}>{tr.mapa_tu_ubicacion}</Text>
          </View>
          <View style={local.labelRow}>
            <View style={[local.dot, { backgroundColor: accent }]}><Text style={local.dotText}>B</Text></View>
            <Text style={[local.label, { color: theme.text }]} numberOfLines={2}>
              {point ? destination || tr.mapa_punto_marcado : tr.mapa_sin_punto}
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
  top: { position: "absolute", left: 16, right: 16, gap: 8 },
  searchRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", elevation: 4 },
  search: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 22, paddingHorizontal: 14, height: 44, elevation: 4 },
  searchInput: { flex: 1, fontSize: 15 },
  results: { borderRadius: 14, elevation: 4, overflow: "hidden" },
  result: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  resultName: { fontSize: 14, fontWeight: "700" },
  resultDetail: { fontSize: 12, opacity: 0.7 },
  hint: { alignSelf: "flex-start", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, elevation: 4 },
  hintText: { fontSize: 13, fontWeight: "600" },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, gap: 10, borderTopLeftRadius: 22, borderTopRightRadius: 22, elevation: 8 },
  labelRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  dotText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  label: { flex: 1, fontSize: 14, fontWeight: "600" },
  button: { height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
