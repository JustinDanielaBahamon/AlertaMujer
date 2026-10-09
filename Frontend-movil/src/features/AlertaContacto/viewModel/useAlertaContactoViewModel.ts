import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Linking, Platform } from "react-native";
import type MapView from "react-native-maps";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { MainStackParamList } from "../../../navigation/types";
import {
  getSeguimientoAlerta,
  type PuntoUbicacion,
} from "../../../services/alert-tracking.service";
import { descripcionLugar, obtenerLugar } from "../../../services/geocoding.service";

// Ciclo de actualización: cada 30 s se actualiza la ubicación; tras 10 actualizaciones
// se entra en reposo 5 minutos (ahorra batería) y luego se repite el ciclo.
const INTERVALO_ACTUALIZACION_MS = 30 * 1000;
const ACTUALIZACIONES_POR_CICLO = 10;
const REPOSO_MS = 5 * 60 * 1000;
const MAX_HISTORIAL = 15; // registros que se muestran en la lista (el mapa muestra todos)
const ZONA = "America/Bogota";
const ESTADOS_FINALES = ["cancelled", "cancelada", "resolved", "atendida", "finalizada"];

// TEMPORAL (modo demo): coordenadas de respaldo para los puntos simulados.
const DEMO_COORDS = { latitude: 2.9273, longitude: -75.2895 };

type Padding = { top: number; right: number; bottom: number; left: number };
const PADDING_MAPA: Padding = { top: 80, right: 60, bottom: 80, left: 60 };
const PADDING_MAPA_COMPLETO: Padding = { top: 130, right: 60, bottom: 120, left: 60 };

// Cuánto esperar antes de la siguiente actualización, según cuántas van en el ciclo actual.
const esperaTrasActualizacion = (hechas: number) =>
  hechas % ACTUALIZACIONES_POR_CICLO === 0 ? REPOSO_MS : INTERVALO_ACTUALIZACION_MS;

