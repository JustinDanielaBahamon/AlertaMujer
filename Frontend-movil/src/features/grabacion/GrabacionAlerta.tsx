import { MaterialIcons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme, type AppTheme } from "../../contexts/ThemeContext";
import { SEGUNDOS_POR_TROZO, useGrabacionAlerta } from "./useGrabacionAlerta";

const NEON = "#C026D3";

const TEXTO_MODO = {
  video: "Grabando video y audio",
  audio: "Grabando audio",
  pausada: "Grabación en pausa",
  sin_permiso: "Falta el permiso de micrófono",
} as const;

/** Tarjeta "Evidencia" de la alerta activa: vista de la cámara, estado y lo que ya se subió. */
export default function GrabacionAlerta({ alertaId }: { alertaId: number | null }) {
  const { theme } = useTheme();
  const s = useMemo(() => crearEstilos(theme), [theme]);
  const g = useGrabacionAlerta(alertaId);
  const grabando = g.modo === "video" || g.modo === "audio";
  const pulso = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!grabando) return;
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [grabando, pulso]);

  const { subidos, pendientes } = g.subidas;
  const textoSubidas =
    subidos === 0 && pendientes === 0
      ? `Cada ${SEGUNDOS_POR_TROZO} s se envía lo grabado a la nube para tus contactos.`
      : `${subidos} ${subidos === 1 ? "parte enviada" : "partes enviadas"} a tus contactos` +
        (pendientes > 0 ? ` · ${pendientes} por enviar` : "");

  return (
    <View style={s.tarjeta}>
      <View style={s.encabezado}>
        <MaterialIcons name="videocam" size={20} color={theme.contactAccent} />
        <Text style={s.titulo}>Evidencia</Text>
        <View style={s.estado}>
          <Animated.View style={[s.punto, !grabando && s.puntoApagado, { opacity: grabando ? pulso : 1 }]} />
          <Text style={s.estadoTexto}>{TEXTO_MODO[g.modo]}</Text>
        </View>
      </View>

      {g.mostrarCamara && (
        <View style={s.camaraMarco}>
          <CameraView
            ref={g.camaraRef}
            style={s.camara}
            mode="video"
            facing={g.frontal ? "front" : "back"}
            videoQuality="480p"
            mute={g.sinSonido}
            onCameraReady={g.alListaCamara}
            onMountError={g.alFallarCamara}
          />
        </View>
      )}

      <Text style={s.detalle}>{textoSubidas}</Text>
      {grabando && <Text style={s.nota}>Si apagas la pantalla o sales de la app, se sigue grabando el audio.</Text>}
      {!!g.error && <Text style={s.error}>{g.error}</Text>}

      <View style={s.botones}>
        {g.modo === "sin_permiso" ? (
          <TouchableOpacity style={[s.boton, s.botonPrincipal]} onPress={g.darPermiso} activeOpacity={0.85}>
            <MaterialIcons name="mic" size={18} color="#FFFFFF" />
            <Text style={s.botonPrincipalTexto}>Dar permiso</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.boton, g.encendida ? s.botonSecundario : s.botonPrincipal]}
            onPress={g.alternar}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name={g.encendida ? "pause" : "fiber-manual-record"}
              size={18}
              color={g.encendida ? theme.contactAccent : "#FFFFFF"}
            />
            <Text style={g.encendida ? s.botonSecundarioTexto : s.botonPrincipalTexto}>
              {g.encendida ? "Pausar" : "Grabar"}
            </Text>
          </TouchableOpacity>
        )}
        {g.mostrarCamara && (
          <TouchableOpacity style={[s.boton, s.botonSecundario]} onPress={g.cambiarCamara} activeOpacity={0.85}>
            <MaterialIcons name="flip-camera-android" size={18} color={theme.contactAccent} />
            <Text style={s.botonSecundarioTexto}>Cambiar cámara</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const crearEstilos = (theme: AppTheme) =>
  StyleSheet.create({
    tarjeta: { marginTop: 16, padding: 14, borderRadius: 18, backgroundColor: theme.containerBackground },
    encabezado: { flexDirection: "row", alignItems: "center", gap: 8 },
    titulo: { fontSize: 16, fontWeight: "700", color: theme.text },
    estado: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
    punto: { width: 10, height: 10, borderRadius: 5, backgroundColor: NEON },
    puntoApagado: { backgroundColor: theme.contactSubtext },
    estadoTexto: { fontSize: 12, fontWeight: "700", color: theme.contactAccent, flexShrink: 1 },
    camaraMarco: { marginTop: 12, height: 200, borderRadius: 14, overflow: "hidden", backgroundColor: "#000000" },
    camara: { flex: 1 },
    detalle: { marginTop: 10, fontSize: 13, color: theme.text },
    nota: { marginTop: 4, fontSize: 12, color: theme.contactSubtext },
    error: { marginTop: 6, fontSize: 12, fontWeight: "600", color: "#A21CAF" },
    botones: { flexDirection: "row", gap: 8, marginTop: 12 },
    boton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 22,
    },
    botonPrincipal: { backgroundColor: theme.contactAccent },
    botonPrincipalTexto: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
    botonSecundario: { borderWidth: 1, borderColor: `${theme.contactAccent}55`, backgroundColor: `${theme.contactAccent}12` },
    botonSecundarioTexto: { fontSize: 14, fontWeight: "700", color: theme.contactAccent },
  });
