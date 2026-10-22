import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";

export type SearchCoord = { latitude: number; longitude: number };

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** Se llama cuando se encontró la dirección */
  onResult: (coord: SearchCoord, text: string) => void;
  /** Se llama al presionar la "X" para borrar la búsqueda */
  onClear?: () => void;
  /** Ciudad para darle contexto a la búsqueda (ej: "Pitalito, Huila") */
  city?: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

// Barra de búsqueda de direcciones (usa el geocodificador del teléfono, igual que el resto de la app)
export default function AddressSearchBar({
  value,
  onChangeText,
  onResult,
  onClear,
  city,
  placeholder = "Buscar dirección...",
  style,
}: Props) {
  const { theme } = useTheme();
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    const query = value.trim();
    if (!query || searching) return;

    Keyboard.dismiss();
    setSearching(true);
    setError(null);

    try {
      // Primero se busca con la ciudad como contexto, luego solo con el país
      const attempts = [
        city ? `${query}, ${city}, Colombia` : null,
        `${query}, Colombia`,
      ].filter(Boolean) as string[];

      let foundItem: Location.LocationGeocodedLocation | null = null;
      for (const attempt of attempts) {
        const results = await Location.geocodeAsync(attempt);
        if (results.length > 0) {
          foundItem = results[0];
          break;
        }
      }

      if (!foundItem) {
        setError("No encontramos esa dirección. Intenta con más detalles.");
        return;
      }

      onResult(
        { latitude: foundItem.latitude, longitude: foundItem.longitude },
        query
      );
    } catch {
      setError("No se pudo buscar la dirección. Revisa tu conexión.");
    } finally {
      setSearching(false);
    }
  };

  const clear = () => {
    onChangeText("");
    setError(null);
    onClear?.();
  };

  return (
    <View style={style}>
      <View style={[styles.bar, { backgroundColor: theme.card }]}>
        <MaterialIcons name="search" size={20} color="#7B1DB2" />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.contactSubtext}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (error) setError(null);
          }}
          returnKeyType="search"
          onSubmitEditing={search}
          autoCorrect={false}
        />
        {value.length > 0 && !searching && (
          <TouchableOpacity onPress={clear} hitSlop={8}>
            <MaterialIcons name="close" size={20} color={theme.contactSubtext} />
          </TouchableOpacity>
        )}
        {searching ? (
          <ActivityIndicator size="small" color="#7B1DB2" style={{ marginLeft: 8 }} />
        ) : (
          <TouchableOpacity style={styles.searchButton} onPress={search} activeOpacity={0.8}>
            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 24,
    paddingLeft: 14,
    paddingRight: 6,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#7B1DB2",
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    marginTop: 6,
    marginLeft: 14,
    fontSize: 12,
    fontWeight: "600",
    color: "#E74C3C",
  },
});