import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "../services/api";

type PuntoGPS = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

type Recorrido = {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  barrioInicio: string;
  barrioFin: string;
  municipio: string;
  departamento: string;
  pais: string;
  puntos: PuntoGPS[];
  cantidadPuntos: number;
  distanciaEstimada?: string;
  esManual: boolean;
  nombrePersonalizado?: string;
  importante: boolean;
};

type RecorridosContextType = {
  recorridos: Recorrido[];
  agregarRecorridoManual: (recorrido: Omit<Recorrido, "id" | "esManual">) => void;
  eliminarRecorrido: (id: string) => void;
  toggleImportante: (id: string) => void;
  cargando: boolean;
  error: string | null;
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
      // Cargar ubicaciones del usuario desde el backend
      const response = await api.get('/api/alerts/locations');
      // Transformar los datos del backend al formato de Recorrido
      const recorridosFromBackend: Recorrido[] = response.data.map((loc: any, index: number) => ({
        id: `backend-${loc.id}`,
        fecha: loc.recorded_at ? new Date(loc.recorded_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        horaInicio: loc.recorded_at ? new Date(loc.recorded_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "",
        horaFin: "",
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
      importante: true,
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
        cargando,
        error,
      }}
    >
      {children}
    </RecorridosContext.Provider>
  );
};
