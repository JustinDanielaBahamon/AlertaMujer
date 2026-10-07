import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Claves de AsyncStorage para cada interruptor
const STORAGE_KEY_VIDEO = "alertamujer_grabar_video";
const STORAGE_KEY_AUDIO = "alertamujer_grabar_audio";

type EvidenciaContextValue = {
  // true = al activar una emergencia se graba video con la cámara (por defecto activado)
  grabarVideo: boolean;
  setGrabarVideo: (valor: boolean) => void;
  // true = al activar una emergencia se graba audio con el micrófono (por defecto activado)
  grabarAudio: boolean;
  setGrabarAudio: (valor: boolean) => void;
  // true cuando ya se leyeron los valores guardados en el teléfono
  cargado: boolean;
};

const EvidenciaContext = createContext<EvidenciaContextValue | null>(null);

export function EvidenciaProvider({ children }: { children: React.ReactNode }) {
  const [grabarVideo, setGrabarVideoState] = useState<boolean>(true);
  const [grabarAudio, setGrabarAudioState] = useState<boolean>(true);
  const [cargado, setCargado] = useState(false);

  // Al abrir la app, lee lo que la usuaria dejó guardado
  useEffect(() => {
    (async () => {
      try {
        const [rawVideo, rawAudio] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_VIDEO),
          AsyncStorage.getItem(STORAGE_KEY_AUDIO),
        ]);
        if (rawVideo !== null) setGrabarVideoState(rawVideo === "true");
        if (rawAudio !== null) setGrabarAudioState(rawAudio === "true");
      } catch (e) {
        console.error("No se pudo leer la preferencia de evidencias:", e);
      } finally {
        setCargado(true);
      }
    })();
  }, []);

  const setGrabarVideo = useCallback((valor: boolean) => {
    setGrabarVideoState(valor);
    AsyncStorage.setItem(STORAGE_KEY_VIDEO, String(valor)).catch((e) =>
      console.error("No se pudo guardar la preferencia de video:", e),
    );
  }, []);

  const setGrabarAudio = useCallback((valor: boolean) => {
    setGrabarAudioState(valor);
    AsyncStorage.setItem(STORAGE_KEY_AUDIO, String(valor)).catch((e) =>
      console.error("No se pudo guardar la preferencia de audio:", e),
    );
  }, []);

  const value = useMemo(
    () => ({ grabarVideo, setGrabarVideo, grabarAudio, setGrabarAudio, cargado }),
    [grabarVideo, setGrabarVideo, grabarAudio, setGrabarAudio, cargado],
  );

  return <EvidenciaContext.Provider value={value}>{children}</EvidenciaContext.Provider>;
}

// Uso: const { grabarVideo, grabarAudio } = useEvidencia();
export function useEvidencia() {
  const ctx = useContext(EvidenciaContext);
  if (!ctx) {
    throw new Error("useEvidencia debe usarse dentro de EvidenciaProvider");
  }
  return ctx;
}