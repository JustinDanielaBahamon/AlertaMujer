import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Share } from "react-native";
import type { Alerta } from "../models/Alerta";
import { getContactosNotificados, type AlertaApi, type ContactoNotificado } from "../../../services/alerts.service";
import { aFecha, getSeguimientoAlerta, type PuntoUbicacion } from "../../../services/alert-tracking.service";
import { descripcionLugar, obtenerLugar } from "../../../services/geocoding.service";

const ZONA = "America/Bogota";

const METODOS: Record<string, string> = {
  panic_button: "Botón SOS",
  manual: "Botón SOS",
  suspicious_movement: "Agitando el teléfono",
  gesture: "Agitando el teléfono",
  contact: "Alerta a un contacto",
  voice: "Comando de voz",
  timer: "Temporizador",
};

const hora = (d: Date) => d.toLocaleTimeString("es-CO", { timeZone: ZONA, hour: "numeric", minute: "2-digit" });

const duracion = (ms: number) => {
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 1) return "menos de 1 min";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
};

/** Paso de la línea de tiempo del detalle. */
export type PasoAlerta = { icono: "alerta" | "ubicacion" | "fin" | "curso"; titulo: string; detalle: string };

interface UseDetalleAlertaViewModelResult {
  esEmergencia: boolean;
  compartiendo: boolean;
  compartirReporte: () => Promise<void>;
  contactosNotificados: ContactoNotificado[];
  cargandoContactos: boolean;
  errorContactos: boolean;
  /** Recorrido de la alerta (puntos de ubicación enviados), del más antiguo al más reciente. */
  puntos: PuntoUbicacion[];
  cargandoDetalle: boolean;
  /** "Carrera 7 · Altico" del punto inicial, si se pudo obtener. */
  direccion: string | null;
  metodo: string | null;
  mensaje: string | null;
  pasos: PasoAlerta[];
}

export function useDetalleAlertaViewModel(alerta: Alerta): UseDetalleAlertaViewModelResult {
  const [compartiendo, setCompartiendo] = useState(false);

  const esEmergencia = useMemo(() => alerta.tipo === "Emergencia", [alerta.tipo]);

  // Contactos avisados en esta alerta y el estado de cada canal.
  const [contactosNotificados, setContactosNotificados] = useState<ContactoNotificado[]>([]);
  const [cargandoContactos, setCargandoContactos] = useState(true);
  const [errorContactos, setErrorContactos] = useState(false);

  // Datos completos de la alerta y su recorrido
  const [datos, setDatos] = useState<AlertaApi | null>(null);
  const [puntos, setPuntos] = useState<PuntoUbicacion[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(true);
  const [direccion, setDireccion] = useState<string | null>(null);

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

  useEffect(() => {
    let activo = true;
    setCargandoDetalle(true);
    getSeguimientoAlerta(Number(alerta.id))
      .then(async (s) => {
        if (!activo) return;
        setDatos(s.alerta ?? null);
        setPuntos(s.puntos);
        const inicio = s.puntos[0] ?? alerta.coords;
        if (inicio) {
          const lugar = await obtenerLugar(inicio.latitude, inicio.longitude);
          if (activo && lugar) setDireccion(descripcionLugar(lugar) || null);
        }
      })
      .catch(() => {
        // Sin conexión: se muestra lo que trae el historial
        if (activo && alerta.coords) setPuntos([{ id: "inicio", ...alerta.coords, recordedAt: new Date() }]);
      })
      .finally(() => activo && setCargandoDetalle(false));
    return () => {
      activo = false;
    };
  }, [alerta.id, alerta.coords]);

  const metodo = datos ? METODOS[datos.activationMethod] ?? null : null;
  const mensaje = datos?.message?.trim() || null;

  const pasos = useMemo<PasoAlerta[]>(() => {
    if (!datos) return [];
    const inicio = aFecha(datos.startedAt || datos.createdAt);
    const lista: PasoAlerta[] = [
      { icono: "alerta", titulo: "Alerta activada", detalle: [hora(inicio), metodo].filter(Boolean).join(" · ") },
    ];
    if (puntos.length > 0) {
      lista.push({
        icono: "ubicacion",
        titulo: puntos.length === 1 ? "Ubicación compartida" : `Ubicación compartida ${puntos.length} veces`,
        detalle:
          puntos.length > 1
            ? `Última a las ${hora(puntos[puntos.length - 1].recordedAt)}`
            : "Se envió tu ubicación al activar la alerta",
      });
    }
    const estado = (datos.status || "").toLowerCase();
    const finIso = datos.cancelledAt || datos.endedAt;
    if (estado === "active" || !finIso) {
      lista.push({ icono: "curso", titulo: "Alerta en curso", detalle: `Activa desde hace ${duracion(Date.now() - inicio.getTime())}` });
    } else {
      const fin = aFecha(finIso);
      const titulo =
        estado === "cancelled" ? "Cancelaste la alerta" : estado === "expired" ? "La alerta expiró" : "Alerta terminada";
      lista.push({ icono: "fin", titulo, detalle: `${hora(fin)} · duró ${duracion(fin.getTime() - inicio.getTime())}` });
    }
    return lista;
  }, [datos, puntos, metodo]);

  const mensajeCompartir = useMemo(
    () =>
      [
        "Reporte de alerta - AlertaMujer",
        "",
        `Tipo: ${alerta.tipo}`,
        `Estado: ${alerta.estado}`,
        `Fecha: ${alerta.fecha} ${alerta.hora}`,
        metodo ? `Activada: ${metodo}` : null,
        direccion ? `Lugar: ${direccion}` : null,
        ...pasos.slice(1).map((p) => `${p.titulo}: ${p.detalle}`),
        contactosNotificados.length > 0
          ? `Contactos avisados: ${contactosNotificados.map((c) => c.name).join(", ")}`
          : null,
      ]
        .filter((l): l is string => l !== null)
        .join("\n"),
    [alerta.estado, alerta.fecha, alerta.hora, alerta.tipo, metodo, direccion, pasos, contactosNotificados],
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
    puntos,
    cargandoDetalle,
    direccion,
    metodo,
    mensaje,
    pasos,
  };
}
