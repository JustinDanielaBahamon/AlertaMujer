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

type EvidenceContextValue = {
  // true = al activar una emergencia se graba video con la cámara (por defecto activado)
  recordVideo: boolean;
  setRecordVideo: (value: boolean) => void;
  // true = al activar una emergencia se graba audio con el micrófono (por defecto activado)
  recordAudio: boolean;
  setRecordAudio: (value: boolean) => void;
  // true cuando ya se leyeron los valores guardados en el teléfono
  loaded: boolean;
};

const EvidenceContext = createContext<EvidenceContextValue | null>(null);

export function EvidenceProvider({ children }: { children: React.ReactNode }) {
  const [recordVideo, setRecordVideoState] = useState<boolean>(true);
  const [recordAudio, setRecordAudioState] = useState<boolean>(true);
  const [loaded, setLoaded] = useState(false);

  // Al abrir la app, lee lo que la usuaria dejó guardado
  useEffect(() => {
    (async () => {
      try {
        const [rawVideo, rawAudio] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_VIDEO),
          AsyncStorage.getItem(STORAGE_KEY_AUDIO),
        ]);
        if (rawVideo !== null) setRecordVideoState(rawVideo === "true");
        if (rawAudio !== null) setRecordAudioState(rawAudio === "true");
      } catch (e) {
        console.error("No se pudo leer la preferencia de evidencias:", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setRecordVideo = useCallback((value: boolean) => {
    setRecordVideoState(value);
    AsyncStorage.setItem(STORAGE_KEY_VIDEO, String(value)).catch((e) =>
      console.error("No se pudo guardar la preferencia de video:", e),
    );
  }, []);

  const setRecordAudio = useCallback((value: boolean) => {
    setRecordAudioState(value);
    AsyncStorage.setItem(STORAGE_KEY_AUDIO, String(value)).catch((e) =>
      console.error("No se pudo guardar la preferencia de audio:", e),
    );
  }, []);

  const value = useMemo(
    () => ({ recordVideo: recordVideo, setRecordVideo: setRecordVideo, recordAudio: recordAudio, setRecordAudio: setRecordAudio, loaded: loaded }),
    [recordVideo, setRecordVideo, recordAudio, setRecordAudio, loaded],
  );

  return <EvidenceContext.Provider value={value}>{children}</EvidenceContext.Provider>;
}

// Uso: const { grabarVideo, grabarAudio } = useEvidencia();
export function useEvidence() {
  const ctx = useContext(EvidenceContext);
  if (!ctx) {
    throw new Error("useEvidencia debe usarse dentro de EvidenciaProvider");
  }
  return ctx;
}