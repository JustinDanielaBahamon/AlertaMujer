import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Share } from "react-native";
import type { AlertRecord } from "../models/AlertRecord";
import { getNotifiedContacts, type AlertApi, type NotifiedContact } from "../../../services/alerts.service";
import { toDate, getAlertTracking, type LocationPoint } from "../../../services/alert-tracking.service";
import { placeDescription, getPlace } from "../../../services/geocoding.service";

const TIME_ZONE = "America/Bogota";

const METHODS: Record<string, string> = {
  panic_button: "Botón SOS",
  manual: "Botón SOS",
  suspicious_movement: "Agitando el teléfono",
  gesture: "Agitando el teléfono",
  contact: "Alerta a un contacto",
  voice: "Comando de voz",
  timer: "Temporizador",
};

const time = (d: Date) => d.toLocaleTimeString("es-CO", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" });

const duration = (ms: number) => {
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 1) return "menos de 1 min";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
};

/** Paso de la línea de tiempo del detalle. */
export type AlertStep = { icon: "alerta" | "ubicacion" | "fin" | "curso"; title: string; detail: string };

interface UseAlertDetailViewModelResult {
  isEmergency: boolean;
  sharing: boolean;
  shareReport: () => Promise<void>;
  notifiedContacts: NotifiedContact[];
  loadingContacts: boolean;
  contactsError: boolean;
  /** Recorrido de la alerta (puntos de ubicación enviados), del más antiguo al más reciente. */
  points: LocationPoint[];
  loadingDetail: boolean;
  /** "Carrera 7 · Altico" del punto inicial, si se pudo obtener. */
  address: string | null;
  method: string | null;
  message: string | null;
  steps: AlertStep[];
}

export function useAlertDetailViewModel(alert: AlertRecord): UseAlertDetailViewModelResult {
  const [sharing, setSharing] = useState(false);

  const isEmergency = useMemo(() => alert.type === "Emergencia", [alert.type]);

  // Contactos avisados en esta alerta y el estado de cada canal.
  const [notifiedContacts, setNotifiedContacts] = useState<NotifiedContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactsError, setContactsError] = useState(false);

  // Datos completos de la alerta y su recorrido
  const [data, setData] = useState<AlertApi | null>(null);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    let enabled = true;
    setLoadingContacts(true);
    setContactsError(false);
    getNotifiedContacts(alert.id)
      .then((list) => enabled && setNotifiedContacts(list))
      .catch(() => enabled && setContactsError(true))
      .finally(() => enabled && setLoadingContacts(false));
    return () => {
      enabled = false;
    };
  }, [alert.id]);

  useEffect(() => {
    let enabled = true;
    setLoadingDetail(true);
    getAlertTracking(Number(alert.id))
      .then(async (s) => {
        if (!enabled) return;
        setData(s.alert ?? null);
        setPoints(s.points);
        const startTime = s.points[0] ?? alert.coords;
        if (startTime) {
          const place = await getPlace(startTime.latitude, startTime.longitude);
          if (enabled && place) setAddress(placeDescription(place) || null);
        }
      })
      .catch(() => {
        // Sin conexión: se muestra lo que trae el historial
        if (enabled && alert.coords) setPoints([{ id: "inicio", ...alert.coords, recordedAt: new Date() }]);
      })
      .finally(() => enabled && setLoadingDetail(false));
    return () => {
      enabled = false;
    };
  }, [alert.id, alert.coords]);

  const method = data ? METHODS[data.activationMethod] ?? null : null;
  const message = data?.message?.trim() || null;

  const steps = useMemo<AlertStep[]>(() => {
    if (!data) return [];
    const startTime = toDate(data.startedAt || data.createdAt);
    const list: AlertStep[] = [
      { icon: "alerta", title: "Alerta activada", detail: [time(startTime), method].filter(Boolean).join(" · ") },
    ];
    if (points.length > 0) {
      list.push({
        icon: "ubicacion",
        title: points.length === 1 ? "Ubicación compartida" : `Ubicación compartida ${points.length} veces`,
        detail:
          points.length > 1
            ? `Última a las ${time(points[points.length - 1].recordedAt)}`
            : "Se envió tu ubicación al activar la alerta",
      });
    }
    const status = (data.status || "").toLowerCase();
    const endIso = data.cancelledAt || data.endedAt;
    if (status === "active" || !endIso) {
      list.push({ icon: "curso", title: "Alerta en curso", detail: `Activa desde hace ${duration(Date.now() - startTime.getTime())}` });
    } else {
      const end = toDate(endIso);
      const title =
        status === "cancelled" ? "Cancelaste la alerta" : status === "expired" ? "La alerta expiró" : "Alerta terminada";
      list.push({ icon: "fin", title, detail: `${time(end)} · duró ${duration(end.getTime() - startTime.getTime())}` });
    }
    return list;
  }, [data, points, method]);

  const shareMessage = useMemo(
    () =>
      [
        "Reporte de alerta - AlertaMujer",
        "",
        `Tipo: ${alert.type}`,
        `Estado: ${alert.status}`,
        `Fecha: ${alert.date} ${alert.time}`,
        method ? `Activada: ${method}` : null,
        address ? `Lugar: ${address}` : null,
        ...steps.slice(1).map((p) => `${p.title}: ${p.detail}`),
        notifiedContacts.length > 0
          ? `Contactos avisados: ${notifiedContacts.map((c) => c.name).join(", ")}`
          : null,
      ]
        .filter((l): l is string => l !== null)
        .join("\n"),
    [alert.status, alert.date, alert.time, alert.type, method, address, steps, notifiedContacts],
  );

  const shareReport = useCallback(async () => {
    if (sharing) return;

    setSharing(true);
    try {
      await Share.share({
        title: "Reporte de alerta",
        message: shareMessage,
      });
    } catch (error) {
      Alert.alert("No fue posible compartir", "Intentalo nuevamente en unos segundos.");
    } finally {
      setSharing(false);
    }
  }, [sharing, shareMessage]);

  return {
    isEmergency,
    sharing,
    shareReport,
    notifiedContacts,
    loadingContacts,
    contactsError,
    points,
    loadingDetail,
    address,
    method,
    message,
    steps,
  };
}
