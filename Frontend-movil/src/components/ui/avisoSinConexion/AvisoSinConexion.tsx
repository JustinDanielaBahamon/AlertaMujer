import { Ionicons } from "@expo/vector-icons";
import { useNetworkState } from "expo-network";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";

/**
 * Aviso cuando el celular no tiene internet: si activa una alerta en ese momento, no saldrá. Se avisa
 * antes de la emergencia, cuando todavía puede conectarse a Wi‑Fi o recargar datos.
 */
export default function AvisoSinConexion() {
  const red = useNetworkState();
  const { t } = useLocale();
  const { theme } = useTheme();
  // isInternetReachable puede venir null mientras se comprueba: solo se avisa con un "no" seguro
  const sinInternet = red.isConnected === false || red.isInternetReachable === false;
  if (!sinInternet) return null;
  return (
    <View
      style={[estilos.caja, { borderColor: theme.icono, backgroundColor: theme.icono + "1F" }]}
      accessibilityRole="alert"
    >
      <Ionicons name="cloud-offline-outline" size={22} color={theme.icono} />
      <View style={{ flex: 1 }}>
        <Text style={[estilos.titulo, { color: theme.text }]}>{t.conexion.titulo}</Text>
        <Text style={[estilos.texto, { color: theme.text }]}>{t.conexion.texto}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1.5, borderRadius: 14, padding: 12, marginHorizontal: 16, marginTop: 8 },
  titulo: { fontSize: 13, fontWeight: "800" },
  texto: { fontSize: 12, lineHeight: 17, opacity: 0.85, marginTop: 2 },
});
