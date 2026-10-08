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

export type ConfigNotificaciones = {
  activadas: boolean;
  vibracion: boolean;
  noMolestar: boolean;
  horaInicio: number; // minutos desde medianoche (22:00 = 1320)
  horaFin: number; // minutos desde medianoche (07:00 = 420)
};

const CONFIG_POR_DEFECTO: ConfigNotificaciones = {
  activadas: true,
  vibracion: true,
  noMolestar: false,
  horaInicio: 22 * 60,
  horaFin: 7 * 60,
};

// true si "ahora" cae dentro de las horas silenciosas (soporta rangos que cruzan medianoche)
export function estaEnHorasSilenciosas(
  config: ConfigNotificaciones,
  ahora: Date = new Date(),
): boolean {
  if (!config.noMolestar) return false;
  const { horaInicio, horaFin } = config;
  if (horaInicio === horaFin) return false;
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  if (horaInicio < horaFin) return minutos >= horaInicio && minutos < horaFin;
  return minutos >= horaInicio || minutos < horaFin;
}

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
        if (raw) setConfig({ ...CONFIG_POR_DEFECTO, ...JSON.parse(raw) });
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
