import { MaterialIcons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { fuenteEvidencia, getEvidenciasDeAlerta, type EvidenciaGuardada } from "../../../services/evidencias.service";

const ICONO: Record<EvidenciaGuardada["tipo"], keyof typeof MaterialIcons.glyphMap> = {
  video: "videocam",
  audio: "mic",
  photo: "photo",
  document: "description",
};

const dos = (n: number) => String(n).padStart(2, "0");
const hora = (d: Date) => `${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;
const tamano = (bytes: number | null) =>
  bytes == null ? "" : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** Videos, audios y fotos que se grabaron durante la alerta, con su reproductor. */
export default function EvidenciasAlerta({ alertaId }: { alertaId: number }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const e = t.detalle;
  const [lista, setLista] = useState<EvidenciaGuardada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [abierta, setAbierta] = useState<EvidenciaGuardada | null>(null);
  const [cargandoMedio, setCargandoMedio] = useState(false);
  const [errorMedio, setErrorMedio] = useState(false);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(false);
    getEvidenciasDeAlerta(alertaId)
      .then(setLista)
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [alertaId]);

  useEffect(cargar, [cargar]);

  const abrir = (ev: EvidenciaGuardada) => {
    setErrorMedio(false);
    setCargandoMedio(true);
    setAbierta(ev);
  };

  // Número de cada evidencia dentro de su tipo: "Video 1", "Video 2"... (se graban por partes)
  const etiqueta = (ev: EvidenciaGuardada) => {
    const n = lista.filter((x) => x.tipo === ev.tipo && x.fecha <= ev.fecha).length;
    const nombre = { video: e.evidencia_video, audio: e.evidencia_audio, photo: e.evidencia_foto, document: e.evidencia_documento }[ev.tipo];
    return `${nombre} ${n}`;
  };

  const conteo = (tipo: EvidenciaGuardada["tipo"]) => lista.filter((x) => x.tipo === tipo).length;

  return (
    <>
      <View style={[local.tarjeta, { backgroundColor: theme.containerBackground }]}>
        {cargando ? (
          <ActivityIndicator size="small" color={theme.contactAccent} />
        ) : error ? (
          <TouchableOpacity onPress={cargar} style={local.filaVacia}>
            <MaterialIcons name="refresh" size={18} color={theme.contactAccent} />
            <Text style={[local.texto, { color: theme.contactSubtext }]}>{e.evidencias_error}</Text>
          </TouchableOpacity>
        ) : lista.length === 0 ? (
          <View style={local.filaVacia}>
            <MaterialIcons name="videocam-off" size={18} color={theme.contactSubtext} />
            <Text style={[local.texto, { color: theme.contactSubtext }]}>{e.evidencias_vacio}</Text>
          </View>
        ) : (
          <>
            <View style={local.resumen}>
              {(["video", "audio", "photo"] as const)
                .filter((tipo) => conteo(tipo) > 0)
                .map((tipo) => (
                  <View key={tipo} style={[local.chip, { backgroundColor: `${theme.contactAccent}1A` }]}>
                    <MaterialIcons name={ICONO[tipo]} size={14} color={theme.contactAccent} />
                    <Text style={[local.chipTexto, { color: theme.contactAccent }]}>{conteo(tipo)}</Text>
                  </View>
                ))}
            </View>
            {lista.map((ev) => (
              <TouchableOpacity
                key={ev.id}
                style={local.fila}
                onPress={() => abrir(ev)}
                disabled={!ev.tieneArchivo || ev.tipo === "document"}
                accessibilityRole="button"
              >
                <View style={[local.icono, { backgroundColor: theme.contactAccent }]}>
                  <MaterialIcons name={ICONO[ev.tipo]} size={18} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[local.titulo, { color: theme.text }]}>{etiqueta(ev)}</Text>
                  <Text style={[local.texto, { color: theme.contactSubtext }]}>
                    {hora(ev.fecha)}
                    {ev.tamanoBytes != null ? ` · ${tamano(ev.tamanoBytes)}` : ""}
                    {!ev.tieneArchivo ? ` · ${e.evidencia_sin_archivo}` : ""}
                  </Text>
                </View>
                {ev.tieneArchivo && ev.tipo !== "document" && (
                  <MaterialIcons name={ev.tipo === "photo" ? "zoom-in" : "play-circle-filled"} size={28} color={theme.contactAccent} />
                )}
              </TouchableOpacity>
            ))}
            <Text style={[local.nota, { color: theme.contactSubtext }]}>{e.evidencias_nota}</Text>
          </>
        )}
      </View>

      <Modal visible={!!abierta} transparent animationType="fade" onRequestClose={() => setAbierta(null)}>
        <Pressable style={local.fondo} onPress={() => setAbierta(null)}>
          <Pressable style={local.visor}>
            {abierta && (
              <>
                <View style={local.visorCabecera}>
                  <Text style={local.visorTitulo}>{etiqueta(abierta)}</Text>
                  <TouchableOpacity onPress={() => setAbierta(null)} accessibilityLabel={t.modal.cerrar}>
                    <MaterialIcons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={abierta.tipo === "audio" ? local.medioAudio : local.medio}>
                  {abierta.tipo === "photo" ? (
                    <Image
                      source={fuenteEvidencia(abierta.id)}
                      style={StyleSheet.absoluteFill}
                      resizeMode="contain"
                      onLoadEnd={() => setCargandoMedio(false)}
                      onError={() => {
                        setCargandoMedio(false);
                        setErrorMedio(true);
                      }}
                    />
                  ) : (
                    <>
                      {abierta.tipo === "audio" && (
                        <MaterialIcons name="graphic-eq" size={56} color="#d8b4fe" style={local.iconoAudio} />
                      )}
                      <Video
                        source={fuenteEvidencia(abierta.id)}
                        style={abierta.tipo === "audio" ? local.videoAudio : StyleSheet.absoluteFill}
                        resizeMode={ResizeMode.CONTAIN}
                        useNativeControls
                        shouldPlay
                        onLoad={() => setCargandoMedio(false)}
                        onError={() => {
                          setCargandoMedio(false);
                          setErrorMedio(true);
                        }}
                      />
                    </>
                  )}
                  {cargandoMedio && !errorMedio && <ActivityIndicator color="#fff" style={local.centro} />}
                  {errorMedio && <Text style={[local.centro, local.errorMedio]}>{e.evidencia_error_reproducir}</Text>}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const local = StyleSheet.create({
  tarjeta: { borderRadius: 18, padding: 14, gap: 10, marginBottom: 16 },
  filaVacia: { flexDirection: "row", alignItems: "center", gap: 8 },
  resumen: { flexDirection: "row", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipTexto: { fontSize: 12, fontWeight: "800" },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  icono: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  titulo: { fontSize: 14, fontWeight: "700" },
  texto: { fontSize: 12 },
  nota: { fontSize: 11, marginTop: 2 },
  fondo: { flex: 1, backgroundColor: "rgba(10,4,20,0.88)", justifyContent: "center", padding: 16 },
  visor: { borderRadius: 18, overflow: "hidden", backgroundColor: "#12081f" },
  visorCabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  visorTitulo: { color: "#fff", fontSize: 15, fontWeight: "700" },
  medio: { width: "100%", aspectRatio: 9 / 12, backgroundColor: "#000" },
  medioAudio: { width: "100%", height: 200, backgroundColor: "#1d1030", justifyContent: "flex-end" },
  iconoAudio: { position: "absolute", alignSelf: "center", top: 48 },
  videoAudio: { width: "100%", height: 70 },
  centro: { position: "absolute", alignSelf: "center", top: "45%" },
  errorMedio: { color: "#fff", textAlign: "center", paddingHorizontal: 24 },
});
