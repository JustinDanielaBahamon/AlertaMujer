import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Alert, Animated, Linking, Platform } from "react-native";
import type MapView from "../../../components/mapa/MapaLibre";
import * as Location from "expo-location";
import { useNavigation, usePreventRemove, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { crearAlertaConReintentos, finalizarAlerta, getAlerta, getVistas } from "../../../services/alerts.service";
import { getAjustesPublicos } from "../../../services/settings.service";
import { aFecha } from "../../../services/alert-tracking.service";
import { getOrCreateDevice } from "../../../services/devices.service";
import type { PuntoUbicacion } from "../../../services/alert-tracking.service";
import { descripcionLugar, obtenerLugar } from "../../../services/geocoding.service";
import { reportarUbicacion } from "../../../services/location-reporter.service";
import { permisoUbicacion } from "../../../services/permisosSeguros";
import { tomarControlDeLaAlerta } from "../../agitar/alertaEnSegundoPlano";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type AlertaActivaRoute = RouteProp<MainStackParamList, "AlertaActiva">;

export type Coordenada = {
  latitude: number;
  longitude: number;
};

// Ciclo de actualizacion de la ubicacion: cada 30 s (10 veces) y luego 5 min de reposo.
const INTERVALO_ACTUALIZACION_MS = 30 * 1000;
const ACTUALIZACIONES_POR_CICLO = 10;
const REPOSO_MS = 5 * 60 * 1000;
const MAX_HISTORIAL = 15; // puntos a los que se les consulta el barrio (el mapa muestra todos)

// Cuanto esperar antes de la siguiente actualizacion, segun cuantas van en el ciclo actual.
const esperaTrasActualizacion = (hechas: number) =>
  hechas % ACTUALIZACIONES_POR_CICLO === 0 ? REPOSO_MS : INTERVALO_ACTUALIZACION_MS;

// La alerta espera la ubicación como máximo esto; si el GPS no responde (bajo techo, sin señal) se
// crea igual y la ubicación se agrega cuando llegue. Antes la alerta no se enviaba sin GPS.
const ESPERA_MAXIMA_UBICACION_MS = 8 * 1000;
// Una lectura de GPS que tarde más que esto se abandona y se usa la última ubicación conocida
const TIEMPO_MAXIMO_LECTURA_MS = 15 * 1000;
const ANTIGUEDAD_MAXIMA_ULTIMA_MS = 15 * 60 * 1000;

/** Ubicación actual con límite de tiempo; si no llega, la última que conoce el teléfono. */
async function leerUbicacion(): Promise<Location.LocationObject | null> {
  try {
    const actual = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolver) => setTimeout(() => resolver(null), TIEMPO_MAXIMO_LECTURA_MS)),
    ]);
    if (actual) return actual;
  } catch {
    // sin GPS: se intenta con la última conocida
  }
  return Location.getLastKnownPositionAsync({ maxAge: ANTIGUEDAD_MAXIMA_ULTIMA_MS }).catch(() => null);
}

// Si no se pueden leer los ajustes: duración máxima de una alerta y número de emergencias en Colombia
const DURACION_MAXIMA_POR_DEFECTO_MIN = 30;
const NUMERO_EMERGENCIA_POR_DEFECTO = "123";
// Cada cuánto se revisa en el servidor si la alerta sigue activa (vencida, atendida o cancelada)
const REVISION_ESTADO_MS = 30 * 1000;

/** Cómo terminó la alerta, cuando el servidor la cerró sin que la usuaria tocara "Estoy bien". */
export type FinAlerta = { estado: string; minutos: number };

// Mismo formato de tiempo relativo que el modulo "Alerta de emergencia": "5s", "3 min", "2 h".
const formatDuracion = (segundos: number) => {
  const s = Math.max(0, Math.round(segundos));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  return `${Math.floor(s / 3600)} h`;
};

type Padding = { top: number; right: number; bottom: number; left: number };
const PADDING_MAPA: Padding = { top: 80, right: 60, bottom: 80, left: 60 };
const PADDING_MAPA_COMPLETO: Padding = { top: 130, right: 60, bottom: 120, left: 60 };

