import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme, type AppTheme } from "../../contexts/ThemeContext";
import type { ParticipanteChat } from "../../services/alert-chat.service";
import { useChatAlerta } from "./useChatAlerta";

/** Mensajes rápidos de quien activó la alerta: un toque, sin tener que escribir. */
export const RAPIDOS_DE_ELLA = [
  "No puedo hablar",
  "Estoy escondida",
  "Llamen a la policía",
  "Me están siguiendo",
  "Estoy en peligro, vengan",
  "Estoy bien, pero no cancelen",
];

/** Respuestas rápidas de un contacto (las mismas de la página de seguimiento). */
export const RAPIDOS_DEL_CONTACTO = [
  "Voy en camino",
  "Ya llamé a la policía",
  "¿Dónde estás?",
  "¿Estás bien?",
  "Mantén la calma, ya vamos",
];

type Props = {
  participante: ParticipanteChat | null;
  /** false cuando la alerta terminó: se puede leer pero no escribir. */
  activo: boolean;
  /** true si quien ve el chat es la persona que activó la alerta. */
  soyElla: boolean;
  /** Nombre de quien activó la alerta (para sus mensajes vistos por un contacto). */
  nombreElla?: string;
  titulo: string;
  rapidos: string[];
};

export default function ChatAlerta({ participante, activo, soyElla, nombreElla, titulo, rapidos }: Props) {
  const { theme } = useTheme();
  const s = useMemo(() => crearEstilos(theme), [theme]);
  const { mensajes, enviar, enviando, error } = useChatAlerta(participante, activo);
  const [texto, setTexto] = useState("");
  const lista = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => lista.current?.scrollToEnd({ animated: true }), 50);
  }, [mensajes.length]);

  const mandar = async (t: string) => {
    if (await enviar(t)) setTexto("");
  };

  return (
    <View style={s.tarjeta}>
      <View style={s.titulo}>
        <MaterialIcons name="forum" size={20} color={theme.contactAccent} />
        <Text style={s.tituloTexto}>{titulo}</Text>
      </View>

      <ScrollView ref={lista} style={s.lista} contentContainerStyle={s.listaContenido} nestedScrollEnabled>
        {mensajes.length === 0 ? (
          <Text style={s.vacio}>
            {soyElla
              ? "Toca un mensaje rápido para avisar a tus contactos sin tener que hablar."
              : "Aún no hay mensajes. Escríbele para que sepa que la estás ayudando."}
          </Text>
        ) : (
          mensajes.map((m) => {
            const mio = soyElla ? m.deElla : !m.deElla;
            const autor = m.deElla ? (soyElla ? "Tú" : nombreElla || m.nombre) : m.nombre;
            return (
              <View key={m.id} style={[s.burbuja, mio ? s.burbujaMia : s.burbujaOtra, m.deElla && !soyElla && s.burbujaElla]}>
                <Text style={[s.autor, (mio || (m.deElla && !soyElla)) && s.autorClaro]}>
                  {autor} · {m.hora.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })}
                </Text>
                <Text style={[s.texto, (mio || (m.deElla && !soyElla)) && s.textoClaro]}>{m.texto}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {activo ? (
        <>
          <View style={s.rapidos}>
            {rapidos.map((r) => (
              <TouchableOpacity key={r} style={s.rapido} disabled={enviando} onPress={() => mandar(r)} accessibilityRole="button">
                <Text style={s.rapidoTexto}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.fila}>
            <TextInput
              style={s.entrada}
              placeholder="Escribe un mensaje…"
              placeholderTextColor={theme.contactSubtext}
              value={texto}
              onChangeText={setTexto}
              maxLength={500}
              onSubmitEditing={() => mandar(texto)}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[s.enviar, (!texto.trim() || enviando) && s.enviarApagado]}
              disabled={!texto.trim() || enviando}
              onPress={() => mandar(texto)}
              accessibilityLabel="Enviar mensaje"
            >
              {enviando ? <ActivityIndicator color="#fff" size="small" /> : <MaterialIcons name="send" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
          {!!error && <Text style={s.error}>{error}</Text>}
        </>
      ) : (
        <Text style={s.vacio}>El chat se cerró cuando terminó la alerta.</Text>
      )}
    </View>
  );
}

const crearEstilos = (theme: AppTheme) =>
  StyleSheet.create({
    tarjeta: { marginTop: 16, padding: 14, borderRadius: 18, backgroundColor: theme.containerBackground },
    titulo: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    tituloTexto: { fontSize: 16, fontWeight: "700", color: theme.text },
    lista: { maxHeight: 260 },
    listaContenido: { gap: 8, paddingVertical: 4 },
    vacio: { fontSize: 13, color: theme.contactSubtext, marginVertical: 6 },
    burbuja: { maxWidth: "85%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
    burbujaMia: { alignSelf: "flex-end", backgroundColor: theme.contactAccent, borderBottomRightRadius: 4 },
    burbujaOtra: { alignSelf: "flex-start", backgroundColor: `${theme.contactAccent}1F`, borderBottomLeftRadius: 4 },
    burbujaElla: { backgroundColor: "#7B1DB2" },
    autor: { fontSize: 11, fontWeight: "700", color: theme.contactSubtext },
    autorClaro: { color: "rgba(255,255,255,0.85)" },
    texto: { fontSize: 14, marginTop: 2, color: theme.text },
    textoClaro: { color: "#FFFFFF" },
    rapidos: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10, marginBottom: 8 },
    rapido: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${theme.contactAccent}55`,
      backgroundColor: `${theme.contactAccent}12`,
    },
    rapidoTexto: { fontSize: 13, fontWeight: "600", color: theme.contactAccent },
    fila: { flexDirection: "row", alignItems: "center", gap: 8 },
    entrada: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: `${theme.contactAccent}40`,
      color: theme.text,
      fontSize: 14,
    },
    enviar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.contactAccent,
    },
    enviarApagado: { opacity: 0.5 },
    error: { marginTop: 6, fontSize: 12, fontWeight: "600", color: "#A21CAF" },
  });
