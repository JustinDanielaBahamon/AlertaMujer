import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { savedRoutesService, SavedRouteApi } from "../services/saved-routes.service";

// Límites por usuaria (los garantiza el backend; aquí solo se usan para la UI)
export const MAX_RECORRIDOS = 4; // recorridos guardados / visibles en el mapa
export const MAX_IMPORTANTES = 2; // rutas marcadas como importantes (estrella)

type PuntoGPS = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

type Recorrido = {
  id: string;
  fecha: string;
  tiempoEstimado: string; // Tiempo estimado de viaje
  distanciaEstimada: string; // Distancia en km
  barrioInicio: string;
  barrioFin: string;
  municipio: string;
  departamento: string;
  pais: string;
  puntos: PuntoGPS[];
  cantidadPuntos: number;
  esManual: boolean; // Para distinguir recorridos manuales de automáticos
  nombrePersonalizado?: string; // Para recorridos manuales
  importante: boolean; // Para mostrar en el mapa principal
};

export type NuevoRecorrido = {
  nombre: string;
  inicio: string;
  fin: string;
  puntos: PuntoGPS[];
  distanciaKm: number;
  minutosEstimados: number;
  municipio?: string;
  departamento?: string;
  pais?: string;
};

export type ResultadoAccion = { ok: boolean; motivo?: string };

// Versión anterior: los recorridos vivían solo en este teléfono
const LEGACY_STORAGE_KEY = "alertamujer_recorridos";

type RecorridosContextType = {
  recorridos: Recorrido[];
  cargando: boolean;
  recargar: () => Promise<void>;
  agregarRecorridoManual: (recorrido: NuevoRecorrido) => Promise<ResultadoAccion>;
  eliminarRecorrido: (id: string) => Promise<ResultadoAccion>;
  toggleImportante: (id: string) => Promise<ResultadoAccion>;
};

const RecorridosContext = createContext<RecorridosContextType | undefined>(undefined);

export const useRecorridos = () => {
  const context = useContext(RecorridosContext);
  if (!context) {
    throw new Error("useRecorridos debe ser usado dentro de RecorridosProvider");
  }
  return context;
};

/**
 * Fecha de un recorrido para mostrar ("16 oct 2026" o, con hora, "16 oct 2026, 9:54 p. m.").
 * Acepta la fecha ISO del backend y la antigua "dd/mm/aaaa" de los recorridos locales.
 */
export const formatearFechaRecorrido = (fecha: string, conHora = false): string => {
  const partes = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(fecha ?? "");
  const date = partes
    ? new Date(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1]))
    : new Date(fecha);
  if (isNaN(date.getTime())) return fecha || "--";
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(conHora && !partes ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};

const formatearMinutos = (minutos?: number) => {
  if (minutos == null) return "—";
  if (minutos < 60) return `${minutos} min`;
  return `${Math.floor(minutos / 60)}h ${minutos % 60}min`;
};

const desdeApi = (api: SavedRouteApi): Recorrido => ({
  id: String(api.id),
  fecha: api.createdAt,
  tiempoEstimado: formatearMinutos(api.estimatedMinutes),
  distanciaEstimada: api.distanceKm != null ? `${Number(api.distanceKm).toFixed(2)} km` : "—",
  barrioInicio: api.startLabel ?? "Inicio",
  barrioFin: api.endLabel ?? "Fin",
  municipio: api.city ?? "",
  departamento: api.department ?? "",
  pais: api.country ?? "",
  puntos: api.points ?? [],
  cantidadPuntos: api.points?.length ?? 0,
  esManual: api.isManual,
  nombrePersonalizado: api.name,
  importante: api.isStarred,
});

const mensajeError = (error: any, porDefecto: string) => {
  if (!error?.response) return "No hay conexión con el servidor.";
  const { status, data } = error.response;
  if ((status === 409 || status === 400) && data?.message) return data.message as string;
  return porDefecto;
};

export const RecorridosProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [recorridos, setRecorridos] = useState<Recorrido[]>([]);
  const [cargando, setCargando] = useState(false);

  // Sube al backend (una sola vez) los recorridos que la versión anterior guardaba en el teléfono
  const migrarLocales = useCallback(async () => {
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

  const recargar = useCallback(async () => {
    if (!token) {
      setRecorridos([]);
      return;
    }
    setCargando(true);
    try {
      await migrarLocales();
      const lista = await savedRoutesService.getMine();
      setRecorridos(lista.map(desdeApi));
    } catch (error) {
      console.error("Error al cargar recorridos:", error);
    } finally {
      setCargando(false);
    }
  }, [token, migrarLocales]);

  // Cargar al iniciar sesión y limpiar al cerrarla
  useEffect(() => {
    recargar();
  }, [recargar]);

  const agregarRecorridoManual = async (nuevo: NuevoRecorrido): Promise<ResultadoAccion> => {
    if (recorridos.length >= MAX_RECORRIDOS) {
      return {
        ok: false,
        motivo: `Solo puedes tener ${MAX_RECORRIDOS} recorridos guardados. Elimina uno para crear otro.`,
      };
    }
    try {
      const creado = await savedRoutesService.create({
        name: nuevo.nombre,
        startLabel: nuevo.inicio,
        endLabel: nuevo.fin,
        city: nuevo.municipio,
        department: nuevo.departamento,
        country: nuevo.pais,
        distanceKm: Math.round(nuevo.distanciaKm * 100) / 100,
        estimatedMinutes: nuevo.minutosEstimados,
        points: nuevo.puntos,
        isManual: true,
      });
      setRecorridos((prev) => [desdeApi(creado), ...prev]);
      return { ok: true };
    } catch (error) {
      return { ok: false, motivo: mensajeError(error, "No se pudo guardar el recorrido.") };
    }
  };

  const eliminarRecorrido = async (id: string): Promise<ResultadoAccion> => {
    try {
      await savedRoutesService.remove(id);
      setRecorridos((prev) => prev.filter((r) => r.id !== id));
      return { ok: true };
    } catch (error) {
      return { ok: false, motivo: mensajeError(error, "No se pudo eliminar el recorrido.") };
    }
  };

  const toggleImportante = async (id: string): Promise<ResultadoAccion> => {
    const actual = recorridos.find((r) => r.id === id);
    if (!actual) return { ok: false };

    // Marcar como importante solo si todavía hay cupo
    if (!actual.importante && recorridos.filter((r) => r.importante).length >= MAX_IMPORTANTES) {
      return {
        ok: false,
        motivo: `Solo puedes tener ${MAX_IMPORTANTES} rutas importantes. Quita la estrella a otra para marcar esta.`,
      };
    }
    try {
      const actualizado = desdeApi(await savedRoutesService.update(id, { isStarred: !actual.importante }));
      setRecorridos((prev) => prev.map((r) => (r.id === id ? actualizado : r)));
      return { ok: true };
    } catch (error) {
      return { ok: false, motivo: mensajeError(error, "No se pudo actualizar el recorrido.") };
    }
  };

  return (
    <RecorridosContext.Provider
      value={{
        recorridos,
        cargando,
        recargar,
        agregarRecorridoManual,
        eliminarRecorrido,
        toggleImportante,
      }}
    >
      {children}
    </RecorridosContext.Provider>
  );
};
