import * as Brightness from "expo-brightness";
import { Camera, type CameraView } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";

import ShakeSensor from "../../../modules/shake-sensor";
import { useEvidence } from "../../contexts/EvidenceContext";
import { inPermissionQueue } from "../../services/safePermissions";
import { setAudioAlert, enqueueChunk, listenUploads, processQueue, type UploadStatus } from "./uploadQueue";

/** Largo de cada trozo: lo grabado se sube cada 45 s, así se pierde poco si le quitan el teléfono. */
export const SECONDS_PER_CHUNK = 45;
/** Trozos más cortos (al cambiar de cámara, al volver a la app...) no aportan nada: se descartan. */
export const MIN_CHUNK_MS = 3000;
/** Si la cámara no avisa que está lista en este tiempo, se sigue solo con audio. */
const CAMERA_WAIT_MS = 6000;

type Permissions = { camera: boolean; microphone: boolean; canAsk: boolean };

/**
 * Grabación automática de evidencia durante la alerta activa.
 *
 * Con la app en pantalla graba video con sonido (cámara); al minimizarla o apagar la pantalla,
 * Android no deja usar la cámara y sigue solo el audio con el servicio nativo de micrófono.
 * Lo que se graba en Ajustes (video, audio o ambos) decide el modo; el botón la pausa o reanuda.
 */
