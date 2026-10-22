import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  createMetodosActivacionStyles,
  obtenerColoresHeader,
} from "../styles/metodosActivacion.styles";
import { useMetodosActivacionViewModel } from "../viewModel/useMetodosActivacionViewModel";

export default function MetodosActivacionScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createMetodosActivacionStyles(theme), [theme]);
  const { texto } = obtenerColoresHeader(theme);
  const insets = useSafeAreaInsets();
  const { metodos, activos, total, cambiarMetodo, volver } =
    useMetodosActivacionViewModel();
  const m = t.metodosActivacion;

  const porcentaje = total > 0 ? Math.round((activos / total) * 100) : 0;

  // Íconos de la barra de estado claros u oscuros según el color del header
  const estiloBarraEstado = texto === "#1a1a1a" ? "dark" : "light";

  return (
    <View style={styles.contenedor}>
      <StatusBar style={estiloBarraEstado} />

      {/* Header (mismo color que la barra lateral) */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerFila}>
          <TouchableOpacity
            onPress={volver}
            style={styles.btnVolver}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color={texto} />
          </TouchableOpacity>

          <View style={styles.headerTextos}>
            <Text style={styles.tituloHeader}>{m.titulo_header}</Text>
            <Text style={styles.subtituloHeader}>{m.subtitulo_header}</Text>
          </View>

          <View style={styles.headerIcono}>
            <Ionicons name="flash" size={22} color={texto} />
          </View>
        </View>

        <View style={styles.resumenFila}>
          <Text style={styles.resumenTexto}>
            {activos}/{total} {m.resumen_activos}
          </Text>
          <View style={styles.barraFondo}>
            <View
              style={[
                styles.barraRelleno,
                { width: `${porcentaje}%` as `${number}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{m.intro}</Text>

        {metodos.map((metodo) => (
          <View
            key={metodo.id}
            style={[styles.tarjeta, !metodo.activo && styles.tarjetaInactiva]}
          >
            <View style={styles.filaTitulo}>
              <View style={styles.iconoWrap}>
                <Ionicons
                  name={metodo.icono as any}
                  size={22}
                  color={theme.icono}
                />
              </View>

              <View style={styles.tituloWrap}>
                <Text style={styles.tituloMetodo}>{metodo.titulo}</Text>
                <View
                  style={[
                    styles.chipEstado,
                    metodo.activo && styles.chipEstadoActivo,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipTexto,
                      metodo.activo && styles.chipTextoActivo,
                    ]}
                  >
                    {metodo.activo ? m.estado_activo : m.estado_inactivo}
                  </Text>
                </View>
              </View>

              <Switch
                value={metodo.activo}
                onValueChange={(valor) => cambiarMetodo(metodo.id, valor)}
                trackColor={{ false: "#ccc", true: theme.icono }}
                thumbColor="#fff"
              />
            </View>

            <Text style={styles.descripcionMetodo}>{metodo.descripcion}</Text>

            <View style={metodo.activo ? styles.pasos : styles.pasosInactivos}>
              {metodo.pasos.map((paso, index) => (
                <View key={index} style={styles.pasoFila}>
                  <View style={styles.pasoNumero}>
                    <Text style={styles.pasoNumeroTexto}>{index + 1}</Text>
                  </View>
                  <Text style={styles.pasoTexto}>{paso.texto}</Text>
                </View>
              ))}
            </View>

            {(!!metodo.recomendacionMarca || !!metodo.recomendaciones?.length) && (
              <View style={styles.recomendacionesWrap}>
                <View style={styles.recomendacionesTituloFila}>
                  <Ionicons name="bulb-outline" size={16} color={theme.icono} />
                  <Text style={styles.recomendacionesTitulo}>{m.recomendaciones_titulo}</Text>
                </View>
                {!!metodo.recomendacionMarca && (
                  <View style={styles.recomendacionMarca}>
                    <Ionicons name="warning-outline" size={16} color="#b45309" />
                    <Text style={styles.recomendacionMarcaTexto}>{metodo.recomendacionMarca}</Text>
                  </View>
                )}
                {metodo.recomendaciones?.map((texto, i) => (
                  <View key={i} style={styles.recomendacionFila}>
                    <Text style={styles.recomendacionVineta}>•</Text>
                    <Text style={styles.recomendacionTexto}>{texto}</Text>
                  </View>
                ))}
              </View>
            )}

            {!!metodo.accion && (
              <TouchableOpacity
                style={styles.accionMetodo}
                onPress={metodo.accion.alPresionar}
                accessibilityRole="button"
              >
                <Ionicons name={metodo.accion.icono as never} size={18} color="#fff" />
                <Text style={styles.accionMetodoTexto}>{metodo.accion.texto}</Text>
              </TouchableOpacity>
            )}

            {metodo.pendiente && (
              <View style={styles.avisoWrap}>
                <Ionicons
                  name="construct-outline"
                  size={16}
                  color={theme.icono}
                />
                <Text style={styles.avisoTexto}>{m.aviso_pendiente}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.notaWrap}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={theme.icono}
          />
          <Text style={styles.notaTexto}>{m.nota}</Text>
        </View>
      </ScrollView>
    </View>
  );
}