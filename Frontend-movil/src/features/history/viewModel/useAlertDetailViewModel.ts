import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Share } from "react-native";
import type { AlertRecord } from "../models/AlertRecord";
import { getNotifiedContacts, keepAlertEvidence, type AlertApi, type NotifiedContact } from "../../../services/alerts.service";
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
  widget: "Widget de inicio",
  power_button: "Botón de encendido",
  // For trip alerts the title already says "Avísame si no llego": the chip tells why it went out
  timer: "No confirmó la llegada",
  signal_lost: "Señal perdida en el trayecto",
};

const time = (d: Date) => d.toLocaleTimeString("es-CO", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" });

const duration = (ms: number) => {
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 1) return "menos de 1 min";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
};

/** A step of the detail timeline. */
export type AlertStep = { icon: "alert" | "location" | "end" | "ongoing"; title: string; detail: string };

export interface RouteStop {
  id: string;
  number: number;
  latitude: number;
  longitude: number;
  time: string;
  place: string | null;
}

/** Places are looked up for at most this many points (OpenStreetMap allows 1 query per second). */
const MAX_PLACES = 20;
/** Map markers beyond this are thinned out evenly (first and last always stay). */
export const MAX_ROUTE_MARKERS = 40;

interface UseAlertDetailViewModelResult {
  isEmergency: boolean;
  sharing: boolean;
  shareReport: () => Promise<void>;
  /** The alert's evidence is kept as proof (not deleted after the retention days). */
  kept: boolean;
  savingKeep: boolean;
  toggleKeep: () => Promise<void>;
  /** Route points in order, numbered from 1, with their time and (when found) the place. */
  route: RouteStop[];
  notifiedContacts: NotifiedContact[];
  loadingContacts: boolean;
  contactsError: boolean;
  /** Alert route (location points sent), from oldest to newest. */
  points: LocationPoint[];
  loadingDetail: boolean;
  /** "Carrera 7 · Altico" of the starting point, if it could be obtained. */
  address: string | null;
  method: string | null;
  message: string | null;
  steps: AlertStep[];
}

export function useAlertDetailViewModel(alert: AlertRecord): UseAlertDetailViewModelResult {
  const [sharing, setSharing] = useState(false);

  // Trip alerts ("Avísame si no llego") are emergencies too; only "Asistencia" is different
  const isEmergency = useMemo(() => alert.type !== "Asistencia", [alert.type]);

  // Contacts notified in this alert and the status of each channel.
  const [notifiedContacts, setNotifiedContacts] = useState<NotifiedContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactsError, setContactsError] = useState(false);

  // Full alert data and its route
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
        // Offline: show what the history brings
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
      { icon: "alert", title: "Alerta activada", detail: [time(startTime), method].filter(Boolean).join(" · ") },
    ];
    if (points.length > 0) {
      list.push({
        icon: "location",
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
      list.push({ icon: "ongoing", title: "Alerta en curso", detail: `Activa desde hace ${duration(Date.now() - startTime.getTime())}` });
    } else {
      const end = toDate(endIso);
      const title =
        status === "cancelled" ? "Cancelaste la alerta" : status === "expired" ? "La alerta expiró" : "Alerta terminada";
      list.push({ icon: "end", title, detail: `${time(end)} · duró ${duration(end.getTime() - startTime.getTime())}` });
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

  // Keep the evidence as proof (the server allows a few alerts and explains when the limit is reached)
  const [savingKeep, setSavingKeep] = useState(false);
  const kept = !!data?.keepEvidence;
  const toggleKeep = useCallback(async () => {
    if (savingKeep || !data) return;
    setSavingKeep(true);
    try {
      const updated = await keepAlertEvidence(data.id, !kept);
      setData((current) => (current ? { ...current, keepEvidence: !!updated?.keepEvidence } : current));
    } catch (error: any) {
      Alert.alert(
        "Conservar evidencias",
        error?.response?.data?.message ?? "No se pudo guardar el cambio. Revisa tu conexión e intenta de nuevo.",
      );
    } finally {
      setSavingKeep(false);
    }
  }, [savingKeep, data, kept]);

  // Place of each route point, one query per second, in order
  const [places, setPlaces] = useState<Record<string, string>>({});
  useEffect(() => {
    let enabled = true;
    (async () => {
      for (const p of points.slice(0, MAX_PLACES)) {
        if (!enabled) return;
        const place = await getPlace(p.latitude, p.longitude).catch(() => null);
        const text = place ? placeDescription(place) : "";
        if (enabled && text) setPlaces((current) => ({ ...current, [p.id]: text }));
        await new Promise((r) => setTimeout(r, 1100));
      }
    })();
    return () => {
      enabled = false;
    };
  }, [points]);

  const route = useMemo<RouteStop[]>(
    () =>
      points.map((p, i) => ({
        id: p.id,
        number: i + 1,
        latitude: p.latitude,
        longitude: p.longitude,
        time: time(p.recordedAt),
        place: places[p.id] ?? null,
      })),
    [points, places],
  );

  return {
    isEmergency,
    route,
    kept,
    savingKeep,
    toggleKeep,
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
