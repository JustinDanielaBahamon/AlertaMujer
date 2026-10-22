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

export type MetodoId = "boton" | "contacto" | "agitar" | "encendido" | "bloqueo" | "widget";
export type ConfigMetodos = Record<MetodoId, boolean>;

// Botón y alerta a un contacto vienen activos; los demás los enciende la usuaria
const CONFIG_POR_DEFECTO: ConfigMetodos = {
  boton: true,
  contacto: true,
  agitar: false,
  encendido: false,
  bloqueo: false,
  widget: false,
};

type ContextValue = {
  config: ConfigMetodos;
  cambiar: (id: MetodoId, valor: boolean) => void;
  cargado: boolean;
};

const MetodosActivacionContext = createContext<ContextValue | null>(null);

export function MetodosActivacionProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ConfigMetodos>(CONFIG_POR_DEFECTO);
  const [cargado, setCargado] = useState(false);

  // Al abrir la app, lee lo que la usuaria dejó guardado
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setConfig({ ...CONFIG_POR_DEFECTO, ...JSON.parse(raw) });
      } catch (e) {
        console.error("No se pudo leer los métodos de activación:", e);
      } finally {
        setCargado(true);
      }
    })();
  }, []);

  // Guarda cada cambio (solo después de haber leído lo guardado)
  useEffect(() => {
    if (!cargado) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config)).catch((e) =>
      console.error("No se pudo guardar los métodos de activación:", e),
    );
  }, [config, cargado]);

  const cambiar = useCallback((id: MetodoId, valor: boolean) => {
    setConfig((prev) => ({ ...prev, [id]: valor }));
  }, []);

  const value = useMemo(() => ({ config, cambiar, cargado }), [config, cambiar, cargado]);

  return (
    <MetodosActivacionContext.Provider value={value}>
      {children}
    </MetodosActivacionContext.Provider>
  );
}

export function useMetodosActivacion() {
  const ctx = useContext(MetodosActivacionContext);
  if (!ctx) {
    throw new Error("useMetodosActivacion debe usarse dentro de MetodosActivacionProvider");
  }
  return ctx;
}