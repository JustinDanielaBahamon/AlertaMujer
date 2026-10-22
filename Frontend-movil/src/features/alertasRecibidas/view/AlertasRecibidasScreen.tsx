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
const hora = (d: Date) => {
  const h = d.getHours();
  return `${h % 12 || 12}:${dos(d.getMinutes())} ${h < 12 ? "a. m." : "p. m."}`;
};
const mismoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function duracion(inicio: Date | null, fin: Date | null): string | null {
  if (!inicio || !fin) return null;
  const minutos = Math.max(1, Math.round((fin.getTime() - inicio.getTime()) / 60000));
  if (minutos < 60) return `${minutos} min`;
  return `${Math.floor(minutos / 60)} h ${dos(minutos % 60)} min`;
}

const inicial = (nombre: string) => (nombre.trim().charAt(0) || "?").toUpperCase();

export default function AlertasRecibidasScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const r = t.alertasRecibidas;
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const vm = useAlertasRecibidasViewModel();
  const accent = theme.icono;

  // Anteriores agrupadas por día: "Hoy", "Ayer" o la fecha
  const grupos = useMemo(() => {
    const hoy = new Date();
    const ayer = new Date(hoy.getTime() - 86400000);
    const mapa = new Map<string, AlertaRecibida[]>();
    for (const a of vm.anteriores) {
      const d = a.inicio ?? new Date(0);
      const clave = mismoDia(d, hoy)
        ? r.hoy
        : mismoDia(d, ayer)
          ? r.ayer
          : d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
      mapa.set(clave, [...(mapa.get(clave) ?? []), a]);
    }
    return [...mapa.entries()];
  }, [vm.anteriores, r]);

  const textoEstado = (a: AlertaRecibida) =>
    a.estado === "resolved" ? r.estado_atendida : a.estado === "cancelled" ? r.estado_cancelada : r.estado_terminada;

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
        {/* Qué es esta pantalla: no son las alertas propias */}
        <View style={[local.explicacion, { backgroundColor: "rgba(255,255,255,0.14)" }]}>
          <Ionicons name="people" size={20} color={theme.headerText} />
          <Text style={[local.explicacionTexto, { color: theme.headerText }]}>{r.intro}</Text>
        </View>

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

        {/* En curso: tarjeta de emergencia grande */}
        {vm.activas.map((a) => {
          const nombre = a.nombre || r.un_contacto;
          return (
            <View key={a.id} style={[local.emergencia, { backgroundColor: accent }]}>
              <View style={local.filaEmergencia}>
                <View style={local.avatarEmergencia}>
                  <Text style={[local.avatarTexto, { color: accent }]}>{inicial(nombre)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={local.enVivo}>
                    <View style={local.puntoVivo} />
                    <Text style={local.enVivoTexto}>{r.estado_activa}</Text>
                  </View>
                  <Text style={local.nombreEmergencia} numberOfLines={1}>{nombre}</Text>
                  <Text style={local.textoEmergencia}>
                    {r.pide_ayuda}
                    {a.inicio ? ` · ${r.desde} ${hora(a.inicio)}` : ""}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => vm.abrir(a)}
                disabled={vm.abriendo === a.id}
                style={local.botonEmergencia}
                accessibilityRole="button"
              >
                {vm.abriendo === a.id ? (
                  <ActivityIndicator size="small" color={accent} />
                ) : (
                  <Ionicons name="navigate" size={18} color={accent} />
                )}
                <Text style={[local.botonEmergenciaTexto, { color: accent }]}>{r.ver_ubicacion}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Vacío */}
        {!vm.cargando && !vm.error && vm.activas.length === 0 && vm.anteriores.length === 0 && (
          <View style={[styles.tarjeta, local.vacio]}>
            <View style={[local.iconoVacio, { backgroundColor: accent + "22" }]}>
              <Ionicons name="shield-checkmark-outline" size={34} color={accent} />
            </View>
            <Text style={[styles.titulo, { flex: 0, textAlign: "center" }]}>{r.vacio_titulo}</Text>
            <Text style={[styles.descripcion, { textAlign: "center" }]}>{r.vacio_desc}</Text>
          </View>
        )}

        {/* Anteriores por día */}
        {grupos.map(([dia, lista]) => (
          <View key={dia}>
            <Text style={[local.dia, { color: theme.headerText }]}>{dia}</Text>
            <View style={[styles.tarjeta, { paddingVertical: 6 }]}>
              {lista.map((a, i) => {
                const nombre = a.nombre || r.un_contacto;
                const dur = duracion(a.inicio, a.fin);
                return (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => vm.abrir(a)}
                    disabled={!a.seguimientoDisponible || vm.abriendo === a.id}
                    activeOpacity={0.7}
                    style={[local.fila, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: accent + "33" }]}
                  >
                    <View style={[local.avatar, { backgroundColor: accent + "22" }]}>
                      <Text style={[local.avatarTextoChico, { color: accent }]}>{inicial(nombre)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[local.nombre, { color: theme.text }]} numberOfLines={1}>{nombre}</Text>
                      <Text style={[local.meta, { color: theme.text }]}>
                        {a.inicio ? hora(a.inicio) : ""}
                        {dur ? ` · ${r.duro} ${dur}` : ""}
                      </Text>
                    </View>
                    <View style={[local.estado, { borderColor: accent }]}>
                      <Text style={[local.estadoTexto, { color: accent }]}>{textoEstado(a)}</Text>
                    </View>
                    {a.seguimientoDisponible ? (
                      vm.abriendo === a.id ? (
                        <ActivityIndicator size="small" color={accent} />
                      ) : (
                        <Ionicons name="chevron-forward" size={18} color={accent} />
                      )
                    ) : (
                      <Ionicons name="lock-closed-outline" size={15} color={theme.text} style={{ opacity: 0.4 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        {vm.anteriores.length > 0 && (
          <Text style={[local.nota, { color: theme.headerText }]}>{r.nota_cerradas}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  explicacion: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 14, padding: 12 },
  explicacionTexto: { flex: 1, fontSize: 13, lineHeight: 19 },
  emergencia: { borderRadius: 20, padding: 16, gap: 14 },
  filaEmergencia: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarEmergencia: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  avatarTexto: { fontSize: 22, fontWeight: "900" },
  enVivo: { flexDirection: "row", alignItems: "center", gap: 6 },
  puntoVivo: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  enVivoTexto: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },
  nombreEmergencia: { color: "#fff", fontSize: 19, fontWeight: "900", marginTop: 2 },
  textoEmergencia: { color: "#fff", fontSize: 13, opacity: 0.9, marginTop: 1 },
  botonEmergencia: { flexDirection: "row", gap: 8, height: 46, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  botonEmergenciaTexto: { fontSize: 15, fontWeight: "800" },
  boton: { marginTop: 12, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20 },
  botonTexto: { color: "#fff", fontWeight: "700", fontSize: 13 },
  dia: { fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", opacity: 0.9, marginTop: 6, marginBottom: 8 },
  fila: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarTextoChico: { fontSize: 16, fontWeight: "800" },
  nombre: { fontSize: 14, fontWeight: "700" },
  meta: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  estado: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  estadoTexto: { fontSize: 11, fontWeight: "800" },
  vacio: { alignItems: "center", paddingVertical: 28 },
  iconoVacio: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  nota: { fontSize: 12, opacity: 0.75, textAlign: "center", marginTop: 4 },
});
