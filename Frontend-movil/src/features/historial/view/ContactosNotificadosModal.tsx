import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme, type AppTheme } from "../../../contexts/ThemeContext";
import type { CanalNotificacion, ContactoNotificado } from "../../../services/alerts.service";

type Props = {
  visible: boolean;
  onCerrar: () => void;
  contactos: ContactoNotificado[];
  cargando: boolean;
  error: boolean;
};

// Color e ícono de cada estado de envío.
// Solo la paleta de la app (violetas y neón); el ícono distingue cada estado
export const ESTADOS: Record<string, { color: string; icono: keyof typeof MaterialIcons.glyphMap }> = {
  delivered: { color: "#7B1DB2", icono: "check-circle" },
  sent: { color: "#9333EA", icono: "send" },
  pending: { color: "#A855F7", icono: "schedule" },
  failed: { color: "#C026D3", icono: "error" },
  expired: { color: "#757575", icono: "timer-off" },
};

export const ICONO_CANAL: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  email: "email",
  push: "notifications-active",
};

/** Tarjeta con los contactos avisados en una alerta; cada contacto se despliega con sus canales. */
export default function ContactosNotificadosModal({ visible, onCerrar, contactos, cargando, error }: Props) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => crearEstilos(theme), [theme]);
  const [abierto, setAbierto] = useState<number | null>(null);

  const textoCanal = (canal: string) =>
    canal === "email" ? t.detalle.canal_email : canal === "push" ? t.detalle.canal_push : canal;

  const textoEstado = (estado: string) =>
    ({
      pending: t.detalle.estado_pending,
      sent: t.detalle.estado_sent,
      delivered: t.detalle.estado_delivered,
      failed: t.detalle.estado_failed,
      expired: t.detalle.estado_expired,
    })[estado] ?? estado;

  const filaCanal = (canal: CanalNotificacion, i: number) => {
    const estado = ESTADOS[canal.status] ?? ESTADOS.pending;
    return (
      <View key={`${canal.channel}-${i}`} style={styles.canal}>
        <MaterialIcons name={ICONO_CANAL[canal.channel] ?? "chat"} size={20} color={theme.contactAccent} />
        <View style={styles.canalTextos}>
          <Text style={styles.canalNombre}>{textoCanal(canal.channel)}</Text>
          {canal.destination ? (
            <Text style={styles.canalDestino} numberOfLines={1}>
              {canal.destination}
            </Text>
          ) : null}
        </View>
        <View style={[styles.estado, { backgroundColor: `${estado.color}1A`, borderColor: estado.color }]}>
          <MaterialIcons name={estado.icono} size={14} color={estado.color} />
          <Text style={[styles.estadoTexto, { color: estado.color }]}>{textoEstado(canal.status)}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={styles.fondo} onPress={onCerrar}>
        <Pressable style={styles.tarjeta} onPress={() => {}}>
          <View style={styles.encabezado}>
            <MaterialIcons name="groups" size={22} color={theme.contactAccent} />
            <Text style={styles.titulo}>{t.detalle.notificados_titulo}</Text>
            <TouchableOpacity onPress={onCerrar} accessibilityRole="button" accessibilityLabel={t.detalle.cerrar}>
              <MaterialIcons name="close" size={22} color={theme.contactSubtext} />
            </TouchableOpacity>
          </View>

          {cargando ? (
            <ActivityIndicator style={styles.cargando} color={theme.contactAccent} />
          ) : error ? (
            <Text style={styles.mensaje}>{t.detalle.notificados_error}</Text>
          ) : contactos.length === 0 ? (
            <Text style={styles.mensaje}>{t.detalle.notificados_vacio}</Text>
          ) : (
            <>
              <Text style={styles.ayuda}>{t.detalle.notificados_ayuda}</Text>
              <ScrollView style={styles.lista}>
                {contactos.map((c) => {
                  const desplegado = abierto === c.contactId;
                  return (
                    <View key={c.contactId} style={styles.contacto}>
                      <TouchableOpacity
                        style={styles.contactoFila}
                        onPress={() => setAbierto(desplegado ? null : c.contactId)}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: desplegado }}
                      >
                        <View style={styles.avatar}>
                          <Text style={styles.avatarTexto}>{(c.name || "?").charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.contactoTextos}>
                          <Text style={styles.contactoNombre}>{c.name}</Text>
                          {c.relationship ? <Text style={styles.contactoRelacion}>{c.relationship}</Text> : null}
                        </View>
                        <MaterialIcons
                          name={desplegado ? "expand-less" : "expand-more"}
                          size={24}
                          color={theme.contactSubtext}
                        />
                      </TouchableOpacity>
                      {desplegado && <View style={styles.canales}>{c.channels.map(filaCanal)}</View>}
                    </View>
                  );
                })}
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const crearEstilos = (theme: AppTheme) =>
  StyleSheet.create({
    fondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 },
    tarjeta: { backgroundColor: theme.card, borderRadius: 18, padding: 18, maxHeight: "80%" },
    encabezado: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
    titulo: { flex: 1, fontSize: 18, fontWeight: "700", color: theme.text },
    ayuda: { fontSize: 13, color: theme.contactSubtext, marginBottom: 12 },
    mensaje: { fontSize: 14, color: theme.contactSubtext, paddingVertical: 16, lineHeight: 20 },
    cargando: { paddingVertical: 24 },
    lista: { flexGrow: 0 },
    contacto: {
      backgroundColor: theme.containerBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.contactCardBorder,
      marginBottom: 10,
      overflow: "hidden",
    },
    contactoFila: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.contactBadgeBg,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarTexto: { fontSize: 16, fontWeight: "700", color: theme.contactBadgeText },
    contactoTextos: { flex: 1 },
    contactoNombre: { fontSize: 15, fontWeight: "600", color: theme.text },
    contactoRelacion: { fontSize: 12, color: theme.contactSubtext, marginTop: 2, textTransform: "capitalize" },
    canales: { borderTopWidth: 1, borderTopColor: theme.contactDivider, paddingHorizontal: 12, paddingVertical: 6 },
    canal: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 10 },
    canalTextos: { flex: 1 },
    canalNombre: { fontSize: 14, color: theme.text },
    canalDestino: { fontSize: 12, color: theme.contactSubtext, marginTop: 1 },
    estado: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    estadoTexto: { fontSize: 12, fontWeight: "600" },
  });
