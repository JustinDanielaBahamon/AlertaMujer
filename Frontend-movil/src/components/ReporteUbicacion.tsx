import { useReporteUbicacion } from "../hooks/use-reporte-ubicacion";

/** Componente sin interfaz que mantiene activo el envío de ubicación mientras hay sesión. */
export default function ReporteUbicacion() {
  useReporteUbicacion();
  return null;
}
