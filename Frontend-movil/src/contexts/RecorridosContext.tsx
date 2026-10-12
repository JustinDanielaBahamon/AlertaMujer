import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Límites por usuaria
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

export type ResultadoAccion = { ok: boolean; motivo?: string };

const STORAGE_KEY = "alertamujer_recorridos";

type RecorridosContextType = {
  recorridos: Recorrido[];
  agregarRecorridoManual: (recorrido: Omit<Recorrido, "id" | "esManual">) => ResultadoAccion;
  eliminarRecorrido: (id: string) => void;
  toggleImportante: (id: string) => ResultadoAccion;
};

const RecorridosContext = createContext<RecorridosContextType | undefined>(undefined);

export const useRecorridos = () => {
  const context = useContext(RecorridosContext);
  if (!context) {
    throw new Error("useRecorridos debe ser usado dentro de RecorridosProvider");
  }
  return context;
};

export const RecorridosProvider = ({ children }: { children: ReactNode }) => {
  const [recorridos, setRecorridos] = useState<Recorrido[]>([]);

  // Cargar recorridos guardados al iniciar la app
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const savedRecorridos = JSON.parse(raw);
          setRecorridos(savedRecorridos);
        }
      } catch (error) {
        console.error("Error al cargar recorridos guardados:", error);
      }
    })();
  }, []);

  // Guardar en AsyncStorage cada vez que cambien los recorridos
  const saveToStorage = async (recorridosToSave: Recorrido[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recorridosToSave));
    } catch (error) {
      console.error("Error al guardar recorridos:", error);
    }
  };

  // Los recorridos manuales se crean desde la pantalla GuardarRecorrido.

  const agregarRecorridoManual = (
    recorrido: Omit<Recorrido, "id" | "esManual">
  ): ResultadoAccion => {
    if (recorridos.length >= MAX_RECORRIDOS) {
      return {
        ok: false,
        motivo: `Solo puedes tener ${MAX_RECORRIDOS} recorridos guardados. Elimina uno para crear otro.`,
      };
    }

    // Es importante por defecto, mientras no se haya llegado al máximo de importantes
    const importantesActuales = recorridos.filter((r) => r.importante).length;

    const nuevoRecorrido: Recorrido = {
      ...recorrido,
      id: Date.now().toString(),
      esManual: true,
      importante: importantesActuales < MAX_IMPORTANTES,
    };
    const updatedRecorridos = [nuevoRecorrido, ...recorridos];
    setRecorridos(updatedRecorridos);
    saveToStorage(updatedRecorridos);
    return { ok: true };
  };

  const eliminarRecorrido = (id: string) => {
    const updatedRecorridos = recorridos.filter((r) => r.id !== id);
    setRecorridos(updatedRecorridos);
    saveToStorage(updatedRecorridos);
  };

  const toggleImportante = (id: string): ResultadoAccion => {
    const actual = recorridos.find((r) => r.id === id);
    if (!actual) return { ok: false };

    // Marcar como importante solo si todavía hay cupo
    if (!actual.importante) {
      const importantesActuales = recorridos.filter((r) => r.importante).length;
      if (importantesActuales >= MAX_IMPORTANTES) {
        return {
          ok: false,
          motivo: `Solo puedes tener ${MAX_IMPORTANTES} rutas importantes. Quita la estrella a otra para marcar esta.`,
        };
      }
    }

    const updatedRecorridos = recorridos.map((r) =>
      r.id === id ? { ...r, importante: !r.importante } : r
    );
    setRecorridos(updatedRecorridos);
    saveToStorage(updatedRecorridos);
    return { ok: true };
  };

  return (
    <RecorridosContext.Provider
      value={{
        recorridos,
        agregarRecorridoManual,
        eliminarRecorrido,
        toggleImportante,
      }}
    >
      {children}
    </RecorridosContext.Provider>
  );
};