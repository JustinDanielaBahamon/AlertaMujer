import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";
import { createMetodosActivacionStyles } from "../styles/metodosActivacion.styles";
import { useMetodosActivacionViewModel } from "../viewModel/useMetodosActivacionViewModel";

export default function MetodosActivacionScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createMetodosActivacionStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { metodos, volver } = useMetodosActivacionViewModel();

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={volver} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Metodos de activación</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Ademas del boton principal de alerta, puedes activar una alerta
          usando estos metodos alternativos. Conócelos para reaccionar más
          rapido en caso de necesitarlo.
        </Text>

        {metodos.map((metodo) => (
          <View key={metodo.id} style={styles.tarjeta}>
            <View style={styles.filaTitulo}>
              <View style={styles.iconoWrap}>
                <Ionicons
                  name={metodo.icono as any}
                  size={22}
                  color={theme.icono}
                />
              </View>
              <Text style={styles.tituloMetodo}>{metodo.titulo}</Text>
            </View>

            <Text style={styles.descripcionMetodo}>{metodo.descripcion}</Text>

            {metodo.pasos.map((paso, index) => (
              <View key={index} style={styles.pasoFila}>
                <View style={styles.pasoNumero}>
                  <Text style={styles.pasoNumeroTexto}>{index + 1}</Text>
                </View>
                <Text style={styles.pasoTexto}>{paso.texto}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.notaWrap}>
          <Ionicons name="information-circle-outline" size={18} color={theme.icono} />
          <Text style={styles.notaTexto}>
            Muy pronto se añadirán mas formas de activacion rápida. Esta
            seccion se actualizara de forma automatica cuando esten disponibles.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}