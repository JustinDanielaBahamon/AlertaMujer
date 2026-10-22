import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import { useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useEvidence } from "../../contexts/EvidenciaContext";
import { useLocale } from "../../contexts/LocaleContext";
import { inPermissionQueue } from "../../services/permisosSeguros";

/**
 * Interruptores "Grabar video / audio automáticamente al activar una emergencia". Apagar se guarda
 * directo; encender primero pide el permiso (cámara o micrófono) y, si se niega, deja el interruptor
 * apagado y ofrece abrir los ajustes.
 */
export function useAutomaticRecording(onChange?: () => void) {
  const { t } = useLocale();
  const { recordVideo, setRecordVideo, recordAudio, setRecordAudio } = useEvidence();

  const notifyPermissionDenied = useCallback(
    (message: string) => {
      Alert.alert(t.ajustes.permiso_requerido_titulo, message, [
        { text: t.permisos.btn_regresar, style: "cancel" },
        { text: t.ajustes.abrir_ajustes, onPress: () => Linking.openSettings() },
      ]);
    },
    [t],
  );

  const change = useCallback(
    async (
      activate: boolean,
      save: (value: boolean) => void,
      ask: () => Promise<{ granted: boolean }>,
      deniedMessage: string,
    ) => {
      if (!activate) {
        save(false);
        onChange?.();
        return;
      }
      try {
        const permission = await inPermissionQueue(ask);
        if (permission.granted) save(true);
        else notifyPermissionDenied(deniedMessage);
      } catch (e) {
        console.error("Error al pedir permiso de grabación:", e);
      }
      onChange?.();
    },
    [notifyPermissionDenied, onChange],
  );

  const toggleRecordVideo = (activate: boolean) =>
    change(activate, setRecordVideo, () => Camera.requestCameraPermissionsAsync(), t.ajustes.permiso_camara_msg);

  const toggleRecordAudio = (activate: boolean) =>
    change(activate, setRecordAudio, () => Audio.requestPermissionsAsync(), t.ajustes.permiso_microfono_msg);

  return { recordVideo, recordAudio, toggleRecordVideo, toggleRecordAudio };
}
