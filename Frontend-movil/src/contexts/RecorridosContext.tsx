import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

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

  // Cargar recorridos simulados iniciales para demostración
  useEffect(() => {
    const recorridosIniciales: Recorrido[] = [
      {
        id: "demo-1",
        fecha: "10/09/2024",
        tiempoEstimado: "45 min",
        distanciaEstimada: "3.75 km",
        barrioInicio: "Centro",
        barrioFin: "Altico",
        municipio: "Neiva",
        departamento: "Huila",
        pais: "Colombia",
        puntos: [
          { latitude: 2.9271, longitude: -75.2874, timestamp: "" },
          { latitude: 2.9285, longitude: -75.2859, timestamp: "" },
          { latitude: 2.9302, longitude: -75.2841, timestamp: "" },
          { latitude: 2.9320, longitude: -75.2825, timestamp: "" },
          { latitude: 2.9335, longitude: -75.2808, timestamp: "" },
        ],
        cantidadPuntos: 5,
        esManual: true,
        nombrePersonalizado: "Ruta Casa → Trabajo",
        importante: true,
      },
      {
        id: "demo-2",
        fecha: "10/09/2024",
        tiempoEstimado: "35 min",
        distanciaEstimada: "2.92 km",
        barrioInicio: "Altico",
        barrioFin: "El Jardín",
        municipio: "Neiva",
        departamento: "Huila",
        pais: "Colombia",
        puntos: [
          { latitude: 2.9200, longitude: -75.2900, timestamp: "" },
          { latitude: 2.9215, longitude: -75.2883, timestamp: "" },
          { latitude: 2.9230, longitude: -75.2866, timestamp: "" },
          { latitude: 2.9245, longitude: -75.2849, timestamp: "" },
        ],
        cantidadPuntos: 4,
        esManual: true,
        nombrePersonalizado: "Ruta Trabajo → Gimnasio",
        importante: true,
      },
      {
        id: "demo-3",
        fecha: "09/09/2024",
        tiempoEstimado: "40 min",
        distanciaEstimada: "3.33 km",
        barrioInicio: "La Libertad",
        barrioFin: "Centro",
        municipio: "Neiva",
        departamento: "Huila",
        pais: "Colombia",
        puntos: [
          { latitude: 2.9150, longitude: -75.2950, timestamp: "" },
          { latitude: 2.9165, longitude: -75.2933, timestamp: "" },
          { latitude: 2.9180, longitude: -75.2916, timestamp: "" },
          { latitude: 2.9195, longitude: -75.2899, timestamp: "" },
        ],
        cantidadPuntos: 4,
        esManual: true,
        nombrePersonalizado: "Ruta Gimnasio → Casa",
        importante: false,
      },
      {
        id: "demo-4",
        fecha: "08/09/2024",
        tiempoEstimado: "30 min",
        distanciaEstimada: "2.50 km",
        barrioInicio: "San Jorge",
        barrioFin: "Santa Inés",
        municipio: "Neiva",
        departamento: "Huila",
        pais: "Colombia",
        puntos: [
          { latitude: 2.9100, longitude: -75.3000, timestamp: "" },
          { latitude: 2.9115, longitude: -75.2983, timestamp: "" },
          { latitude: 2.9130, longitude: -75.2966, timestamp: "" },
          { latitude: 2.9145, longitude: -75.2949, timestamp: "" },
        ],
        cantidadPuntos: 4,
        esManual: true,
        nombrePersonalizado: "Ruta Supermercado → Casa",
        importante: false,
      },
    ];
    
    setRecorridos(recorridosIniciales);
  }, []);

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