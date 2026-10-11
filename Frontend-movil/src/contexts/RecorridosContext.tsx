import React, { createContext, useContext, useState, ReactNode } from "react";

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
    setRecorridos((prev) => [nuevoRecorrido, ...prev]);
    return { ok: true };
  };

  const eliminarRecorrido = (id: string) => {
    setRecorridos((prev) => prev.filter((r) => r.id !== id));
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

    setRecorridos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, importante: !r.importante } : r))
    );
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