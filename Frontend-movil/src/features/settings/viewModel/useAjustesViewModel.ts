import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import { useState } from "react";
import { Alert, Linking } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import { AppLocale, useLocale } from "../../../contexts/LocaleContext";
import { useEvidencia } from "../../../contexts/EvidenciaContext";

// Idiomas disponibles para seleccionar en el modal de idioma
export const OPCIONES_IDIOMA: { code: AppLocale; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
];

export const useAjustesViewModel = () => {
  const { theme, toggleTheme, setMode } = useTheme();
  const { locale, toggleLocale, setLocale, t } = useLocale();
  const { grabarVideo, setGrabarVideo, grabarAudio, setGrabarAudio } = useEvidencia();

  // Controla si el modal de seleccion de idioma esta visible
  const [modalIdiomaVisible, setModalIdiomaVisible] = useState(false);

  // Opciones de recorridos
  const [guardarRecorridos, setGuardarRecorridos] = useState(true);
  const [mostrarRecorridos, setMostrarRecorridos] = useState(true);

  const abrirModalIdioma = () => setModalIdiomaVisible(true);
  const cerrarModalIdioma = () => setModalIdiomaVisible(false);

  const seleccionarIdioma = (nuevoLocale: AppLocale) => {
    setLocale(nuevoLocale);
    cerrarModalIdioma();
  };

  const obtenerTextoIdioma = () => {
    const encontrado = OPCIONES_IDIOMA.find((o) => o.code === locale);
    return encontrado ? encontrado.label : "Español";
  };

  const obtenerIconoTema = () => {
    if (theme.mode === "dark") return `🌙 ${t.ajustes.oscuro}`;
    if (theme.mode === "light") return `☀️ ${t.ajustes.claro}`;
    return `🎨 ${t.ajustes.tema_personalizado}`; // Por si está en rosa/vino
  };

  // Aviso cuando la usuaria niega un permiso: el interruptor se queda apagado
  const avisarPermisoDenegado = (mensaje: string) => {
    Alert.alert(t.ajustes.permiso_requerido_titulo, mensaje, [
      { text: t.permisos.btn_regresar, style: "cancel" },
      { text: t.ajustes.abrir_ajustes, onPress: () => Linking.openSettings() },
    ]);
  };

  // Interruptor "Grabar video automáticamente al activar una emergencia" (cámara)
  // Apagar: se guarda directo. Encender: primero pide el permiso de cámara.
  const cambiarGrabarVideo = async (activar: boolean) => {
    if (!activar) {
      setGrabarVideo(false);
      return;
    }

    try {
      const camara = await Camera.requestCameraPermissionsAsync();
      if (camara.granted) {
        setGrabarVideo(true);
        return;
      }
      avisarPermisoDenegado(t.ajustes.permiso_camara_msg);
    } catch (e) {
      console.error("Error al pedir permiso de cámara:", e);
    }
  };

  // Interruptor "Grabar audio automáticamente al activar una emergencia" (micrófono)
  // Apagar: se guarda directo. Encender: primero pide el permiso de micrófono.
  const cambiarGrabarAudio = async (activar: boolean) => {
    if (!activar) {
      setGrabarAudio(false);
      return;
    }

    try {
      const microfono = await Audio.requestPermissionsAsync();
      if (microfono.granted) {
        setGrabarAudio(true);
        return;
      }
      avisarPermisoDenegado(t.ajustes.permiso_microfono_msg);
    } catch (e) {
      console.error("Error al pedir permiso de micrófono:", e);
    }
  };

  return {
    theme,
    toggleTheme,
    setMode, // Exportamos esto para los círculos
    locale,
    toggleLocale,
    modalIdiomaVisible,
    abrirModalIdioma,
    cerrarModalIdioma,
    seleccionarIdioma,
    obtenerTextoIdioma,
    obtenerIconoTema,
    guardarRecorridos,
    setGuardarRecorridos,
    mostrarRecorridos,
    setMostrarRecorridos,
    grabarVideo,
    cambiarGrabarVideo,
    grabarAudio,
    cambiarGrabarAudio,
  };
};