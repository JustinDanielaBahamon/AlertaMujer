import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import type { AlertaRecibida } from "../../../services/received-alerts.service";
import { createAjustesPantallaStyles } from "../../settings/styles/ajustesPantalla.styles";
import { useAlertasRecibidasViewModel } from "../viewModel/useAlertasRecibidasViewModel";

const dos = (n: number) => String(n).padStart(2, "0");
const fechaHora = (d: Date) =>
  `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} · ${dos(d.getHours())}:${dos(d.getMinutes())}`;

function duracion(inicio: Date | null, fin: Date | null): string | null {
  if (!inicio || !fin) return null;
  const minutos = Math.max(1, Math.round((fin.getTime() - inicio.getTime()) / 60000));
  if (minutos < 60) return `${minutos} min`;
  return `${Math.floor(minutos / 60)} h ${dos(minutos % 60)} min`;
}

export default function AlertasRecibidasScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const r = t.alertasRecibidas;
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const vm = useAlertasRecibidasViewModel();
  const accent = theme.icono;

  const textoEstado = (a: AlertaRecibida) =>
    a.activa ? r.estado_activa : a.estado === "resolved" ? r.estado_atendida : a.estado === "cancelled" ? r.estado_cancelada : r.estado_terminada;

  const tarjeta = (a: AlertaRecibida) => {
    const nombre = a.nombre || r.un_contacto;
    const dur = duracion(a.inicio, a.fin);
    const abriendo = vm.abriendo === a.id;
    return (
      <View
        key={a.id}
        style={[styles.tarjeta, a.activa && { borderColor: accent, borderWidth: 2 }]}
      >
        <View style={styles.filaTitulo}>
          <View style={[styles.iconoWrap, a.activa && { backgroundColor: accent }]}>
            <Ionicons name={a.activa ? "alert" : "person-outline"} size={22} color={a.activa ? "#fff" : accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.titulo, { flex: 0 }]} numberOfLines={1}>
              {nombre}
            </Text>
            <Text style={[local.subtitulo, { color: theme.text }]}>
              {a.activa ? r.pide_ayuda : a.estado === "cancelled" ? r.cancelo : r.tuvo_alerta}
            </Text>
          </View>
          <View style={[local.chip, { borderColor: accent }, a.activa && { backgroundColor: accent }]}>
            {a.activa && <View style={local.puntoVivo} />}
            <Text style={[local.chipTexto, { color: a.activa ? "#fff" : accent }]}>{textoEstado(a)}</Text>
          </View>
        </View>

        <View style={local.datos}>
          {a.inicio && (
            <View style={local.dato}>
              <Ionicons name="time-outline" size={14} color={accent} />
              <Text style={[local.datoTexto, { color: theme.text }]}>{fechaHora(a.inicio)}</Text>
            </View>
          )}
          {dur && (
            <View style={local.dato}>
              <Ionicons name="hourglass-outline" size={14} color={accent} />
              <Text style={[local.datoTexto, { color: theme.text }]}>
                {r.duro} {dur}
              </Text>
            </View>
          )}
        </View>

        {a.seguimientoDisponible ? (
          <TouchableOpacity
            onPress={() => vm.abrir(a)}
            disabled={abriendo}
            style={[local.boton, { backgroundColor: accent }]}
            accessibilityRole="button"
          >
            {abriendo ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name={a.activa ? "navigate" : "map-outline"} size={16} color="#fff" />
            )}
            <Text style={local.botonTexto}>{a.activa ? r.ver_ubicacion : r.ver_recorrido}</Text>
          </TouchableOpacity>
        ) : (
          <View style={local.cerrado}>
            <Ionicons name="lock-closed-outline" size={13} color={theme.text} style={{ opacity: 0.6 }} />
            <Text style={[local.cerradoTexto, { color: theme.text }]}>{r.seguimiento_cerrado}</Text>
          </View>
        )}
      </View>
    );
  };

  const vacio = !vm.cargando && !vm.error && vm.activas.length === 0 && vm.anteriores.length === 0;

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      <View style={styles.header}>
        <TouchableOpacity onPress={vm.volver} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>{r.titulo_header}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={vm.recargar} tintColor={theme.headerText} colors={[accent]} />}
      >
        <Text style={styles.intro}>{r.intro}</Text>

        {vm.cargando && <ActivityIndicator color={theme.headerText} style={{ marginTop: 24 }} />}

        {vm.error && (
          <View style={styles.tarjeta}>
            <Text style={[styles.descripcion, { marginTop: 0 }]}>{r.error_carga}</Text>
            <TouchableOpacity onPress={vm.recargar} style={[local.boton, { backgroundColor: accent }]}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={local.botonTexto}>{r.reintentar}</Text>
            </TouchableOpacity>
          </View>
        )}

        {vacio && (
          <View style={[styles.tarjeta, local.vacio]}>
            <View style={[local.iconoVacio, { backgroundColor: accent + "22" }]}>
              <Ionicons name="shield-checkmark-outline" size={34} color={accent} />
            </View>
            <Text style={[styles.titulo, { flex: 0, textAlign: "center" }]}>{r.vacio_titulo}</Text>
            <Text style={[styles.descripcion, { textAlign: "center" }]}>{r.vacio_desc}</Text>
          </View>
        )}

        {vm.activas.length > 0 && (
          <>
            <Text style={[local.seccion, { color: theme.headerText }]}>{r.seccion_activas}</Text>
            {vm.activas.map(tarjeta)}
          </>
        )}

        {vm.anteriores.length > 0 && (
          <>
            <Text style={[local.seccion, { color: theme.headerText }]}>{r.seccion_anteriores}</Text>
            {vm.anteriores.map(tarjeta)}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  subtitulo: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  puntoVivo: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" },
  chipTexto: { fontSize: 11, fontWeight: "800" },
  datos: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 12 },
  dato: { flexDirection: "row", alignItems: "center", gap: 5 },
  datoTexto: { fontSize: 12, opacity: 0.8 },
  boton: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  botonTexto: { color: "#fff", fontWeight: "700", fontSize: 13 },
  cerrado: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  cerradoTexto: { fontSize: 12, opacity: 0.6 },
  seccion: { fontSize: 11, fontWeight: "800", letterSpacing: 1.3, opacity: 0.9, marginTop: 6 },
  vacio: { alignItems: "center", paddingVertical: 28 },
  iconoVacio: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center", marginBottom: 12 },
});
