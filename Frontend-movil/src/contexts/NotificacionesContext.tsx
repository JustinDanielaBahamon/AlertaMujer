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
export type NotificationsConfig = {
  vibracion: boolean;
};

const DEFAULT_CONFIG: NotificationsConfig = {
  vibracion: true,
};

type NotificationsContextValue = {
  config: NotificationsConfig;
  update: (partial: Partial<NotificationsConfig>) => void;
  loaded: boolean;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] =
    useState<NotificationsConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  // Al abrir la app, lee lo que la usuaria dejó guardado
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setConfig({ ...DEFAULT_CONFIG, vibracion: JSON.parse(raw).vibracion ?? true });
      } catch (e) {
        console.error("No se pudo leer la configuración de notificaciones:", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Guarda cada cambio (solo después de haber leído lo guardado)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config)).catch((e) =>
      console.error(
        "No se pudo guardar la configuración de notificaciones:",
        e,
      ),
    );
  }, [config, loaded]);

  const update = useCallback((partial: Partial<NotificationsConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const value = useMemo(
    () => ({ config, update: update, loaded: loaded }),
    [config, update, loaded],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// Uso: const { config, actualizar } = useNotificaciones();
export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotificaciones debe usarse dentro de NotificacionesProvider",
    );
  }
  return ctx;
}
