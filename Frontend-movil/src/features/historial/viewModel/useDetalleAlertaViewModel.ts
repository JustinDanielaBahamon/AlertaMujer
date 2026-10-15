import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Share } from "react-native";
import type { Alerta } from "../models/Alerta";
import { getContactosNotificados, type ContactoNotificado } from "../../../services/alerts.service";

interface UseDetalleAlertaViewModelResult {
  esEmergencia: boolean;
  compartiendo: boolean;
  compartirReporte: () => Promise<void>;
  contactosNotificados: ContactoNotificado[];
  cargandoContactos: boolean;
  errorContactos: boolean;
}

export function useDetalleAlertaViewModel(alerta: Alerta): UseDetalleAlertaViewModelResult {
  const [compartiendo, setCompartiendo] = useState(false);

  const esEmergencia = useMemo(() => alerta.tipo === "Emergencia", [alerta.tipo]);

  // Contactos avisados en esta alerta y el estado de cada canal.
  const [contactosNotificados, setContactosNotificados] = useState<ContactoNotificado[]>([]);
  const [cargandoContactos, setCargandoContactos] = useState(true);
  const [errorContactos, setErrorContactos] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargandoContactos(true);
    setErrorContactos(false);
    getContactosNotificados(alerta.id)
      .then((lista) => activo && setContactosNotificados(lista))
      .catch(() => activo && setErrorContactos(true))
      .finally(() => activo && setCargandoContactos(false));
    return () => {
      activo = false;
    };
  }, [alerta.id]);

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
    contactosNotificados,
    cargandoContactos,
    errorContactos,
  };
}
