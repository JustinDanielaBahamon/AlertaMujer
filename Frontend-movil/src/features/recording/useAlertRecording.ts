import * as Brightness from "expo-brightness";
import { Camera, type CameraView } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";

import ShakeSensor from "../../../modules/shake-sensor";
import { useEvidence } from "../../contexts/EvidenceContext";
import { inPermissionQueue } from "../../services/safePermissions";
import { setAudioAlert, enqueueChunk, listenUploads, processQueue, type UploadStatus } from "./uploadQueue";

/** Length of each chunk: what is recorded is uploaded every 45 s, so little is lost if the phone is taken away. */
export const SECONDS_PER_CHUNK = 45;
/** Shorter chunks (when switching camera, when returning to the app...) add nothing: they are discarded. */
export const MIN_CHUNK_MS = 3000;
/** If the camera does not report it is ready within this time, it continues with audio only. */
const CAMERA_WAIT_MS = 6000;

type Permissions = { camera: boolean; microphone: boolean; canAsk: boolean };

/**
 * Automatic evidence recording during the active alert.
 *
 * With the app on screen it records video with sound (camera); when it is minimized or the screen turns off,
 * Android does not allow the camera and only audio continues with the native microphone service.
 * What is chosen in Settings (video, audio or both) decides the mode; the button pauses or resumes it.
 */
export function useAlertRecording(alertId: number | null) {
  const { recordVideo, recordAudio, loaded } = useEvidence();
  // null = the user did not touch the button: what was chosen in Settings applies
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

  // If she turned both off in Settings but taps "Record", video with sound is recorded
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

  // Permissions: asked when recording starts (one at a time, see safePermissions)
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

  // Microphone service: it starts with the app open and stays on for the whole alert, so
  // audio can keep recording when the app is minimized or the screen turns off
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
    // canVideo only decides how it starts; later changes are handled by the video effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, permissions?.microphone, alertId, conAudio]);

  // Video in chunks while the app is on screen; the service microphone stays paused
  useEffect(() => {
    if (!recordingVideo || !alertId) return;
    let alive = true;
    (async () => {
      ShakeSensor.pauseAudioRecording();
      await ShakeSensor.wait(400); // let the service release the microphone before the camera
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
      // The effect below resumes the audio only if no more video is going to be recorded
    };
  }, [recordingVideo, alertId, frontal]);

  const showCamera = active && serviceReady && canVideo && onScreen;

  // The front camera has almost no light and the video came out very dark: while recording with it, the
  // screen goes to maximum brightness to light the face. It is restored when switching camera or finishing.
  useEffect(() => {
    if (!recordingVideo || !frontal) return;
    Brightness.setBrightnessAsync(1).catch(() => {});
    return () => {
      Brightness.restoreSystemBrightnessAsync().catch(() => {});
    };
  }, [recordingVideo, frontal]);

  // The camera view is unmounted when minimizing: when coming back we have to wait until it is ready again
  useEffect(() => {
    if (!showCamera) setCameraReady(false);
  }, [showCamera]);

  // Without video (minimized, no permission or the camera failed) audio continues. Not while the camera
  // is getting ready or switching sides: it would leave 1–2 second audio scraps.
  useEffect(() => {
    if (active && serviceReady && conAudio && !showCamera) ShakeSensor.resumeAudioRecording();
  }, [active, serviceReady, conAudio, showCamera]);

  // If the camera never reports it is ready, continue with audio only instead of recording nothing
  useEffect(() => {
    if (!showCamera || cameraReady) return;
    const t = setTimeout(() => setVideoFailed(true), CAMERA_WAIT_MS);
    return () => clearTimeout(t);
  }, [showCamera, cameraReady]);

  // When switching camera, the new one reports when it is ready
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
    // The camera view is mounted when video should be recorded (even if it is not ready yet)
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