const formatHora = (d: Date) =>
  d.toLocaleTimeString("es-CO", {
    timeZone: ZONA,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

const formatFecha = (d: Date) =>
  d.toLocaleDateString("es-CO", {
    timeZone: ZONA,
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatDuracion = (segundos: number) => {
  const s = Math.max(0, Math.round(segundos));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  return `${Math.floor(s / 3600)} h`;
};

export type ItemHistorial = {
  id: string;
  numero: string;
  hora: string;
  lat: string;
  lng: string;
  offset: string | null;
  barrio: string | null;
  esActual: boolean;
};

export function useAlertaContactoViewModel() {
  const { params } = useRoute<RouteProp<MainStackParamList, "AlertaContacto">>();

  // TEMPORAL: en modo demo no se consulta el backend, se simulan los puntos.
  const DEMO = params.demo === true;

  // Mapa pequeño de la pantalla y mapa de la ventana emergente.
  const mapRef = useRef<MapView>(null);
  const [mapaListo, setMapaListo] = useState(false);
  const mapaCompletoRef = useRef<MapView>(null);
  const [mapaCompletoListo, setMapaCompletoListo] = useState(false);
  const [mapaVisible, setMapaVisible] = useState(false);

  // Si la notificación trae coordenadas, se muestran de inmediato mientras llega el primer fetch.
  const [puntos, setPuntos] = useState<PuntoUbicacion[]>(() =>
    !DEMO && params.latitude != null && params.longitude != null
      ? [
          {
            id: "inicial",
            latitude: params.latitude,
            longitude: params.longitude,
            recordedAt: new Date(),
          },
        ]
      : [],
  );
  const [activa, setActiva] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [errorConexion, setErrorConexion] = useState(false);
  const [ahora, setAhora] = useState(Date.now());

  // Barrio y lugar de cada punto (id del punto -> "Carrera 7 · Barrio X"), por geocodificación inversa.
  const [barrios, setBarrios] = useState<Record<string, string>>({});
  const barriosConsultados = useRef<Set<string>>(new Set());
  const vivo = useRef(true);
  const demoContador = useRef(0); // ids únicos para los puntos simulados (no se reinicia)
  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
    };
  }, []);

  // Consulta el barrio/lugar solo de los puntos nuevos (los del historial), uno por uno y empezando
  // por el más reciente. Se espera 1,1 s entre consultas para respetar el límite del servicio.
  useEffect(() => {
    const pendientes = puntos
      .slice(-MAX_HISTORIAL)
      .filter((p) => !barriosConsultados.current.has(p.id))
      .reverse();
    if (pendientes.length === 0) return;
    pendientes.forEach((p) => barriosConsultados.current.add(p.id));

    (async () => {
      for (const p of pendientes) {
        if (!vivo.current) return;
        const lugar = await obtenerLugar(p.latitude, p.longitude);
        const texto = lugar ? descripcionLugar(lugar) : "";
        if (texto && vivo.current) {
          setBarrios((prev) => ({ ...prev, [p.id]: texto }));
        }
        await new Promise((r) => setTimeout(r, 1100));
      }
    })();
  }, [puntos]);

  // Consulta la alerta al abrir la pantalla y luego en ciclos: cada 30 s (10 veces) y 5 min de reposo;
  // se detiene cuando la usuaria la cancela o finaliza.
  useEffect(() => {
    if (DEMO) return undefined; // TEMPORAL

    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hechas = 0; // actualizaciones hechas (se cuentan todas, también las fallidas)

    const cargar = async () => {
      hechas += 1;
      try {
        const seguimiento = await getSeguimientoAlerta(params.alertaId);
        if (!mounted) return;

        setErrorConexion(false);
        if (seguimiento.puntos.length > 0) setPuntos(seguimiento.puntos);
        setCargando(false);

        const sigueActiva = !ESTADOS_FINALES.includes(seguimiento.estado);
        setActiva(sigueActiva);
        if (!sigueActiva) return; // última consulta hecha, no se reprograma
      } catch {
        if (!mounted) return;
        setErrorConexion(true);
        setCargando(false);
      }
      if (mounted) timer = setTimeout(cargar, esperaTrasActualizacion(hechas));
    };

    cargar();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [params.alertaId, DEMO]);

  // ===== TEMPORAL (modo demo): simula un punto nuevo caminando desde la ubicación base =====
  useEffect(() => {
    if (!DEMO) return undefined;

    const base = {
      latitude: params.latitude ?? DEMO_COORDS.latitude,
      longitude: params.longitude ?? DEMO_COORDS.longitude,
    };
    let hechas = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const agregarPunto = () => {
      hechas += 1;
      demoContador.current += 1;
      const id = `demo-${demoContador.current}`;
      setPuntos((prev) => {
        const last = prev.length > 0 ? prev[prev.length - 1] : null;
        const latitude = last
          ? last.latitude + 0.00018 + (Math.random() - 0.5) * 0.00008
          : base.latitude;
        const longitude = last
          ? last.longitude + 0.00022 + (Math.random() - 0.5) * 0.00008
          : base.longitude;
        return [...prev, { id, latitude, longitude, recordedAt: new Date() }];
      });
      setCargando(false);
      // Mismo ciclo que el real: 30 s entre puntos y reposo de 5 min cada 10.
      timer = setTimeout(agregarPunto, esperaTrasActualizacion(hechas));
    };

    agregarPunto();
    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DEMO]);
  // ===== FIN TEMPORAL =====

  // Reloj para el "hace X segundos".
  useEffect(() => {
    if (!activa) return undefined;
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activa]);

  const ultimo = puntos.length > 0 ? puntos[puntos.length - 1] : null;

  // Texto relativo: "5s", "3 min"... (la vista le agrega "hace" / "ago" según el idioma).
  const tiempoDesdeUltimo = ultimo
    ? formatDuracion((ahora - ultimo.recordedAt.getTime()) / 1000)
    : "";

  // Historial: más reciente arriba, con la misma numeración de los pines (1 = primer punto enviado).
  const historial: ItemHistorial[] = useMemo(() => {
    if (puntos.length === 0) return [];
    const ult = puntos[puntos.length - 1];
    return puntos
      .map((p, i) => {
        const esActual = i === puntos.length - 1;
        return {
          id: p.id,
          numero: String(i + 1).padStart(2, "0"),
          hora: formatHora(p.recordedAt),
          lat: p.latitude.toFixed(4),
          lng: p.longitude.toFixed(4),
          offset: esActual
            ? null
            : `-${formatDuracion((ult.recordedAt.getTime() - p.recordedAt.getTime()) / 1000)}`,
          barrio: barrios[p.id] ?? null,
          esActual,
        };
      })
      .reverse()
      .slice(0, MAX_HISTORIAL);
  }, [puntos, barrios]);

  // Encuadra todos los pines en el mapa indicado.
  const ajustarEn = useCallback(
    (ref: RefObject<MapView | null>, padding: Padding) => {
      if (!ref.current || puntos.length === 0) return;
      const coords = puntos.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));
      if (coords.length === 1) {
        ref.current.animateToRegion(
          { ...coords[0], latitudeDelta: 0.005, longitudeDelta: 0.005 },
          400,
        );
      } else {
        ref.current.fitToCoordinates(coords, { edgePadding: padding, animated: true });
      }
    },
    [puntos],
  );

  // Mapa pequeño: se reencuadra cuando llega un punto nuevo (no en cada consulta).
  useEffect(() => {
    if (mapaListo) ajustarEn(mapRef, PADDING_MAPA);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapaListo, puntos.length]);

  // Mapa de la ventana emergente: igual, mientras esté abierta.
  useEffect(() => {
    if (mapaVisible && mapaCompletoListo) ajustarEn(mapaCompletoRef, PADDING_MAPA_COMPLETO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapaVisible, mapaCompletoListo, puntos.length]);

  const onMapReady = useCallback(() => setMapaListo(true), []);
  const onMapaCompletoReady = useCallback(() => setMapaCompletoListo(true), []);

  // Abre la ventana emergente con el mapa (no se sale de la app ni se abre Google Maps).
  const abrirMapa = useCallback(() => {
    if (ultimo) setMapaVisible(true);
  }, [ultimo]);

  const cerrarMapa = useCallback(() => {
    setMapaVisible(false);
    setMapaCompletoListo(false);
  }, []);

  const verTodosLosPuntos = useCallback(() => {
    ajustarEn(mapaCompletoRef, PADDING_MAPA_COMPLETO);
  }, [ajustarEn]);

  const llamarEmergencias = useCallback(() => {
    const url = Platform.OS === "android" ? "tel:911" : "telprompt:911";
    Linking.openURL(url).catch(() => {});
  }, []);

  return {
    nombreUsuaria: params.nombreUsuaria,
    mapRef,
    mapaCompletoRef,
    puntos,
    ultimo,
    activa,
    cargando,
    errorConexion,
    tiempoDesdeUltimo,
    historial,
    barrioUltimo: ultimo ? (barrios[ultimo.id] ?? null) : null,
    fechaUltimo: ultimo ? formatFecha(ultimo.recordedAt) : "",
    horaUltimo: ultimo ? formatHora(ultimo.recordedAt) : "",
    coordsUltimo: ultimo
      ? `${ultimo.latitude.toFixed(4)}, ${ultimo.longitude.toFixed(4)}`
      : "",
    mapaVisible,
    onMapReady,
    onMapaCompletoReady,
    abrirMapa,
    cerrarMapa,
    verTodosLosPuntos,
    llamarEmergencias,
  };
}