export function useAlertaActivaViewModel() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { t } = useLocale();
  const route = useRoute<AlertaActivaRoute>();

  // Si viene un contacto, la alerta es solo para esa persona (no para todos).
  const contactoDestino = route.params?.contacto;
  const metodo = route.params?.metodo;
  // Alerta que ya se creó en segundo plano al agitar el teléfono
  const alertaExistente = route.params?.alertaId;

  // Referencia al id de la alerta creada en el backend (para poder cerrarla).
  const alertaCreadaIdRef = useRef<number | null>(null);
  // Mismo id como estado: el chat de la alerta aparece cuando ya existe
  const [alertaId, setAlertaId] = useState<number | null>(null);
  const [errorAlerta, setErrorAlerta] = useState<string | null>(null);
  // Estado del envío al servidor, para que la usuaria sepa si sus contactos ya fueron avisados
  const [envio, setEnvio] = useState<{ estado: "enviando" | "enviada" | "fallida"; intento: number; total: number }>({
    estado: "enviando",
    intento: 1,
    total: 1,
  });
  const [reintentosManuales, setReintentosManuales] = useState(0);
  // La creación con reintentos puede durar más que un cambio de ubicación: se usa el montaje de la pantalla
  const pantallaMontadaRef = useRef(true);
  useEffect(() => {
    pantallaMontadaRef.current = true;
    return () => {
      pantallaMontadaRef.current = false;
    };
  }, []);

  // Hasta cuándo sigue activa la alerta en el servidor (inicio + duración máxima del panel)
  const [inicioAlerta, setInicioAlerta] = useState<Date | null>(null);
  const [duracionMaximaMin, setDuracionMaximaMin] = useState(DURACION_MAXIMA_POR_DEFECTO_MIN);
  const [numeroEmergencia, setNumeroEmergencia] = useState(NUMERO_EMERGENCIA_POR_DEFECTO);
  // La alerta terminó en el servidor: se deja de enviar la ubicación y se pregunta qué hacer
  const [fin, setFin] = useState<FinAlerta | null>(null);
  const terminadaRef = useRef(false);
  useEffect(() => {
    getAjustesPublicos()
      .then((a) => {
        if (a.sosMaxDurationMinutes && a.sosMaxDurationMinutes > 0) setDuracionMaximaMin(a.sosMaxDurationMinutes);
        if (a.emergencyPhoneNumber) setNumeroEmergencia(a.emergencyPhoneNumber);
      })
      .catch(() => {});
  }, []);

  // Ubicacion actual, para el mini-mapa del header y para el mapa en pantalla completa.
  const [location, setLocation] = useState<Coordenada | null>(null);

  // Recorrido de la alerta: cada ubicacion obtenida se guarda como un punto (igual que en
  // "Alerta de emergencia": id, coordenadas y hora de registro). 1 = primer punto.
  const [puntos, setPuntos] = useState<PuntoUbicacion[]>([]);
  const puntoContador = useRef(0);
  const [ahora, setAhora] = useState(Date.now());

  // Barrio y lugar de cada punto (id del punto -> "Carrera 7 · Barrio X"), por geocodificacion inversa.
  const [barrios, setBarrios] = useState<Record<string, string>>({});
  const barriosConsultados = useRef<Set<string>>(new Set());
  const vivo = useRef(true);

  // Mapa pequeno y mapa en pantalla completa (refs para poder encuadrar todos los pines).
  const mapRef = useRef<MapView>(null);
  const [mapaListo, setMapaListo] = useState(false);
  const mapaCompletoRef = useRef<MapView>(null);
  const [mapaCompletoListo, setMapaCompletoListo] = useState(false);

  // Estado del mapa en pantalla completa (mismo mecanismo que useMapaViewModel: fullscreen + boton "cerrar mapa").
  const [fullscreen, setFullscreen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const closeOpacity = useRef(new Animated.Value(0)).current;

  // Modal de confirmacion para cancelar la alerta ("Estoy bien" -> "Si, cancelar").
  const [confirmarVisible, setConfirmarVisible] = useState(false);

  // Mientras la alerta está activa no se puede salir con "atrás" ni con el gesto: solo con
  // "Estoy bien" -> "Si, cancelar". Antes se podía salir, la alerta quedaba en curso sin enviar
  // ubicación y se podían activar otras encima.
  const [puedeSalir, setPuedeSalir] = useState(false);
  const nuevaAlertaRef = useRef(false);
  usePreventRemove(!puedeSalir, () => {
    Alert.alert(t.alertaActiva.salirBloqueadoTitulo, t.alertaActiva.salirBloqueadoDescripcion);
  });
  useEffect(() => {
    if (!puedeSalir) return;
    // "Sigo en peligro": se abre una alerta nueva (la anterior ya la cerró el servidor)
    if (nuevaAlertaRef.current) navigation.replace("AlertaActiva", contactoDestino ? { contacto: contactoDestino } : undefined);
    else navigation.replace("DrawerHome");
  }, [puedeSalir, navigation, contactoDestino]);

  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
    };
  }, []);


  const alertaCreacionIniciadaRef = useRef(false);
  // Última ubicación obtenida (para enviarla si la alerta se creó antes de tenerla)
  const ultimaUbicacionRef = useRef<{ latitude: number; longitude: number; accuracy?: number | null } | null>(null);
  const [esperaUbicacionVencida, setEsperaUbicacionVencida] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEsperaUbicacionVencida(true), ESPERA_MAXIMA_UBICACION_MS);
    return () => clearTimeout(t);
  }, []);

  // Si la alerta ya existe, esta pantalla toma el seguimiento que hacía el servicio en segundo plano
  useEffect(() => {
    if (!alertaExistente) return;
    alertaCreacionIniciadaRef.current = true;
    alertaCreadaIdRef.current = alertaExistente;
    setAlertaId(alertaExistente);
    setInicioAlerta(new Date());
    getAlerta(alertaExistente)
      .then((a) => a.startedAt && setInicioAlerta(aFecha(a.startedAt)))
      .catch(() => {});
    tomarControlDeLaAlerta();
  }, [alertaExistente]);

  // Crea la alerta en el backend al activar el SOS (una sola vez, incluyendo la ubicación).
  // Si falla, se vuelve a intentar con la siguiente ubicación o al tocar "Reintentar".
  useEffect(() => {
    (async () => {
      if (!user?.id || alertaCreacionIniciadaRef.current) return;
      if (!location && !esperaUbicacionVencida) return; // se espera un poco la ubicación, no más
      alertaCreacionIniciadaRef.current = true;

      try {
        setErrorAlerta(null);
        setEnvio({ estado: "enviando", intento: 1, total: 1 });
        const device = await getOrCreateDevice();
        const alerta = await crearAlertaConReintentos({
          userProfileId: user.id,
          deviceId: device.id,
          alertType: "main",
          activationMethod: contactoDestino ? "contact" : metodo === "agitar" ? "suspicious_movement" : "panic_button",
          status: "active",
          // Alerta normal; si es individual, el mensaje indica el contacto destinatario.
          message: contactoDestino
            ? `Alerta SOS activada desde la app solo para: ${contactoDestino.nombre ?? ""} (${contactoDestino.telefono})`
            : metodo === "agitar"
              ? "Alerta SOS activada al agitar el teléfono"
              : "Alerta SOS activada desde la app",
          latitude: location?.latitude,
          longitude: location?.longitude,
          // Alerta individual: el backend solo avisa a este contacto
          contactIds: contactoDestino ? [Number(contactoDestino.id)] : undefined,
        }, {
          alIntentar: ({ intento, total }) => pantallaMontadaRef.current && setEnvio({ estado: "enviando", intento, total }),
        });
        alertaCreadaIdRef.current = alerta.id;
        setAlertaId(alerta.id);
        setInicioAlerta(alerta.startedAt ? aFecha(alerta.startedAt) : new Date());
        if (pantallaMontadaRef.current) setEnvio((e) => ({ ...e, estado: "enviada" }));
        // El primer punto del recorrido sale ya: así el contacto ve dónde está desde el primer momento
        // (antes esperaba la siguiente lectura del GPS y veía "sin ubicaciones")
        if (ultimaUbicacionRef.current) {
          reportarUbicacion({ ...ultimaUbicacionRef.current, alertId: alerta.id });
        }
      } catch (err) {
        console.error("No se pudo crear la alerta en el backend:", err);
        // Se permite volver a intentarlo desde la pantalla
        alertaCreacionIniciadaRef.current = false;
        if (pantallaMontadaRef.current) {
          setErrorAlerta("No se pudo registrar la alerta en el servidor");
          setEnvio((e) => ({ ...e, estado: "fallida" }));
        }
      }
    })();
    // reintentosManuales: al tocar "Reintentar" se vuelve a correr la creación
  }, [user?.id, location, esperaUbicacionVencida, contactoDestino, metodo, reintentosManuales]);

  const reintentarEnvio = useCallback(() => {
    if (alertaCreadaIdRef.current || alertaCreacionIniciadaRef.current) return;
    setReintentosManuales((n) => n + 1);
  }, []);

  // Actualiza la ubicacion en ciclos para ahorrar bateria: cada 30 s (10 veces) y luego
  // 5 min de reposo, en los que el GPS no se consulta. Despues repite el ciclo.
  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hechas = 0;

    (async () => {
      if (!(await permisoUbicacion()) || !mounted) return;

      // La última ubicación conocida es inmediata: el mapa aparece sin esperar al GPS
      const ultima = await Location.getLastKnownPositionAsync({ maxAge: ANTIGUEDAD_MAXIMA_ULTIMA_MS }).catch(() => null);
      if (ultima && mounted) {
        const coords = { latitude: ultima.coords.latitude, longitude: ultima.coords.longitude };
        ultimaUbicacionRef.current = { ...coords, accuracy: ultima.coords.accuracy };
        setLocation((actual) => actual ?? coords);
      }

      const actualizar = async () => {
        if (terminadaRef.current) return; // la alerta terminó en el servidor: no se envía más
        hechas += 1;
        try {
          const current = await leerUbicacion();
          if (!current) throw new Error("Sin ubicación");
          if (!mounted) return;
          const coords = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          };
          setLocation(coords);
          ultimaUbicacionRef.current = { ...coords, accuracy: current.coords.accuracy };
          // Durante la alerta cada punto se envía al backend asociado a la alerta
          reportarUbicacion({ ...coords, accuracy: current.coords.accuracy, alertId: alertaCreadaIdRef.current });

          // Cada ubicacion obtenida tambien se registra como un punto del recorrido.
          puntoContador.current += 1;
          const id = `activa-${puntoContador.current}`;
          setPuntos((prev) => [...prev, { id, ...coords, recordedAt: new Date() }]);
        } catch {
          // Silenciar: si falla, el header muestra el icono de respaldo o la ultima ubicacion.
        }
        if (mounted) timer = setTimeout(actualizar, esperaTrasActualizacion(hechas));
      };

      actualizar();
    })();

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Consulta el barrio/lugar solo de los puntos nuevos, uno por uno y empezando por el mas
  // reciente. Se espera 1,1 s entre consultas para respetar el limite del servicio.
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

  // Reloj para el "hace X segundos" de la etiqueta del mapa.
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Tiempo que le queda a la alerta en el servidor (se actualiza con el reloj de cada segundo)
  const secondsLeft = inicioAlerta
    ? Math.max(0, Math.round((inicioAlerta.getTime() + duracionMaximaMin * 60000 - ahora) / 1000))
    : duracionMaximaMin * 60;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${String(seconds).padStart(2, "0")}`;

  // ¿Sigue activa? Se revisa cada 30 s y al llegar el contador a 0. Si el servidor la cerró
  // (venció, la marcaron atendida o se canceló desde otro lado) se deja de enviar la ubicación
  const revisarEstado = useCallback(async () => {
    const id = alertaCreadaIdRef.current;
    if (!id || terminadaRef.current) return;
    try {
      const a = await getAlerta(id);
      const estado = (a.status || "").toLowerCase();
      if (estado && estado !== "active") {
        terminadaRef.current = true;
        setFin({ estado, minutos: duracionMaximaMin });
      }
    } catch {
      // Sin conexión: se revisa en la siguiente vuelta
    }
  }, [duracionMaximaMin]);

  useEffect(() => {
    if (!alertaId) return;
    const t = setInterval(revisarEstado, REVISION_ESTADO_MS);
    return () => clearInterval(t);
  }, [alertaId, revisarEstado]);

  // Quién abrió el seguimiento: le da tranquilidad saber que sus contactos la están viendo
  const [vistas, setVistas] = useState({ total: 0, viendoAhora: 0 });
  useEffect(() => {
    if (!alertaId) return;
    const leer = () => getVistas(alertaId).then(setVistas).catch(() => {});
    leer();
    const t = setInterval(leer, 15000);
    return () => clearInterval(t);
  }, [alertaId]);

  const llegoACero = alertaId !== null && inicioAlerta !== null && secondsLeft === 0;
  useEffect(() => {
    if (llegoACero) revisarEstado();
  }, [llegoACero, revisarEstado]);

  // Datos derivados del ultimo punto (mismos que muestra "Alerta de emergencia").
  const ultimo = puntos.length > 0 ? puntos[puntos.length - 1] : null;
  const tiempoDesdeUltimo = ultimo
    ? formatDuracion((ahora - ultimo.recordedAt.getTime()) / 1000)
    : "";
  const barrioUltimo = ultimo ? (barrios[ultimo.id] ?? null) : null;
  const coordsUltimo = ultimo
    ? `${ultimo.latitude.toFixed(4)}, ${ultimo.longitude.toFixed(4)}`
    : "";

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

  // Mapa pequeno: se reencuadra cuando llega un punto nuevo.
  useEffect(() => {
    if (mapaListo) ajustarEn(mapRef, PADDING_MAPA);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapaListo, puntos.length]);

  // Mapa en pantalla completa: igual, mientras este abierto.
  useEffect(() => {
    if (fullscreen && mapaCompletoListo) ajustarEn(mapaCompletoRef, PADDING_MAPA_COMPLETO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen, mapaCompletoListo, puntos.length]);

  const onMapReady = useCallback(() => setMapaListo(true), []);
  const onMapaCompletoReady = useCallback(() => setMapaCompletoListo(true), []);

  const verTodosLosPuntos = useCallback(() => {
    ajustarEn(mapaCompletoRef, PADDING_MAPA_COMPLETO);
  }, [ajustarEn]);

  // Al tocar "Estoy bien" solo se abre la ventana de verificacion.
  const abrirConfirmacion = useCallback(() => {
    setConfirmarVisible(true);
  }, []);

  // Cierra la ventana de verificacion sin cancelar la alerta.
  const cerrarConfirmacion = useCallback(() => {
    setConfirmarVisible(false);
  }, []);

  // Se ejecuta cuando el usuario confirma "Si, cancelar".
  const marcarEstoyBien = useCallback(() => {
    setConfirmarVisible(false);
    // Cerrar la alerta activa en el backend (estado cancelada)
    if (alertaCreadaIdRef.current) {
      finalizarAlerta(alertaCreadaIdRef.current, "cancelled").catch((err) =>
        console.error("No se pudo cerrar la alerta en el backend:", err),
      );
    }
    setPuedeSalir(true);
  }, []);

  // Abre el marcador con el número de emergencias que define la administración (123 en Colombia)
  const llamarEmergencias = useCallback(() => {
    const url = Platform.OS === "android" ? `tel:${numeroEmergencia}` : `telprompt:${numeroEmergencia}`;
    Linking.openURL(url).catch(() => {
      // Ignorar silenciosamente si el dispositivo no puede realizar llamadas.
    });
  }, [numeroEmergencia]);

  // Cuando la alerta ya terminó en el servidor: salir o activar otra
  const activarOtraAlerta = useCallback(() => {
    setFin(null);
    nuevaAlertaRef.current = true;
    setPuedeSalir(true);
  }, []);
  const salirTrasFin = useCallback(() => {
    setFin(null);
    setPuedeSalir(true);
  }, []);

  // Abre el mapa en pantalla completa (equivalente al boton "navegar" del modulo Mapa),
  // pero sin salir de AlertaActiva: es un Modal local, no una navegacion.
  const abrirMapaCompleto = useCallback(() => {
    if (location) setFullscreen(true);
  }, [location]);

  // Al tocar el mapa en pantalla completa, muestra el boton "cerrar mapa" 15s (igual que en Mapa).
  const handleMapPress = useCallback(() => {
    if (showClose) return;

    setShowClose(true);
    Animated.timing(closeOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(closeOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowClose(false));
    }, 15000);
  }, [showClose, closeOpacity]);

  // Cierra el mapa en pantalla completa y se queda en AlertaActiva (no navega a ningun lado).
  const cerrarMapaCompleto = useCallback(() => {
    setFullscreen(false);
    setShowClose(false);
    setMapaCompletoListo(false);
  }, []);

  return {
    alertaId,
    formattedTime,
    marcarEstoyBien,
    abrirConfirmacion,
    cerrarConfirmacion,
    confirmarVisible,
    llamarEmergencias,
    location,
    fullscreen,
    showClose,
    closeOpacity,
    abrirMapaCompleto,
    handleMapPress,
    cerrarMapaCompleto,
    errorAlerta,
    envio,
    fin,
    vistas,
    activarOtraAlerta,
    salirTrasFin,
    numeroEmergencia,
    reintentarEnvio,
    // Mapa con el mismo diseno y datos que "Alerta de emergencia"
    mapRef,
    mapaCompletoRef,
    puntos,
    ultimo,
    tiempoDesdeUltimo,
    barrioUltimo,
    coordsUltimo,
    onMapReady,
    onMapaCompletoReady,
    verTodosLosPuntos,
  };
}