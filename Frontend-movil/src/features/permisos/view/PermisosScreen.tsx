import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createMetodosActivacionStyles, obtenerColoresHeader } from "../../settings/styles/metodosActivacion.styles";
import { usePermisosViewModel } from "../usePermisosViewModel";

/** "Permisos y protección": qué falta para que una alerta funcione y un botón para activarlo. */
export default function PermisosScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createMetodosActivacionStyles(theme), [theme]);
  const { texto } = obtenerColoresHeader(theme);
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const { items, listos, total, cargando, activar, salud, evidencias, volver } = usePermisosViewModel();
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

        {/* Protección sin interrupciones: comprobado con los cierres que registra Android */}
        {!cargando && salud && (
          <View style={styles.tarjeta}>
            <View style={styles.filaTitulo}>
              <View style={styles.iconoWrap}>
                <MaterialIcons
                  name={salud.veces === 0 ? "verified-user" : "report"}
                  size={22}
                  color={salud.veces === 0 ? theme.contactAccent : "#C026D3"}
                />
              </View>
              <View style={styles.tituloWrap}>
                <Text style={styles.tituloMetodo}>
                  {salud.veces === 0
                    ? "Protección sin interrupciones"
                    : `La protección se detuvo ${salud.veces} ${salud.veces === 1 ? "vez" : "veces"}`}
                </Text>
                <Text style={{ fontSize: 12, color: theme.contactSubtext }}>Últimos 7 días</Text>
              </View>
            </View>
            {salud.explicacion ? (
              <>
                <Text style={[styles.descripcionMetodo, { fontWeight: "700" }]}>{salud.explicacion.titulo}</Text>
                <Text style={styles.descripcionMetodo}>{salud.explicacion.arreglo}</Text>
              </>
            ) : (
              <Text style={styles.descripcionMetodo}>
                Tu teléfono no ha cerrado la protección. Lo revisamos cada vez que abres esta pantalla.
              </Text>
            )}
            {salud.puedeArreglar && (
              <TouchableOpacity
                onPress={salud.arreglar}
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
                <MaterialIcons name="autorenew" size={16} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Permitir inicio automático</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!cargando &&
          items.map((item) => {
            const listo = item.estado?.concedido === true;
            const sinVerificar = item.estado?.concedido === null;
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
                      {listo ? "Activo" : sinVerificar ? "Revisar" : "Falta"}
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
                      name={item.estado?.puedePreguntar === false || sinVerificar ? "settings" : "check-circle"}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
                      {item.estado?.puedePreguntar === false || sinVerificar ? "Abrir ajuste" : "Activar"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

        {/* Evidencias automáticas: qué se graba al activar una alerta */}
        {!cargando && (
          <>
            <Text style={[styles.intro, { fontWeight: "800", letterSpacing: 1.2, fontSize: 12, marginTop: 8 }]}>
              {t.permisos.seccion_evidencias}
            </Text>
            <Text style={styles.intro}>{t.permisos.seccion_evidencias_desc}</Text>
            {[
              { id: "video", icono: "videocam", titulo: t.ajustes.grabar_video, desc: t.ajustes.grabar_video_desc, estado: evidencias.video, cambiar: evidencias.cambiarVideo },
              { id: "audio", icono: "mic", titulo: t.ajustes.grabar_audio, desc: t.ajustes.grabar_audio_desc, estado: evidencias.audio, cambiar: evidencias.cambiarAudio },
            ].map((g) => (
              <View key={g.id} style={[styles.tarjeta, !g.estado.activo && styles.tarjetaInactiva]}>
                <View style={styles.filaTitulo}>
                  <View style={styles.iconoWrap}>
                    <MaterialIcons name={g.icono as never} size={22} color={theme.contactAccent} />
                  </View>
                  <View style={styles.tituloWrap}>
                    <Text style={styles.tituloMetodo}>{g.titulo}</Text>
                    {g.estado.sinPermiso && (
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#C026D3" }}>{t.permisos.sin_permiso_grabacion}</Text>
                    )}
                  </View>
                  <Switch
                    value={g.estado.activo}
                    onValueChange={g.cambiar}
                    trackColor={{ false: "#ccc", true: theme.contactAccent }}
                    thumbColor="#fff"
                  />
                </View>
                <Text style={styles.descripcionMetodo}>{g.desc}</Text>
                {g.estado.sinPermiso && (
                  <TouchableOpacity
                    onPress={() => g.cambiar(true)}
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
                    <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
                    <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Activar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
