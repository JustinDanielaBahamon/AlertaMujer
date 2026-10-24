import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme, type AppTheme } from "../../../contexts/ThemeContext";
import type { NotificationChannel, NotifiedContact } from "../../../services/alerts.service";

type Props = {
  visible: boolean;
  onClose: () => void;
  contacts: NotifiedContact[];
  loading: boolean;
  error: boolean;
};

// Color and icon of each delivery status.
// Only the app palette (violets and neon); the icon tells each status apart
export const STATUSES: Record<string, { color: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  // Strong violet and filled: the contact already opened it
  seen: { color: "#4A0080", icon: "visibility" },
  delivered: { color: "#7B1DB2", icon: "done-all" },
  sent: { color: "#9333EA", icon: "send" },
  pending: { color: "#A855F7", icon: "schedule" },
  failed: { color: "#C026D3", icon: "error" },
  expired: { color: "#757575", icon: "timer-off" },
};

export const CHANNEL_ICON: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  email: "email",
  push: "notifications-active",
};

/** Card with the contacts notified in an alert; each contact expands to show its channels. */
export default function NotifiedContactsModal({ visible, onClose, contacts, loading, error }: Props) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [expanded, setExpanded] = useState<number | null>(null);

  const channelLabel = (channel: string) =>
    channel === "email" ? t.detalle.canal_email : channel === "push" ? t.detalle.canal_push : channel;

  const statusLabel = (status: string, channel: string) =>
    ({
      pending: t.detalle.estado_pending,
      sent: t.detalle.estado_sent,
      // For the email "delivered" means she opened it; for the app, that it reached her phone
      delivered: channel === "email" ? t.detalle.estado_delivered_email : t.detalle.estado_delivered,
      seen: t.detalle.estado_seen,
      failed: t.detalle.estado_failed,
      expired: t.detalle.estado_expired,
    })[status] ?? status;

  const hour = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso + (iso.endsWith("Z") || iso.includes("+") ? "" : "Z"));
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
  };

  const channelRow = (channel: NotificationChannel, i: number) => {
    const status = STATUSES[channel.status] ?? STATUSES.pending;
    const seen = channel.status === "seen";
    return (
      <View key={`${channel.channel}-${i}`} style={styles.channel}>
        <MaterialIcons name={CHANNEL_ICON[channel.channel] ?? "chat"} size={20} color={theme.contactAccent} />
        <View style={styles.channelTexts}>
          <Text style={styles.channelName}>{channelLabel(channel.channel)}</Text>
          {channel.destination ? (
            <Text style={styles.channelDestination} numberOfLines={1}>
              {channel.destination}
            </Text>
          ) : null}
          {seen && channel.seenAt ? (
            <Text style={[styles.channelDestination, { color: status.color }]}>
              {t.detalle.vista_a_las.replace("{hora}", hour(channel.seenAt))}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.status,
            seen
              ? { backgroundColor: status.color, borderColor: status.color }
              : { backgroundColor: `${status.color}1A`, borderColor: status.color },
          ]}
        >
          <MaterialIcons name={status.icon} size={14} color={seen ? "#FFFFFF" : status.color} />
          <Text style={[styles.statusText, { color: seen ? "#FFFFFF" : status.color }]}>
            {statusLabel(channel.status, channel.channel)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.background} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.heading}>
            <MaterialIcons name="groups" size={22} color={theme.contactAccent} />
            <Text style={styles.title}>{t.detalle.notificados_titulo}</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel={t.detalle.cerrar}>
              <MaterialIcons name="close" size={22} color={theme.contactSubtext} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loading} color={theme.contactAccent} />
          ) : error ? (
            <Text style={styles.message}>{t.detalle.notificados_error}</Text>
          ) : contacts.length === 0 ? (
            <Text style={styles.message}>{t.detalle.notificados_vacio}</Text>
          ) : (
            <>
              <Text style={styles.help}>{t.detalle.notificados_ayuda}</Text>
              <ScrollView style={styles.list}>
                {contacts.map((c) => {
                  const expandedItem = expanded === c.contactId;
                  return (
                    <View key={c.contactId} style={styles.contact}>
                      <TouchableOpacity
                        style={styles.contactRow}
                        onPress={() => setExpanded(expandedItem ? null : c.contactId)}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: expandedItem }}
                      >
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{(c.name || "?").charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.contactTexts}>
                          <Text style={styles.contactNameText}>{c.name}</Text>
                          {c.relationship ? <Text style={styles.contactRelationship}>{c.relationship}</Text> : null}
                        </View>
                        <MaterialIcons
                          name={expandedItem ? "expand-less" : "expand-more"}
                          size={24}
                          color={theme.contactSubtext}
                        />
                      </TouchableOpacity>
                      {expandedItem && <View style={styles.channels}>{c.channels.map(channelRow)}</View>}
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    background: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 },
    card: { backgroundColor: theme.card, borderRadius: 18, padding: 18, maxHeight: "80%" },
    heading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
    title: { flex: 1, fontSize: 18, fontWeight: "700", color: theme.text },
    help: { fontSize: 13, color: theme.contactSubtext, marginBottom: 12 },
    message: { fontSize: 14, color: theme.contactSubtext, paddingVertical: 16, lineHeight: 20 },
    loading: { paddingVertical: 24 },
    list: { flexGrow: 0 },
    contact: {
      backgroundColor: theme.containerBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.contactCardBorder,
      marginBottom: 10,
      overflow: "hidden",
    },
    contactRow: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.contactBadgeBg,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 16, fontWeight: "700", color: theme.contactBadgeText },
    contactTexts: { flex: 1 },
    contactNameText: { fontSize: 15, fontWeight: "600", color: theme.text },
    contactRelationship: { fontSize: 12, color: theme.contactSubtext, marginTop: 2, textTransform: "capitalize" },
    channels: { borderTopWidth: 1, borderTopColor: theme.contactDivider, paddingHorizontal: 12, paddingVertical: 6 },
    channel: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 10 },
    channelTexts: { flex: 1 },
    channelName: { fontSize: 14, color: theme.text },
    channelDestination: { fontSize: 12, color: theme.contactSubtext, marginTop: 1 },
    status: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    statusText: { fontSize: 12, fontWeight: "600" },
  });
