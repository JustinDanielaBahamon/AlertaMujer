import { Camera, type CameraView } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";

import SensorSacudidas from "../../../modules/sensor-sacudidas";
import { useEvidencia } from "../../contexts/EvidenciaContext";
import { enColaDePermisos } from "../../services/permisosSeguros";
import { asignarAlertaDelAudio, encolarTrozo, escucharSubidas, procesarCola, type EstadoSubidas } from "./colaSubidas";

/** Largo de cada trozo: lo grabado se sube cada 45 s, así se pierde poco si le quitan el teléfono. */
export const SEGUNDOS_POR_TROZO = 45;
/** Trozos más cortos (al cambiar de cámara, al volver a la app...) no aportan nada: se descartan. */
export const MINIMO_TROZO_MS = 3000;
/** Si la cámara no avisa que está lista en este tiempo, se sigue solo con audio. */
const ESPERA_CAMARA_MS = 6000;

type Permisos = { camara: boolean; micro: boolean; puedePreguntar: boolean };

/**
 * Grabación automática de evidencia durante la alerta activa.
 *
 * Con la app en pantalla graba video con sonido (cámara); al minimizarla o apagar la pantalla,
 * Android no deja usar la cámara y sigue solo el audio con el servicio nativo de micrófono.
 * Lo que se graba en Ajustes (video, audio o ambos) decide el modo; el botón la pausa o reanuda.
 */
