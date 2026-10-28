import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { searchPlaces, type FoundPlace } from "../../../services/geocoding.service";

type Props = {
  placeholder: string;
  /** Results near this point first (her location). */
  near?: { latitude: number; longitude: number } | null;
  /** Color of the letter, icons and border. */
  accent: string;
  /** "A" / "B" badge before the field (optional). */
  letter?: string;
  textColor: string;
  background: string;
  noResultsText: string;
  onPick: (place: FoundPlace) => void;
};

/**
 * Address search field: as she types, places near her are searched (OpenStreetMap) and listed below;
 * choosing one calls onPick and clears the field.
 */
export default function PlaceSearchField({
  placeholder,
  near,
  accent,
  letter,
  textColor,
  background,
  noResultsText,
  onPick,
}: Props) {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<FoundPlace[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setFound([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let active = true;
    // One query per pause in typing (OpenStreetMap asks for at most 1 per second)
    const id = setTimeout(() => {
      searchPlaces(query, near)
        .then((r) => active && setFound(r))
        .finally(() => active && setSearching(false));
    }, 700);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [query, near?.latitude, near?.longitude]);

  const choose = (place: FoundPlace) => {
    Keyboard.dismiss();
    setQuery("");
    setFound([]);
    onPick(place);
  };

  return (
    <View style={local.wrap}>
      <View style={local.row}>
        {letter ? (
          <View style={[local.letter, { backgroundColor: accent }]}>
            <Text style={local.letterText}>{letter}</Text>
          </View>
        ) : null}
        <View style={[local.box, { borderColor: accent + "60", backgroundColor: background }]}>
          <MaterialIcons name="search" size={18} color={accent} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor={textColor + "80"}
            style={[local.input, { color: textColor }]}
            returnKeyType="search"
          />
          {searching && <ActivityIndicator size="small" color={accent} />}
          {!!query && !searching && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <MaterialIcons name="cancel" size={18} color={accent + "90"} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {found.length > 0 && (
        <View style={[local.results, { borderColor: accent + "30", backgroundColor: background }, !!letter && local.indent]}>
          {found.map((f, i) => (
            <TouchableOpacity
              key={`${f.latitude},${f.longitude},${i}`}
              onPress={() => choose(f)}
              style={[local.result, i > 0 && { borderTopWidth: 1, borderTopColor: accent + "20" }]}
            >
              <MaterialIcons name="place" size={18} color={accent} />
              <View style={local.body}>
                <Text style={[local.name, { color: textColor }]} numberOfLines={1}>{f.name}</Text>
                {!!f.detail && <Text style={[local.detail, { color: textColor }]} numberOfLines={1}>{f.detail}</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {!searching && found.length === 0 && query.trim().length >= 3 && (
        <Text style={[local.detail, { color: textColor }, !!letter && local.indent, local.empty]}>{noResultsText}</Text>
      )}
    </View>
  );
}

const local = StyleSheet.create({
  wrap: { marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  letter: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  letterText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  box: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 9 },
  results: { borderWidth: 1, borderRadius: 12, marginTop: 6 },
  indent: { marginLeft: 36 },
  result: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  body: { flex: 1 },
  name: { fontSize: 14, fontWeight: "700" },
  detail: { fontSize: 12, opacity: 0.7 },
  empty: { marginTop: 6 },
});
