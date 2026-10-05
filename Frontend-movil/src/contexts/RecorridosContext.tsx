import React, { createContext, useContext, useState, ReactNode } from "react";

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

type RecorridosContextType = {
  recorridos: Recorrido[];
  agregarRecorridoManual: (recorrido: Omit<Recorrido, "id" | "esManual">) => void;
  eliminarRecorrido: (id: string) => void;
  toggleImportante: (id: string) => void;
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

  const agregarRecorridoManual = (recorrido: Omit<Recorrido, "id" | "esManual">) => {
    const nuevoRecorrido: Recorrido = {
      ...recorrido,
      id: Date.now().toString(),
      esManual: true,
      importante: true, // Por defecto importantes
    };
    setRecorridos((prev) => [nuevoRecorrido, ...prev]);
  };

  const eliminarRecorrido = (id: string) => {
    setRecorridos((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleImportante = (id: string) => {
    setRecorridos((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, importante: !r.importante } : r
      )
    );
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
