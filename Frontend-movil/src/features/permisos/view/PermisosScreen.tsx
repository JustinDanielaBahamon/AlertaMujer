import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";
import { createMetodosActivacionStyles, obtenerColoresHeader } from "../../settings/styles/metodosActivacion.styles";
import { usePermisosViewModel } from "../usePermisosViewModel";

/** "Permisos y protección": qué falta para que una alerta funcione y un botón para activarlo. */
export default function PermisosScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createMetodosActivacionStyles(theme), [theme]);
  const { texto } = obtenerColoresHeader(theme);
  const insets = useSafeAreaInsets();
  const { items, listos, total, cargando, activar, volver } = usePermisosViewModel();
  const porcentaje = total > 0 ? Math.round((listos / total) * 100) : 0;

  return (
    <View style={styles.contenedor}>
      <StatusBar style={texto === "#1a1a1a" ? "dark" : "light"} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerFila}>
          <TouchableOpacity onPress={volver} style={styles.btnVolver} accessibilityRole="button">
            <Ionicons name="arrow-back" size={22} color={texto} />
          </TouchableOpacity>
          <View style={styles.headerTextos}>
            <Text style={styles.tituloHeader}>Permisos y protección</Text>
            <Text style={styles.subtituloHeader}>Lo que necesita la app para protegerte</Text>
          </View>
          <View style={styles.headerIcono}>
            <Ionicons name="shield-checkmark" size={22} color={texto} />
          </View>
        </View>
        <View style={styles.resumenFila}>
          <Text style={styles.resumenTexto}>
            {listos}/{total} listos
          </Text>
          <View style={styles.barraFondo}>
            <View style={[styles.barraRelleno, { width: `${porcentaje}%` as `${number}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Los marcados como importantes son necesarios para que tus alertas lleguen. Si Android ya no
          deja preguntar, el botón abre los ajustes de AlertaMujer.
        </Text>

        {cargando && <ActivityIndicator color={theme.contactAccent} style={{ marginTop: 24 }} />}

        {!cargando &&
          items.map((item) => {
            const listo = !!item.estado?.concedido;
            return (
              <View key={item.id} style={[styles.tarjeta, !listo && styles.tarjetaInactiva]}>
                <View style={styles.filaTitulo}>
                  <View style={styles.iconoWrap}>
                    <MaterialIcons name={item.icono as never} size={22} color={theme.contactAccent} />
                  </View>
                  <View style={styles.tituloWrap}>
                    <Text style={styles.tituloMetodo}>{item.titulo}</Text>
                    {item.critico && !listo && (
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#C026D3" }}>Importante</Text>
                    )}
                  </View>
                  <View style={[styles.chipEstado, listo && styles.chipEstadoActivo]}>
                    <Text style={[styles.chipTexto, listo && styles.chipTextoActivo]}>
                      {listo ? "Activo" : "Falta"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.descripcionMetodo}>{item.descripcion}</Text>
                {!listo && (
                  <TouchableOpacity
                    onPress={() => activar(item.id)}
                    accessibilityRole="button"
                    style={{
                      marginTop: 12,
                      alignSelf: "flex-start",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 16,
                      paddingVertical: 9,
                      borderRadius: 20,
                      backgroundColor: theme.contactAccent,
                    }}
                  >
                    <MaterialIcons
                      name={item.estado?.puedePreguntar === false ? "settings" : "check-circle"}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
                      {item.estado?.puedePreguntar === false ? "Abrir ajustes" : "Activar"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}
