import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import { useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useEvidencia } from "../../contexts/EvidenciaContext";
import { useLocale } from "../../contexts/LocaleContext";
import { enColaDePermisos } from "../../services/permisosSeguros";

/**
 * Interruptores "Grabar video / audio automáticamente al activar una emergencia". Apagar se guarda
 * directo; encender primero pide el permiso (cámara o micrófono) y, si se niega, deja el interruptor
 * apagado y ofrece abrir los ajustes.
 */
export function useGrabacionAutomatica(alCambiar?: () => void) {
  const { t } = useLocale();
  const { grabarVideo, setGrabarVideo, grabarAudio, setGrabarAudio } = useEvidencia();

  const avisarPermisoDenegado = useCallback(
    (mensaje: string) => {
      Alert.alert(t.ajustes.permiso_requerido_titulo, mensaje, [
        { text: t.permisos.btn_regresar, style: "cancel" },
        { text: t.ajustes.abrir_ajustes, onPress: () => Linking.openSettings() },
      ]);
    },
    [t],
  );

  const cambiar = useCallback(
    async (
      activar: boolean,
      guardar: (valor: boolean) => void,
      pedir: () => Promise<{ granted: boolean }>,
      mensajeDenegado: string,
    ) => {
      if (!activar) {
        guardar(false);
        alCambiar?.();
        return;
      }
      try {
        const permiso = await enColaDePermisos(pedir);
        if (permiso.granted) guardar(true);
        else avisarPermisoDenegado(mensajeDenegado);
      } catch (e) {
        console.error("Error al pedir permiso de grabación:", e);
      }
      alCambiar?.();
    },
    [avisarPermisoDenegado, alCambiar],
  );

  const cambiarGrabarVideo = (activar: boolean) =>
    cambiar(activar, setGrabarVideo, () => Camera.requestCameraPermissionsAsync(), t.ajustes.permiso_camara_msg);

  const cambiarGrabarAudio = (activar: boolean) =>
    cambiar(activar, setGrabarAudio, () => Audio.requestPermissionsAsync(), t.ajustes.permiso_microfono_msg);

  return { grabarVideo, grabarAudio, cambiarGrabarVideo, cambiarGrabarAudio };
}
