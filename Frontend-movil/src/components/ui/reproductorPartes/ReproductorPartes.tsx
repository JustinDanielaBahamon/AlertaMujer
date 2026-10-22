import { MaterialIcons } from "@expo/vector-icons";
import { ResizeMode, Video, type AVPlaybackStatus } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ParteGrabacion = {
  id: number;
  creada: Date;
  fuente: { uri: string; headers?: Record<string, string> };
};

const dos = (n: number) => String(n).padStart(2, "0");
const hora = (d: Date) => `${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;

/**
 * Reproduce las partes de una grabación una tras otra, como si fueran un solo archivo (la app sube
 * el video y el audio en trozos de ~45 s). Los botones numerados permiten saltar a cualquier parte.
 */
export default function ReproductorPartes({
  partes,
  tipo,
  color,
}: {
  partes: ParteGrabacion[];
  tipo: "video" | "audio";
  color: string;
}) {
  const [indice, setIndice] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const reproducirAlCargar = useRef(false);
  const actual = partes[Math.min(indice, partes.length - 1)];

  useEffect(() => {
    setCargando(true);
    setError(false);
  }, [actual?.id]);

  if (!actual) return null;

  const alCambiarEstado = (s: AVPlaybackStatus) => {
    if (!s.isLoaded) {
      if (s.error) setError(true);
      return;
    }
    if (cargando) setCargando(false);
    if (s.didJustFinish && indice < partes.length - 1) {
      reproducirAlCargar.current = true; // la siguiente parte empieza sola
      setIndice(indice + 1);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <View style={tipo === "audio" ? estilos.medioAudio : estilos.medio}>
        {tipo === "audio" && <MaterialIcons name="graphic-eq" size={48} color={color} style={estilos.iconoAudio} />}
        <Video
          key={actual.id}
          source={actual.fuente}
          style={tipo === "audio" ? estilos.videoAudio : StyleSheet.absoluteFill}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay={reproducirAlCargar.current}
          onPlaybackStatusUpdate={alCambiarEstado}
          onError={() => setError(true)}
        />
        {cargando && !error && <ActivityIndicator color="#fff" style={estilos.centro} />}
        {error && <Text style={[estilos.centro, estilos.error]}>No se pudo cargar esta parte</Text>}
      </View>

      {partes.length > 1 && (
        <View style={estilos.partes}>
          {partes.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => {
                reproducirAlCargar.current = true;
                setIndice(i);
              }}
              style={[estilos.parte, { borderColor: color }, i === indice && { backgroundColor: color }]}
              accessibilityLabel={`Parte ${i + 1}`}
            >
              <Text style={[estilos.parteTexto, { color: i === indice ? "#fff" : color }]}>{i + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Text style={[estilos.pie, { color }]}>
        {partes.length > 1 ? `Parte ${indice + 1} de ${partes.length} · ` : ""}
        {hora(actual.creada)}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 10 },
  medio: { width: "100%", aspectRatio: 3 / 4, maxHeight: 420, borderRadius: 14, overflow: "hidden", backgroundColor: "#000" },
  medioAudio: { width: "100%", height: 150, borderRadius: 14, overflow: "hidden", backgroundColor: "#1d1030", justifyContent: "flex-end" },
  iconoAudio: { position: "absolute", alignSelf: "center", top: 30 },
  videoAudio: { width: "100%", height: 60 },
  centro: { position: "absolute", alignSelf: "center", top: "45%" },
  error: { color: "#fff", fontSize: 13 },
  partes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  parte: { minWidth: 42, height: 42, borderRadius: 12, borderWidth: 1.5, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  parteTexto: { fontSize: 15, fontWeight: "800" },
  pie: { fontSize: 12, fontWeight: "600" },
});