export function useGrabacionAlerta(alertaId: number | null) {
  const { grabarVideo, grabarAudio, cargado } = useEvidencia();
  // null = la usuaria no tocó el botón: se sigue lo elegido en Ajustes
  const [elegida, setElegida] = useState<boolean | null>(null);
  const [permisos, setPermisos] = useState<Permisos | null>(null);
  const [enPantalla, setEnPantalla] = useState(AppState.currentState === "active");
  const [servicioListo, setServicioListo] = useState(false);
  const [camaraLista, setCamaraLista] = useState(false);
  const [videoFallo, setVideoFallo] = useState(false);
  const [frontal, setFrontal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subidas, setSubidas] = useState<EstadoSubidas>({ subidos: 0, pendientes: 0, subiendo: false });
  const camaraRef = useRef<CameraView>(null);

  // Si apagó las dos en Ajustes pero toca "Grabar", se graba video con sonido
  const conVideo = grabarVideo || !grabarAudio;
  const conAudio = grabarAudio || !grabarVideo;
  const encendida = elegida ?? (grabarVideo || grabarAudio);
  const activa = !!alertaId && cargado && encendida;
  const puedeVideo = conVideo && !!permisos?.camara && !!permisos?.micro && !videoFallo;
  const grabandoVideo = activa && servicioListo && puedeVideo && enPantalla && camaraLista;

  useEffect(() => escucharSubidas(setSubidas), []);
  useEffect(() => {
    void procesarCola();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (estado) => setEnPantalla(estado === "active"));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = SensorSacudidas.addListener("onErrorGrabacion", ({ mensaje }) => setError(mensaje));
    return () => sub.remove();
  }, []);

  // Permisos: se piden al empezar a grabar (de uno en uno, ver permisosSeguros)
  const pedirPermisos = useCallback(async () => {
    let micro = await Camera.getMicrophonePermissionsAsync();
    if (!micro.granted && micro.canAskAgain) {
      micro = await enColaDePermisos(() => Camera.requestMicrophonePermissionsAsync());
    }
    let camara = await Camera.getCameraPermissionsAsync();
    if (conVideo && !camara.granted && camara.canAskAgain) {
      camara = await enColaDePermisos(() => Camera.requestCameraPermissionsAsync());
    }
    setPermisos({
      camara: camara.granted,
      micro: micro.granted,
      puedePreguntar: micro.canAskAgain && (camara.canAskAgain || !conVideo),
    });
  }, [conVideo]);

  useEffect(() => {
    if (activa && permisos === null) {
      pedirPermisos().catch((e) => {
        console.warn("No se pudieron pedir los permisos de grabación:", e);
        setPermisos({ camara: false, micro: false, puedePreguntar: false });
      });
    }
  }, [activa, permisos, pedirPermisos]);

  // Servicio de micrófono: se enciende con la app abierta y queda encendido toda la alerta, para
  // poder seguir grabando audio cuando se minimiza o se apaga la pantalla
  useEffect(() => {
    if (!activa || !permisos?.micro || !alertaId) return;
    asignarAlertaDelAudio(alertaId);
    const grabarYa = conAudio && !(puedeVideo && AppState.currentState === "active");
    if (!SensorSacudidas.iniciarGrabacionAudio(SEGUNDOS_POR_TROZO, grabarYa)) {
      setError("No se pudo encender el micrófono");
      return;
    }
    setError(null);
    setServicioListo(true);
    return () => {
      setServicioListo(false);
      SensorSacudidas.detenerGrabacionAudio();
    };
    // puedeVideo solo decide cómo arranca; los cambios después los maneja el efecto del video
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activa, permisos?.micro, alertaId, conAudio]);

  // Video en trozos mientras la app está en pantalla; el micrófono del servicio queda en pausa
  useEffect(() => {
    if (!grabandoVideo || !alertaId) return;
    let vivo = true;
    (async () => {
      SensorSacudidas.pausarGrabacionAudio();
      await SensorSacudidas.esperar(400); // que el servicio suelte el micrófono antes de la cámara
      while (vivo) {
        try {
          const inicio = Date.now();
          const video = await camaraRef.current?.recordAsync({ maxDuration: SEGUNDOS_POR_TROZO });
          if (!video) break;
          if (video.uri && Date.now() - inicio >= MINIMO_TROZO_MS) {
            void encolarTrozo({ uri: video.uri, alertaId, tipo: "video" });
          } else if (video.uri) {
            SensorSacudidas.borrarArchivo(video.uri);
          }
        } catch (e) {
          if (vivo) {
            console.warn("No se pudo grabar video, se sigue con audio:", e);
            setVideoFallo(true);
          }
          break;
        }
      }
    })();
    return () => {
      vivo = false;
      camaraRef.current?.stopRecording();
      // El audio lo retoma el efecto de abajo solo si ya no se va a grabar video
    };
  }, [grabandoVideo, alertaId, frontal]);

  const mostrarCamara = activa && servicioListo && puedeVideo && enPantalla;

  // La vista de la cámara se desmonta al minimizar: al volver hay que esperar que esté lista otra vez
  useEffect(() => {
    if (!mostrarCamara) setCamaraLista(false);
  }, [mostrarCamara]);

  // Sin video (minimizada, sin permiso o la cámara falló) sigue el audio. Mientras la cámara se
  // prepara o cambia de lado no: dejaría trocitos de audio de 1–2 segundos.
  useEffect(() => {
    if (activa && servicioListo && conAudio && !mostrarCamara) SensorSacudidas.reanudarGrabacionAudio();
  }, [activa, servicioListo, conAudio, mostrarCamara]);

  // Si la cámara nunca avisa que está lista, se sigue solo con audio en vez de quedarse sin grabar
  useEffect(() => {
    if (!mostrarCamara || camaraLista) return;
    const t = setTimeout(() => setVideoFallo(true), ESPERA_CAMARA_MS);
    return () => clearTimeout(t);
  }, [mostrarCamara, camaraLista]);

  // Al cambiar de cámara, la nueva avisa cuando está lista
  const cambiarCamara = useCallback(() => {
    setCamaraLista(false);
    setFrontal((f) => !f);
  }, []);

  const alternar = useCallback(() => {
    setVideoFallo(false);
    setElegida(!encendida);
  }, [encendida]);

  const darPermiso = useCallback(async () => {
    if (permisos && !permisos.puedePreguntar) {
      await Linking.openSettings();
      return;
    }
    await pedirPermisos();
  }, [permisos, pedirPermisos]);

  const sinPermiso = activa && permisos !== null && !permisos.micro;
  const modo: "video" | "audio" | "pausada" | "sin_permiso" = !activa
    ? "pausada"
    : sinPermiso
      ? "sin_permiso"
      : grabandoVideo
        ? "video"
        : servicioListo && conAudio
          ? "audio"
          : "pausada";

  return {
    modo,
    encendida,
    // La vista de la cámara se monta cuando corresponde grabar video (aunque aún no esté lista)
    mostrarCamara,
    camaraRef,
    frontal,
    sinSonido: !conAudio,
    alListaCamara: () => setCamaraLista(true),
    alFallarCamara: () => setVideoFallo(true),
    cambiarCamara,
    alternar,
    darPermiso,
    subidas,
    error,
  };
}