export function useAlertRecording(alertId: number | null) {
  const { recordVideo, recordAudio, loaded } = useEvidence();
  // null = la usuaria no tocó el botón: se sigue lo elegido en Ajustes
  const [chosen, setChosen] = useState<boolean | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [onScreen, setOnScreen] = useState(AppState.currentState === "active");
  const [serviceReady, setServiceReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [frontal, setFrontal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadStatus>({ uploaded: 0, pendingItems: 0, uploading: false });
  const cameraRef = useRef<CameraView>(null);

  // Si apagó las dos en Ajustes pero toca "Grabar", se graba video con sonido
  const conVideo = recordVideo || !recordAudio;
  const conAudio = recordAudio || !recordVideo;
  const turnedOn = chosen ?? (recordVideo || recordAudio);
  const active = !!alertId && loaded && turnedOn;
  const canVideo = conVideo && !!permissions?.camera && !!permissions?.microphone && !videoFailed;
  const recordingVideo = active && serviceReady && canVideo && onScreen && cameraReady;

  useEffect(() => listenUploads(setUploads), []);
  useEffect(() => {
    void processQueue();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => setOnScreen(status === "active"));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = ShakeSensor.addListener("onRecordingError", ({ message: message }) => setError(message));
    return () => sub.remove();
  }, []);

  // Permisos: se piden al empezar a grabar (de uno en uno, ver permisosSeguros)
  const requestPermissions = useCallback(async () => {
    let microphone = await Camera.getMicrophonePermissionsAsync();
    if (!microphone.granted && microphone.canAskAgain) {
      microphone = await inPermissionQueue(() => Camera.requestMicrophonePermissionsAsync());
    }
    let camera = await Camera.getCameraPermissionsAsync();
    if (conVideo && !camera.granted && camera.canAskAgain) {
      camera = await inPermissionQueue(() => Camera.requestCameraPermissionsAsync());
    }
    setPermissions({
      camera: camera.granted,
      microphone: microphone.granted,
      canAsk: microphone.canAskAgain && (camera.canAskAgain || !conVideo),
    });
  }, [conVideo]);

  useEffect(() => {
    if (active && permissions === null) {
      requestPermissions().catch((e) => {
        console.warn("No se pudieron pedir los permisos de grabación:", e);
        setPermissions({ camera: false, microphone: false, canAsk: false });
      });
    }
  }, [active, permissions, requestPermissions]);

  // Servicio de micrófono: se enciende con la app abierta y queda encendido toda la alerta, para
  // poder seguir grabando audio cuando se minimiza o se apaga la pantalla
  useEffect(() => {
    if (!active || !permissions?.microphone || !alertId) return;
    setAudioAlert(alertId);
    const recordNow = conAudio && !(canVideo && AppState.currentState === "active");
    if (!ShakeSensor.startAudioRecording(SECONDS_PER_CHUNK, recordNow)) {
      setError("No se pudo encender el micrófono");
      return;
    }
    setError(null);
    setServiceReady(true);
    return () => {
      setServiceReady(false);
      ShakeSensor.stopAudioRecording();
    };
    // puedeVideo solo decide cómo arranca; los cambios después los maneja el efecto del video
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, permissions?.microphone, alertId, conAudio]);

  // Video en trozos mientras la app está en pantalla; el micrófono del servicio queda en pausa
  useEffect(() => {
    if (!recordingVideo || !alertId) return;
    let alive = true;
    (async () => {
      ShakeSensor.pauseAudioRecording();
      await ShakeSensor.wait(400); // que el servicio suelte el micrófono antes de la cámara
      while (alive) {
        try {
          const startTime = Date.now();
          const video = await cameraRef.current?.recordAsync({ maxDuration: SECONDS_PER_CHUNK });
          if (!video) break;
          if (video.uri && Date.now() - startTime >= MIN_CHUNK_MS) {
            void enqueueChunk({ uri: video.uri, alertaId: alertId, tipo: "video" });
          } else if (video.uri) {
            ShakeSensor.deleteFile(video.uri);
          }
        } catch (e) {
          if (alive) {
            console.warn("No se pudo grabar video, se sigue con audio:", e);
            setVideoFailed(true);
          }
          break;
        }
      }
    })();
    return () => {
      alive = false;
      cameraRef.current?.stopRecording();
      // El audio lo retoma el efecto de abajo solo si ya no se va a grabar video
    };
  }, [recordingVideo, alertId, frontal]);

  const showCamera = active && serviceReady && canVideo && onScreen;

  // La cámara frontal casi no tiene luz y el video salía muy oscuro: mientras graba con ella, la
  // pantalla se pone al máximo para iluminar la cara. Al cambiar de cámara o terminar, se restaura.
  useEffect(() => {
    if (!recordingVideo || !frontal) return;
    Brightness.setBrightnessAsync(1).catch(() => {});
    return () => {
      Brightness.restoreSystemBrightnessAsync().catch(() => {});
    };
  }, [recordingVideo, frontal]);

  // La vista de la cámara se desmonta al minimizar: al volver hay que esperar que esté lista otra vez
  useEffect(() => {
    if (!showCamera) setCameraReady(false);
  }, [showCamera]);

  // Sin video (minimizada, sin permiso o la cámara falló) sigue el audio. Mientras la cámara se
  // prepara o cambia de lado no: dejaría trocitos de audio de 1–2 segundos.
  useEffect(() => {
    if (active && serviceReady && conAudio && !showCamera) ShakeSensor.resumeAudioRecording();
  }, [active, serviceReady, conAudio, showCamera]);

  // Si la cámara nunca avisa que está lista, se sigue solo con audio en vez de quedarse sin grabar
  useEffect(() => {
    if (!showCamera || cameraReady) return;
    const t = setTimeout(() => setVideoFailed(true), CAMERA_WAIT_MS);
    return () => clearTimeout(t);
  }, [showCamera, cameraReady]);

  // Al cambiar de cámara, la nueva avisa cuando está lista
  const switchCamera = useCallback(() => {
    setCameraReady(false);
    setFrontal((f) => !f);
  }, []);

  const toggle = useCallback(() => {
    setVideoFailed(false);
    setChosen(!turnedOn);
  }, [turnedOn]);

  const givePermission = useCallback(async () => {
    if (permissions && !permissions.canAsk) {
      await Linking.openSettings();
      return;
    }
    await requestPermissions();
  }, [permissions, requestPermissions]);

  const noPermission = active && permissions !== null && !permissions.microphone;
  const mode: "video" | "audio" | "pausada" | "sin_permiso" = !active
    ? "pausada"
    : noPermission
      ? "sin_permiso"
      : recordingVideo
        ? "video"
        : serviceReady && conAudio
          ? "audio"
          : "pausada";

  return {
    mode: mode,
    turnedOn: turnedOn,
    // La vista de la cámara se monta cuando corresponde grabar video (aunque aún no esté lista)
    showCamera: showCamera,
    cameraRef: cameraRef,
    frontal,
    muted: !conAudio,
    onCameraReady: () => setCameraReady(true),
    onCameraError: () => setVideoFailed(true),
    switchCamera: switchCamera,
    toggle: toggle,
    givePermission: givePermission,
    uploads: uploads,
    error,
  };
}
