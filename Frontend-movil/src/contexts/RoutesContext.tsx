import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { savedRoutesService, SavedRouteApi } from "../services/saved-routes.service";

// Per-user limits (the backend enforces them; here they are only used for the UI)
export const MAX_ROUTES = 4; // saved routes / routes visible on the map
export const MAX_IMPORTANTES = 2; // routes marked as important (star)

type GpsPoint = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

export type SavedRoute = {
  id: string;
  date: string;
  estimatedTime: string; // Estimated travel time
  estimatedDistance: string; // Distance in km
  startNeighborhood: string;
  endNeighborhood: string;
  municipality: string;
  department: string;
  country: string;
  points: GpsPoint[];
  pointCount: number;
  esManual: boolean; // To tell manual routes from automatic ones
  customName?: string; // For manual routes
  important: boolean; // To show on the main map
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

// Previous version: routes lived only on this phone
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
 * Route date for display ("16 oct 2026" or, with time, "16 oct 2026, 9:54 p. m.").
 * Accepts the backend ISO date and the old "dd/mm/yyyy" of local routes.
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

  // Uploads to the backend (only once) the routes the previous version stored on the phone
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
        if (error?.response?.status === 409) break; // limit of 4 reached
        if (!error?.response) return; // offline: retried on the next load
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

  // Load when signing in and clear when signing out
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

    // Mark as important only if there is still room
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
