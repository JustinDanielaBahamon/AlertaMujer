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
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarRecorridos = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await api.get('/api/alerts/locations');
      const recorridosFromBackend: Recorrido[] = response.data.map((loc: any, index: number) => ({
        id: `backend-${loc.id}`,
        fecha: loc.recorded_at ? new Date(loc.recorded_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        tiempoEstimado: "",
        distanciaEstimada: "",
        barrioInicio: loc.address || "Centro",
        barrioFin: "",
        municipio: "Neiva",
        departamento: "Huila",
        pais: "Colombia",
        puntos: [{
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude),
          timestamp: loc.recorded_at || new Date().toISOString(),
        }],
        cantidadPuntos: 1,
        esManual: false,
        importante: index === 0,
      }));
      setRecorridos(recorridosFromBackend);
    } catch (err) {
      console.error("Error cargando recorridos:", err);
      setError("No se pudieron cargar los recorridos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRecorridos();
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