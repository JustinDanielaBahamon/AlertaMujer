import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { URL_DESCARGA_APK } from "../../constants/enlaces";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getAjustesPublicos } from "../../services/settings.service";
import { esVersionAnterior } from "./version";

// "Más tarde" vuelve a avisar al día siguiente
const CLAVE_POSPUESTO = "@alerta_mujer:aviso_version_pospuesto";
const UN_DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Aviso de actualización: si la versión instalada es anterior a la mínima que pide la
 * administración, ofrece descargar el APK nuevo. No bloquea la app: en una emergencia el botón de
 * alerta tiene que seguir funcionando aunque la versión sea vieja. Se monta una vez en App.tsx.
 */
export default function AvisoActualizacion() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocale();
  const v = t.version;
  const [minima, setMinima] = useState<string | null>(null);
  const instalada = Constants.expoConfig?.version ?? null;

  useEffect(() => {
    if (!user?.id) return;
    let activo = true;
    (async () => {
      try {
        const { minAppVersion } = await getAjustesPublicos();
        if (!esVersionAnterior(instalada, minAppVersion)) return;
        const pospuesto = Number(await AsyncStorage.getItem(CLAVE_POSPUESTO).catch(() => null)) || 0;
        if (activo && Date.now() - pospuesto > UN_DIA_MS) setMinima(minAppVersion);
      } catch {
        // Sin conexión: se revisa la próxima vez que se abra la app
      }
    })();
    return () => {
      activo = false;
    };
  }, [user?.id, instalada]);

  const masTarde = () => {
    AsyncStorage.setItem(CLAVE_POSPUESTO, String(Date.now())).catch(() => {});
    setMinima(null);
  };

  const descargar = () => {
    Linking.openURL(URL_DESCARGA_APK).catch(() => {});
    setMinima(null);
  };

  const accent = theme.icono;
  return (
    <Modal visible={!!minima} transparent animationType="fade" onRequestClose={masTarde}>
      <View style={estilos.fondo}>
        <View style={[estilos.tarjeta, { backgroundColor: theme.containerBackground }]}>
          <View style={[estilos.icono, { backgroundColor: accent + "22" }]}>
            <Ionicons name="cloud-download-outline" size={30} color={accent} />
          </View>
          <Text style={[estilos.titulo, { color: theme.text }]}>{v.titulo}</Text>
          <Text style={[estilos.texto, { color: theme.text }]}>{v.texto}</Text>
          <View style={[estilos.versiones, { backgroundColor: accent + "12" }]}>
            <Text style={[estilos.version, { color: theme.text }]}>
              {v.instalada}: <Text style={estilos.negrita}>{instalada}</Text>
            </Text>
            <Text style={[estilos.version, { color: theme.text }]}>
              {v.minima}: <Text style={estilos.negrita}>{minima}</Text>
            </Text>
          </View>
          <Text style={[estilos.nota, { color: theme.text }]}>{v.nota}</Text>
          <TouchableOpacity onPress={descargar} style={[estilos.boton, { backgroundColor: accent }]} accessibilityRole="button">
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text style={estilos.botonTexto}>{v.descargar}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={masTarde} style={estilos.secundario}>
            <Text style={[estilos.secundarioTexto, { color: accent }]}>{v.mas_tarde}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  tarjeta: { borderRadius: 22, padding: 22, alignItems: "center" },
  icono: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  titulo: { fontSize: 18, fontWeight: "800", marginTop: 12, textAlign: "center" },
  texto: { fontSize: 13, lineHeight: 19, opacity: 0.8, textAlign: "center", marginTop: 6 },
  versiones: { alignSelf: "stretch", borderRadius: 12, padding: 10, marginTop: 14, gap: 2 },
  version: { fontSize: 13 },
  negrita: { fontWeight: "800" },
  nota: { fontSize: 12, opacity: 0.7, textAlign: "center", marginTop: 10 },
  boton: { alignSelf: "stretch", flexDirection: "row", gap: 8, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 16 },
  botonTexto: { color: "#fff", fontSize: 15, fontWeight: "800" },
  secundario: { paddingVertical: 12 },
  secundarioTexto: { fontSize: 14, fontWeight: "700" },
});
