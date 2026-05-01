import { useCallback, useMemo, useState } from "react";
import { Alert, Share } from "react-native";
import type { Alerta } from "../../src/models/Alerta";

interface UseDetalleAlertaViewModelResult {
  esEmergencia: boolean;
  compartiendo: boolean;
  compartirReporte: () => Promise<void>;
}

export function useDetalleAlertaViewModel(alerta: Alerta): UseDetalleAlertaViewModelResult {
  const [compartiendo, setCompartiendo] = useState(false);

  const esEmergencia = useMemo(() => alerta.tipo === "Emergencia", [alerta.tipo]);

  const mensajeCompartir = useMemo(
    () =>
      [
        "Reporte de alerta",
        "",
        `Tipo: ${alerta.tipo}`,
        `Estado: ${alerta.estado}`,
        `Fecha: ${alerta.fecha}`,
        `Hora: ${alerta.hora}`,
        `Ubicacion: ${alerta.ubicacion}`,
      ].join("\n"),
    [alerta.estado, alerta.fecha, alerta.hora, alerta.tipo, alerta.ubicacion],
  );

  const compartirReporte = useCallback(async () => {
    if (compartiendo) return;

    setCompartiendo(true);
    try {
      await Share.share({
        title: "Reporte de alerta",
        message: mensajeCompartir,
      });
    } catch (error) {
      Alert.alert("No fue posible compartir", "Intentalo nuevamente en unos segundos.");
    } finally {
      setCompartiendo(false);
    }
  }, [compartiendo, mensajeCompartir]);

  return {
    esEmergencia,
    compartiendo,
    compartirReporte,
  };
}
