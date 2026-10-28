import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme, type AppTheme } from "../../contexts/ThemeContext";
import type { ChatParticipant } from "../../services/alert-chat.service";
import { useAlertChat } from "./useAlertChat";

/** Quick messages from the person who activated the alert: one tap, no typing. */
export const HER_QUICK_REPLIES = [
  "No puedo hablar",
  "Estoy escondida",
  "Llamen a la policía",
  "Me están siguiendo",
  "Estoy en peligro, vengan",
  "Estoy bien, pero no cancelen",
];

/** A contact's quick replies (the same as on the tracking page). */
export const CONTACT_QUICK_REPLIES = [
  "Voy en camino",
  "Ya llamé a la policía",
  "¿Dónde estás?",
  "¿Estás bien?",
  "Mantén la calma, ya vamos",
];

type Props = {
  participant: ChatParticipant | null;
  /** false when the alert ended: it can be read but not written. */
  enabled: boolean;
  /** true if the person viewing the chat is the one who activated the alert. */
  soyElla: boolean;
  /** Name of the person who activated the alert (for her messages seen by a contact). */
  herName?: string;
  title: string;
  quickReplies: string[];
  /** When the text field gets focus (the screen scrolls so the keyboard does not cover it). */
  onFocus?: () => void;
};

export default function AlertChat({ participant, enabled, soyElla, herName, title, quickReplies, onFocus }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const { messages: messages, send: send, sending: sending, error } = useAlertChat(participant, enabled);
  const [text, setText] = useState("");
  const list = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  const submit = async (t: string) => {
    if (await send(t)) setText("");
  };

  return (
    <View style={s.card}>
      <View style={s.title}>
        <MaterialIcons name="forum" size={20} color={theme.contactAccent} />
        <Text style={s.titleText}>{title}</Text>
      </View>

      <ScrollView ref={list} style={s.list} contentContainerStyle={s.listContent} nestedScrollEnabled>
        {messages.length === 0 ? (
          <Text style={s.empty}>
            {soyElla
              ? "Toca un mensaje rápido para avisar a tus contactos sin tener que hablar."
              : "Aún no hay mensajes. Escríbele para que sepa que la estás ayudando."}
          </Text>
        ) : (
          messages.map((m) => {
            const mine = soyElla ? m.deElla : !m.deElla;
            const author = m.deElla ? (soyElla ? "Tú" : herName || m.name) : m.name;
            return (
              <View key={m.id} style={[s.bubble, mine ? s.myBubble : s.otherBubble, m.deElla && !soyElla && s.herBubble]}>
                <Text style={[s.author, (mine || (m.deElla && !soyElla)) && s.lightAuthor]}>
                  {author} · {m.time.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })}
                </Text>
                <Text style={[s.text, (mine || (m.deElla && !soyElla)) && s.lightText]}>{m.text}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {enabled ? (
        <>
          <View style={s.quickReplies}>
            {quickReplies.map((r) => (
              <TouchableOpacity key={r} style={s.quick} disabled={sending} onPress={() => submit(r)} accessibilityRole="button">
                <Text style={s.quickText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.row}>
            <TextInput
              style={s.input}
              placeholder="Escribe un mensaje…"
              placeholderTextColor={theme.contactSubtext}
              value={text}
              onChangeText={setText}
              maxLength={500}
              onSubmitEditing={() => submit(text)}
              returnKeyType="send"
              onFocus={onFocus}
            />
            <TouchableOpacity
              style={[s.send, (!text.trim() || sending) && s.sendWhileOff]}
              disabled={!text.trim() || sending}
              onPress={() => submit(text)}
              accessibilityLabel="Enviar mensaje"
            >
              {sending ? <ActivityIndicator color="#fff" size="small" /> : <MaterialIcons name="send" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
          {!!error && <Text style={s.error}>{error}</Text>}
        </>
      ) : (
        <Text style={s.empty}>El chat se cerró cuando terminó la alerta.</Text>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: { marginTop: 16, padding: 14, borderRadius: 18, backgroundColor: theme.containerBackground },
    title: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    titleText: { fontSize: 16, fontWeight: "700", color: theme.text },
    list: { maxHeight: 260 },
    listContent: { gap: 8, paddingVertical: 4 },
    empty: { fontSize: 13, color: theme.contactSubtext, marginVertical: 6 },
    bubble: { maxWidth: "85%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
    myBubble: { alignSelf: "flex-end", backgroundColor: theme.contactAccent, borderBottomRightRadius: 4 },
    otherBubble: { alignSelf: "flex-start", backgroundColor: `${theme.contactAccent}1F`, borderBottomLeftRadius: 4 },
    herBubble: { backgroundColor: "#7B1DB2" },
    author: { fontSize: 11, fontWeight: "700", color: theme.contactSubtext },
    lightAuthor: { color: "rgba(255,255,255,0.85)" },
    text: { fontSize: 14, marginTop: 2, color: theme.text },
    lightText: { color: "#FFFFFF" },
    quickReplies: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10, marginBottom: 8 },
    quick: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${theme.contactAccent}55`,
      backgroundColor: `${theme.contactAccent}12`,
    },
    quickText: { fontSize: 13, fontWeight: "600", color: theme.contactAccent },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    input: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: `${theme.contactAccent}40`,
      color: theme.text,
      fontSize: 14,
    },
    send: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.contactAccent,
    },
    sendWhileOff: { opacity: 0.5 },
    error: { marginTop: 6, fontSize: 12, fontWeight: "600", color: "#A21CAF" },
  });
