import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const STORAGE_KEY = "alertamujer_notificaciones";

// Las alertas de emergencia no se pueden silenciar: solo se elige si el celular vibra
export type ConfigNotificaciones = {
  vibracion: boolean;
};

const CONFIG_POR_DEFECTO: ConfigNotificaciones = {
  vibracion: true,
};

type NotificacionesContextValue = {
  config: ConfigNotificaciones;
  actualizar: (parcial: Partial<ConfigNotificaciones>) => void;
  cargado: boolean;
};

const NotificacionesContext = createContext<NotificacionesContextValue | null>(
  null,
);

export function NotificacionesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] =
    useState<ConfigNotificaciones>(CONFIG_POR_DEFECTO);
  const [cargado, setCargado] = useState(false);

  // Al abrir la app, lee lo que la usuaria dejó guardado
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setConfig({ ...CONFIG_POR_DEFECTO, vibracion: JSON.parse(raw).vibracion ?? true });
      } catch (e) {
        console.error("No se pudo leer la configuración de notificaciones:", e);
      } finally {
        setCargado(true);
      }
    })();
  }, []);

  // Guarda cada cambio (solo después de haber leído lo guardado)
  useEffect(() => {
    if (!cargado) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config)).catch((e) =>
      console.error(
        "No se pudo guardar la configuración de notificaciones:",
        e,
      ),
    );
  }, [config, cargado]);

  const actualizar = useCallback((parcial: Partial<ConfigNotificaciones>) => {
    setConfig((prev) => ({ ...prev, ...parcial }));
  }, []);

  const value = useMemo(
    () => ({ config, actualizar, cargado }),
    [config, actualizar, cargado],
  );

  return (
    <NotificacionesContext.Provider value={value}>
      {children}
    </NotificacionesContext.Provider>
  );
}

// Uso: const { config, actualizar } = useNotificaciones();
export function useNotificaciones() {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) {
    throw new Error(
      "useNotificaciones debe usarse dentro de NotificacionesProvider",
    );
  }
  return ctx;
}
