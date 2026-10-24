import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "alertamujer_metodos_activacion";

export type MethodId = "boton" | "contacto" | "agitar" | "encendido" | "bloqueo" | "widget";
export type MethodsConfig = Record<MethodId, boolean>;

// Removed methods: the power button gave false alarms and conflicts with Android, and the lock screen
// pop-up was never finished. Whoever had them on gets them turned off.
const REMOVED: Partial<MethodsConfig> = { encendido: false, bloqueo: false };

// Button and alert to a contact start enabled; the user turns on the others
const DEFAULT_CONFIG: MethodsConfig = {
  boton: true,
  contacto: true,
  agitar: false,
  encendido: false,
  bloqueo: false,
  widget: false,
};

type ContextValue = {
  config: MethodsConfig;
  change: (id: MethodId, value: boolean) => void;
  loaded: boolean;
};

const ActivationMethodsContext = createContext<ContextValue | null>(null);

export function ActivationMethodsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<MethodsConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  // When the app opens, read what the user saved
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(raw), ...REMOVED });
      } catch (e) {
        console.error("No se pudo leer los métodos de activación:", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save every change (only after the saved values were read)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config)).catch((e) =>
      console.error("No se pudo guardar los métodos de activación:", e),
    );
  }, [config, loaded]);

  const change = useCallback((id: MethodId, value: boolean) => {
    setConfig((prev) => ({ ...prev, [id]: value }));
  }, []);

  const value = useMemo(() => ({ config, change: change, loaded: loaded }), [config, change, loaded]);

  return (
    <ActivationMethodsContext.Provider value={value}>
      {children}
    </ActivationMethodsContext.Provider>
  );
}

export function useActivationMethods() {
  const ctx = useContext(ActivationMethodsContext);
  if (!ctx) {
    throw new Error("useMetodosActivacion debe usarse dentro de MetodosActivacionProvider");
  }
  return ctx;
}