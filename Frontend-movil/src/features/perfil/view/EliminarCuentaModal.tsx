import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { CONFIRMACION_ELIMINAR } from "../../../services/users.service";

type Props = {
  visible: boolean;
  eliminando: boolean;
  error: string | null;
  onConfirmar: (confirmacion: string) => void;
  onCerrar: () => void;
};

/** Confirmación para eliminar la cuenta: explica qué se borra y pide escribir ELIMINAR. */
export default function EliminarCuentaModal({ visible, eliminando, error, onConfirmar, onCerrar }: Props) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const p = t.perfil;
  const [texto, setTexto] = useState("");
  const listo = texto.trim().toUpperCase() === CONFIRMACION_ELIMINAR;
  const accent = theme.icono;

  const cerrar = () => {
    if (eliminando) return;
    setTexto("");
    onCerrar();
  };

  const queSeBorra = [p.eliminar_borra_datos, p.eliminar_borra_contactos, p.eliminar_borra_ubicaciones, p.eliminar_borra_grabaciones];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cerrar}>
      <View style={estilos.fondo}>
        <View style={[estilos.tarjeta, { backgroundColor: theme.containerBackground }]}>
          <View style={[estilos.icono, { backgroundColor: accent + "22" }]}>
            <Ionicons name="trash-outline" size={28} color={accent} />
          </View>
          <Text style={[estilos.titulo, { color: theme.text }]}>{p.eliminar_titulo}</Text>
          <Text style={[estilos.texto, { color: theme.text }]}>{p.eliminar_intro}</Text>

          {queSeBorra.map((linea) => (
            <View key={linea} style={estilos.fila}>
              <Ionicons name="close-circle-outline" size={16} color={accent} />
              <Text style={[estilos.textoFila, { color: theme.text }]}>{linea}</Text>
            </View>
          ))}
          <Text style={[estilos.aviso, { color: theme.text }]}>{p.eliminar_irreversible}</Text>

          <Text style={[estilos.etiqueta, { color: theme.text }]}>
            {p.eliminar_escribe.replace("{palabra}", CONFIRMACION_ELIMINAR)}
          </Text>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!eliminando}
            placeholder={CONFIRMACION_ELIMINAR}
            placeholderTextColor={accent + "60"}
            style={[estilos.input, { borderColor: listo ? accent : accent + "50", color: theme.text }]}
          />
          {!!error && <Text style={[estilos.error, { color: accent }]}>{error}</Text>}

          <TouchableOpacity
            onPress={() => onConfirmar(texto)}
            disabled={!listo || eliminando}
            style={[estilos.boton, { backgroundColor: accent }, (!listo || eliminando) && { opacity: 0.4 }]}
            accessibilityRole="button"
          >
            {eliminando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>{p.eliminar_confirmar}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={cerrar} style={estilos.cancelar} disabled={eliminando}>
            <Text style={[estilos.cancelarTexto, { color: accent }]}>{t.modal.cancelar}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  tarjeta: { borderRadius: 22, padding: 20 },
  icono: { alignSelf: "center", width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  titulo: { fontSize: 18, fontWeight: "800", textAlign: "center", marginTop: 12 },
  texto: { fontSize: 13, lineHeight: 19, opacity: 0.8, textAlign: "center", marginTop: 6, marginBottom: 12 },
  fila: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  textoFila: { flex: 1, fontSize: 13 },
  aviso: { fontSize: 12, fontWeight: "700", marginTop: 8, opacity: 0.85 },
  etiqueta: { fontSize: 13, fontWeight: "600", marginTop: 14 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6, fontSize: 15, fontWeight: "700", letterSpacing: 1 },
  error: { fontSize: 12, fontWeight: "600", marginTop: 8 },
  boton: { marginTop: 16, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  botonTexto: { color: "#fff", fontSize: 15, fontWeight: "800" },
  cancelar: { alignItems: "center", paddingVertical: 12 },
  cancelarTexto: { fontSize: 14, fontWeight: "700" },
});
