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

// Emergency alerts cannot be silenced: the only choice is whether the phone vibrates
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

  // When the app opens, read what the user saved
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

  // Save every change (only after the saved values were read)
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

// Usage: const { config, update } = useNotifications();
export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotificaciones debe usarse dentro de NotificacionesProvider",
    );
  }
  return ctx;
}
