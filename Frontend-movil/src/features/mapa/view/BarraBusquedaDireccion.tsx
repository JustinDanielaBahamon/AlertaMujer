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

export type CoordBusqueda = { latitude: number; longitude: number };

type Props = {
  value: string;
  onChangeText: (texto: string) => void;
  /** Se llama cuando se encontró la dirección */
  onResultado: (coord: CoordBusqueda, texto: string) => void;
  /** Se llama al presionar la "X" para borrar la búsqueda */
  onLimpiar?: () => void;
  /** Ciudad para darle contexto a la búsqueda (ej: "Pitalito, Huila") */
  ciudad?: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

// Barra de búsqueda de direcciones (usa el geocodificador del teléfono, igual que el resto de la app)
export default function BarraBusquedaDireccion({
  value,
  onChangeText,
  onResultado,
  onLimpiar,
  ciudad,
  placeholder = "Buscar dirección...",
  style,
}: Props) {
  const { theme } = useTheme();
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = async () => {
    const consulta = value.trim();
    if (!consulta || buscando) return;

    Keyboard.dismiss();
    setBuscando(true);
    setError(null);

    try {
      // Primero se busca con la ciudad como contexto, luego solo con el país
      const intentos = [
        ciudad ? `${consulta}, ${ciudad}, Colombia` : null,
        `${consulta}, Colombia`,
      ].filter(Boolean) as string[];

      let encontrado: Location.LocationGeocodedLocation | null = null;
      for (const intento of intentos) {
        const resultados = await Location.geocodeAsync(intento);
        if (resultados.length > 0) {
          encontrado = resultados[0];
          break;
        }
      }

      if (!encontrado) {
        setError("No encontramos esa dirección. Intenta con más detalles.");
        return;
      }

      onResultado(
        { latitude: encontrado.latitude, longitude: encontrado.longitude },
        consulta
      );
    } catch {
      setError("No se pudo buscar la dirección. Revisa tu conexión.");
    } finally {
      setBuscando(false);
    }
  };

  const limpiar = () => {
    onChangeText("");
    setError(null);
    onLimpiar?.();
  };

  return (
    <View style={style}>
      <View style={[estilos.barra, { backgroundColor: theme.card }]}>
        <MaterialIcons name="search" size={20} color="#7B1DB2" />
        <TextInput
          style={[estilos.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.contactSubtext}
          value={value}
          onChangeText={(texto) => {
            onChangeText(texto);
            if (error) setError(null);
          }}
          returnKeyType="search"
          onSubmitEditing={buscar}
          autoCorrect={false}
        />
        {value.length > 0 && !buscando && (
          <TouchableOpacity onPress={limpiar} hitSlop={8}>
            <MaterialIcons name="close" size={20} color={theme.contactSubtext} />
          </TouchableOpacity>
        )}
        {buscando ? (
          <ActivityIndicator size="small" color="#7B1DB2" style={{ marginLeft: 8 }} />
        ) : (
          <TouchableOpacity style={estilos.botonBuscar} onPress={buscar} activeOpacity={0.8}>
            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={estilos.error}>{error}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
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
  botonBuscar: {
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