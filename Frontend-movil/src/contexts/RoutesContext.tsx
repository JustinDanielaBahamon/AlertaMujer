import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { savedRoutesService, SavedRouteApi } from "../services/saved-routes.service";

// Límites por usuaria (los garantiza el backend; aquí solo se usan para la UI)
export const MAX_ROUTES = 4; // recorridos guardados / visibles en el mapa
export const MAX_IMPORTANTES = 2; // rutas marcadas como importantes (estrella)

type GpsPoint = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

type SavedRoute = {
  id: string;
  date: string;
  estimatedTime: string; // Tiempo estimado de viaje
  estimatedDistance: string; // Distancia en km
  startNeighborhood: string;
  endNeighborhood: string;
  municipality: string;
  department: string;
  country: string;
  points: GpsPoint[];
  pointCount: number;
  esManual: boolean; // Para distinguir recorridos manuales de automáticos
  customName?: string; // Para recorridos manuales
  important: boolean; // Para mostrar en el mapa principal
};

export type NewRoute = {
  name: string;
  startTime: string;
  end: string;
  points: GpsPoint[];
  distanceKm: number;
  estimatedMinutes: number;
  municipality?: string;
  department?: string;
  country?: string;
};

export type ActionResult = { ok: boolean; reason?: string };

// Versión anterior: los recorridos vivían solo en este teléfono
const LEGACY_STORAGE_KEY = "alertamujer_recorridos";

type RoutesContextType = {
  routes: SavedRoute[];
  loading: boolean;
  reload: () => Promise<void>;
  addManualRoute: (route: NewRoute) => Promise<ActionResult>;
  deleteRoute: (id: string) => Promise<ActionResult>;
  toggleImportant: (id: string) => Promise<ActionResult>;
};

const RoutesContext = createContext<RoutesContextType | undefined>(undefined);

export const useRoutes = () => {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error("useRecorridos debe ser usado dentro de RecorridosProvider");
  }
  return context;
};

/**
 * Fecha de un recorrido para mostrar ("16 oct 2026" o, con hora, "16 oct 2026, 9:54 p. m.").
 * Acepta la fecha ISO del backend y la antigua "dd/mm/aaaa" de los recorridos locales.
 */
export const formatRouteDate = (date: string, withTime = false): string => {
  const parts = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(date ?? "");
  const parsed = parts
    ? new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]))
    : new Date(date);
  if (isNaN(parsed.getTime())) return date || "--";
  return parsed.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime && !parts ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};

const formatMinutes = (minutes?: number) => {
  if (minutes == null) return "—";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
};

const fromApi = (api: SavedRouteApi): SavedRoute => ({
  id: String(api.id),
  date: api.createdAt,
  estimatedTime: formatMinutes(api.estimatedMinutes),
  estimatedDistance: api.distanceKm != null ? `${Number(api.distanceKm).toFixed(2)} km` : "—",
  startNeighborhood: api.startLabel ?? "Inicio",
  endNeighborhood: api.endLabel ?? "Fin",
  municipality: api.city ?? "",
  department: api.department ?? "",
  country: api.country ?? "",
  points: api.points ?? [],
  pointCount: api.points?.length ?? 0,
  esManual: api.isManual,
  customName: api.name,
  important: api.isStarred,
});

const errorText = (error: any, byDefault: string) => {
  if (!error?.response) return "No hay conexión con el servidor.";
  const { status, data } = error.response;
  if ((status === 409 || status === 400) && data?.message) return data.message as string;
  return byDefault;
};

export const RoutesProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(false);

  // Sube al backend (una sola vez) los recorridos que la versión anterior guardaba en el teléfono
  const migrateLocales = useCallback(async () => {
    const raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    let locales: any[] = [];
    try {
      locales = JSON.parse(raw);
    } catch {
      locales = [];
    }
    for (const r of Array.isArray(locales) ? locales : []) {
      if (!r?.puntos || r.puntos.length < 2) continue;
      try {
        await savedRoutesService.create({
          name: r.nombrePersonalizado || `Ruta ${r.barrioInicio ?? "A"} → ${r.barrioFin ?? "B"}`,
          startLabel: r.barrioInicio,
          endLabel: r.barrioFin,
          city: r.municipio,
          department: r.departamento,
          country: r.pais,
          distanceKm: parseFloat(String(r.distanciaEstimada ?? "")) || null,
          points: r.puntos,
          isManual: r.esManual ?? true,
        });
      } catch (error: any) {
        if (error?.response?.status === 409) break; // límite de 4 alcanzado
        if (!error?.response) return; // sin conexión: se reintenta en la próxima carga
      }
    }
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  }, []);

  const reload = useCallback(async () => {
    if (!token) {
      setRoutes([]);
      return;
    }
    setLoading(true);
    try {
      await migrateLocales();
      const list = await savedRoutesService.getMine();
      setRoutes(list.map(fromApi));
    } catch (error) {
      console.error("Error al cargar recorridos:", error);
    } finally {
      setLoading(false);
    }
  }, [token, migrateLocales]);

  // Cargar al iniciar sesión y limpiar al cerrarla
  useEffect(() => {
    reload();
  }, [reload]);

  const addManualRoute = async (newItem: NewRoute): Promise<ActionResult> => {
    if (routes.length >= MAX_ROUTES) {
      return {
        ok: false,
        reason: `Solo puedes tener ${MAX_ROUTES} recorridos guardados. Elimina uno para crear otro.`,
      };
    }
    try {
      const createdAt = await savedRoutesService.create({
        name: newItem.name,
        startLabel: newItem.startTime,
        endLabel: newItem.end,
        city: newItem.municipality,
        department: newItem.department,
        country: newItem.country,
        distanceKm: Math.round(newItem.distanceKm * 100) / 100,
        estimatedMinutes: newItem.estimatedMinutes,
        points: newItem.points,
        isManual: true,
      });
      setRoutes((prev) => [fromApi(createdAt), ...prev]);
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: errorText(error, "No se pudo guardar el recorrido.") };
    }
  };

  const deleteRoute = async (id: string): Promise<ActionResult> => {
    try {
      await savedRoutesService.remove(id);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: errorText(error, "No se pudo eliminar el recorrido.") };
    }
  };

  const toggleImportant = async (id: string): Promise<ActionResult> => {
    const current = routes.find((r) => r.id === id);
    if (!current) return { ok: false };

    // Marcar como importante solo si todavía hay cupo
    if (!current.important && routes.filter((r) => r.important).length >= MAX_IMPORTANTES) {
      return {
        ok: false,
        reason: `Solo puedes tener ${MAX_IMPORTANTES} rutas importantes. Quita la estrella a otra para marcar esta.`,
      };
    }
    try {
      const updated = fromApi(await savedRoutesService.update(id, { isStarred: !current.important }));
      setRoutes((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: errorText(error, "No se pudo actualizar el recorrido.") };
    }
  };

  return (
    <RoutesContext.Provider
      value={{
        routes,
        loading,
        reload,
        addManualRoute,
        deleteRoute,
        toggleImportant,
      }}
    >
      {children}
    </RoutesContext.Provider>
  );
};
