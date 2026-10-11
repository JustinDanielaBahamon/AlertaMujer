import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Circle, Marker, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../styles/MapaStyles";
import { createMapaModalStyles } from "../styles/MapaModal.style";
import { useMapaViewModel } from "../viewModel/useMapaViewModel";
import {
  MAX_IMPORTANTES,
  MAX_RECORRIDOS,
  useRecorridos,
} from "../../../contexts/RecorridosContext";
import { useAuth } from "../../../contexts/AuthContext";
import { frequentLocationsService } from "../../../services/frequent-locations.service";
import BarraBusquedaDireccion from "./BarraBusquedaDireccion";

type Coord = { latitude: number; longitude: number };

type InfoDireccion = {
  zona: string; // barrio, o la ciudad si no hay barrio (se usa en el encabezado)
  barrio: string;
  ciudad: string;
  direccion: string;
};

// Colores distintos para cada recorrido guardado, para que no se amontonen
const COLORES_RUTAS = [
  "#7B1DB2", // Púrpura
  "#2196F3", // Azul
  "#FF9800", // Naranja
  "#00BCD4", // Cyan
  "#9C27B0", // Violeta
  "#FF5722", // Naranja oscuro
  "#4CAF50", // Verde
  "#E91E63", // Rosa
];

// Zonas clasificadas por la usuaria (pantalla "Clasificar zona"), dibujadas como círculo en el mapa
type ZonaClasificada = {
  id: string;
  nombre: string;
  latitude: number;
  longitude: number;
  nivelRiesgo: "muy_segura" | "moderada" | "muy_insegura";
};

const RADIO_ZONA_METROS = 150;

const COLOR_NIVEL: Record<ZonaClasificada["nivelRiesgo"], string> = {
  muy_segura: "#27AE60",
  moderada: "#D89B00",
  muy_insegura: "#E74C3C",
};

const distanciaMetros = (a: Coord, b: Coord) => {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

// Consulta la dirección de unas coordenadas (barrio, ciudad y calle)
const obtenerInfoDireccion = async (coord: Coord): Promise<InfoDireccion> => {
  const reverse = await Location.reverseGeocodeAsync(coord);
  const info = reverse?.[0];

  const calle = info?.street || info?.name || "";
  const numero = info?.streetNumber || "";
  const barrio = info?.district || "";
  const municipio = info?.city || info?.subregion || "";

  return {
    zona: barrio || municipio,
    barrio,
    ciudad: [municipio, info?.region].filter(Boolean).join(", "),
    direccion: `${calle} ${numero}`.trim(),
  };
};

type EstilosMapa = ReturnType<typeof createMapaModalStyles>;

// Línea punteada + pines numerados del recorrido (mismo diseño que "Alerta de emergencia")
function PinesHistorial({
  puntos,
  actual,
  colorLinea,
  styles: ms,
  trackear,
  etiqueta,
  tituloActual,
}: {
  puntos: Coord[];
  actual: Coord;
  colorLinea: string;
  styles: EstilosMapa;
  trackear: boolean;
  etiqueta: string;
  tituloActual: string;
}) {
  // La línea termina en la posición actual
  const linea = [...puntos, actual];

  return (
    <>
      {linea.length > 1 && (
        <Polyline
          coordinates={linea}
          strokeColor={colorLinea}
          strokeWidth={3}
          lineDashPattern={[6, 4]}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {puntos.map((p, i) => (
        <Marker
          key={`hist-${i}`}
          coordinate={p}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={trackear}
          zIndex={i}
          title={`${etiqueta} ${i + 1}`}
        >
          <View style={ms.pin}>
            <Text style={ms.pinText}>{i + 1}</Text>
          </View>
        </Marker>
      ))}

      {/* Posición actual: pin grande al frente */}
      <Marker
        coordinate={actual}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={trackear}
        zIndex={999}
        title={tituloActual}
      >
        <View style={ms.pinActual}>
          <MaterialIcons name="my-location" size={18} color="#FFFFFF" />
        </View>
      </Marker>
    </>
  );
}

export default function MapaView() {
  const navigation = useNavigation<any>();
  const { recorridos } = useRecorridos();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const mapaRef = useRef<MapView>(null);
  const montado = useRef(true);
  const ultimaGeocodificada = useRef<Coord | null>(null);

  const [mostrarRecorridosEnMapa, setMostrarRecorridosEnMapa] = useState(true); // Activado por defecto
  const [soloImportantes, setSoloImportantes] = useState(false); // Mostrar todos por defecto
  const [infoDireccion, setInfoDireccion] = useState<InfoDireccion | null>(null);
  const [recorridoInfoVisible, setRecorridoInfoVisible] = useState(false);
  const [recorridoInfo, setRecorridoInfo] = useState<any>(null);
  const [mapaListo, setMapaListo] = useState(false); // el mapa grande se dibuja cuando termina la animación del modal
  const [trackear, setTrackear] = useState(true); // los pines personalizados se redibujan solo unos instantes
  const [zonasClasificadas, setZonasClasificadas] = useState<ZonaClasificada[]>([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [resultadoBusqueda, setResultadoBusqueda] = useState<{
    coord: Coord;
    texto: string;
  } | null>(null);

  const {
    theme,
    t,
    location,
    fullscreen,
    setFullscreen,
    historial,
    destinoAlerta,
    coordenadaCentro,
    ultimaActualizacion,
    formatearHora,
    refrescarUbicacion,
    reintentarPermisos,
    irAUbicacionesGuardadas,
    irAZonasAuxiliares,
    irAHistorialRecorridos,
    permisoDenegado,
    serviciosDesactivados,
    cargando,
  } = useMapaViewModel() as any;

  const ms = useMemo(() => createMapaModalStyles(theme, insets), [theme, insets]);

  const direccionActual = infoDireccion
    ? infoDireccion.zona
      ? `${infoDireccion.zona}, ${infoDireccion.direccion}`.replace(/, $/, "")
      : infoDireccion.direccion
    : "";

  // Recorridos guardados que se dibujan en el mapa grande (misma lógica de siempre)
  const recorridosVisibles = useMemo(
    () =>
      !mostrarRecorridosEnMapa
        ? []
        : (recorridos as any[]).filter(
            (r) => r?.puntos?.length > 0 && (!soloImportantes || r.importante)
          ),
    [recorridos, mostrarRecorridosEnMapa, soloImportantes]
  );

  const irAGuardarRecorrido = () => {
    navigation.navigate("GuardarRecorrido");
  };

  // Zonas clasificadas (seguras / moderadas / inseguras): se recargan cada vez que se vuelve al mapa
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        try {
          if (!user?.id) {
            if (activo) setZonasClasificadas([]);
            return;
          }
          const guardadas = await frequentLocationsService.getByUser(user.id);
          if (!activo) return;
          setZonasClasificadas(
            guardadas
              .filter(
                (u) => u.isActive !== false && u.latitude != null && u.longitude != null
              )
              .map((u) => ({
                id: String(u.id),
                nombre: u.name,
                latitude: Number(u.latitude),
                longitude: Number(u.longitude),
                nivelRiesgo:
                  u.riskLevel === "muy_segura" || u.riskLevel === "muy_insegura"
                    ? u.riskLevel
                    : "moderada",
              }))
          );
        } catch (error) {
          console.error("Error al cargar zonas clasificadas:", error);
        }
      })();
      return () => {
        activo = false;
      };
    }, [user?.id])
  );

  // Al buscar una dirección con el mapa grande abierto, la cámara se mueve hasta ahí
  useEffect(() => {
    if (!fullscreen || !mapaListo || !resultadoBusqueda) return;
    mapaRef.current?.animateToRegion(
      {
        latitude: resultadoBusqueda.coord.latitude,
        longitude: resultadoBusqueda.coord.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      },
      500
    );
  }, [resultadoBusqueda, fullscreen, mapaListo]);

  const manejarResultadoBusqueda = (coord: Coord, texto: string) => {
    setResultadoBusqueda({ coord, texto });
    setFullscreen(true);
  };

  const limpiarBusqueda = () => {
    setTextoBusqueda("");
    setResultadoBusqueda(null);
  };

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  // El mapa grande se monta al terminar de deslizar el modal para que la animación no se trabe
  useEffect(() => {
    if (!fullscreen) {
      setMapaListo(false);
      return;
    }
    const id = setTimeout(() => setMapaListo(true), 300);
    return () => clearTimeout(id);
  }, [fullscreen]);

  // Los pines personalizados se redibujan unos instantes cuando cambian o se abre el mapa
  useEffect(() => {
    setTrackear(true);
    const id = setTimeout(() => setTrackear(false), 600);
    return () => clearTimeout(id);
  }, [historial?.length, fullscreen, mapaListo, recorridosVisibles.length]);

  // Dirección actual (reverse geocoding). Solo se consulta al inicio o si se movió más de 40 m,
  // así no se hace una petición de red en cada actualización del GPS.
  useEffect(() => {
    if (!location) return;

    const anterior = ultimaGeocodificada.current;
    if (anterior && distanciaMetros(anterior, location) < 40) return;
    ultimaGeocodificada.current = location;

    (async () => {
      try {
        const info = await obtenerInfoDireccion(location);
        if (montado.current) setInfoDireccion(info);
      } catch (error) {
        console.error("Error al obtener dirección:", error);
      }
    })();
  }, [location]);

  const handleCompartir = async () => {
    if (!location) return;

    try {
      let info = infoDireccion;
      if (!info) {
        try {
          info = await obtenerInfoDireccion(location);
        } catch {
          info = null;
        }
      }

      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const hora = ahora.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const lat = location.latitude.toFixed(6);
      const lng = location.longitude.toFixed(6);

      // Solo se incluyen las líneas de las que realmente hay dato
      const lineas = [
        t.mapa.mensaje_ubicacion,
        "",
        info?.barrio ? `🏘️ Barrio: ${info.barrio}` : null,
        info?.ciudad ? `🏙️ Ciudad: ${info.ciudad}` : null,
        info?.direccion ? `🛣️ Dirección: ${info.direccion}` : null,
        `🧭 Coordenadas: ${lat}, ${lng}`,
        "",
        "🗺️ Ábrela en el mapa:",
        `https://www.google.com/maps?q=${lat},${lng}`,
        "",
        `🕐 Enviado el ${fecha} a las ${hora}`,
        "💜 Compartido desde AlertaMujer",
      ].filter((linea): linea is string => linea !== null);

      await Share.share({
        title: t.mapa.compartir_ubicacion,
        message: lineas.join("\n"),
      });
    } catch (error) {
      console.error("Error al compartir ubicación:", error);
      Alert.alert("Error", `${t.mapa.compartir_error}. Inténtalo nuevamente.`);
    }
  };

  // ─── PANTALLA DE CARGA ────────────────────────────────────────────────────
  if (!location) {
    const esError = permisoDenegado || serviciosDesactivados;
    
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <MaterialIcons 
          name={serviciosDesactivados ? "settings" : (permisoDenegado ? "location-off" : "location-searching")} 
          size={48} 
          color={esError ? "#E74C3C" : "#7B1DB2"} 
        />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          {serviciosDesactivados 
            ? "Ubicación desactivada" 
            : (permisoDenegado 
              ? "Permiso de ubicación denegado" 
              : (cargando ? t.mapa.cargando : "No se pudo obtener la ubicación"))}
        </Text>
        {serviciosDesactivados && (
          <Text style={[styles.loadingText, { color: theme.contactSubtext, fontSize: 13, marginTop: 4, textAlign: "center" }]}>
            Activa los servicios de ubicación en la configuración de tu dispositivo
          </Text>
        )}
        {permisoDenegado && (
          <Text style={[styles.loadingText, { color: theme.contactSubtext, fontSize: 13, marginTop: 4, textAlign: "center" }]}>
            AlertaMujer necesita acceso a tu ubicación para mostrarte el mapa y garantizar tu seguridad
          </Text>
        )}
        <TouchableOpacity style={styles.botonReintentar} onPress={reintentarPermisos}>
          <Text style={styles.botonReintentarTexto}>{serviciosDesactivados ? "Verificar de nuevo" : t.mapa.intentar_nuevo}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── COORDENADA CENTRO Y ACCIONES LOCALES ─────────────────────────────────
  const centroCalculado = coordenadaCentro ?? destinoAlerta?.coordenada ?? location;
  const centroMapa: Coord = resultadoBusqueda?.coord ?? centroCalculado;

  // Círculo del color del nivel de seguridad de cada zona clasificada
  const renderZonasClasificadas = () =>
    zonasClasificadas.map((zona) => {
      const color = COLOR_NIVEL[zona.nivelRiesgo];
      return (
        <Circle
          key={`zona-${zona.id}`}
          center={{ latitude: zona.latitude, longitude: zona.longitude }}
          radius={RADIO_ZONA_METROS}
          strokeColor={color}
          strokeWidth={2}
          fillColor={`${color}33`}
        />
      );
    });

  const acciones = [
    {
      icono: "share",
      label: t.mapa.compartir,
      accion: handleCompartir,
    },
    {
      icono: "refresh",
      label: t.mapa.actualizar,
      accion: refrescarUbicacion,
    },
    {
      icono: "navigation",
      label: t.mapa.navegar,
      accion: () => {
        if (location) {
          setFullscreen(true);
        }
      },
    },
    {
      icono: "bookmark",
      label: t.mapa.guardar,
      accion: () => {
        if (!location) return;
        navigation.navigate("ClasificarZona", {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      },
    },
  ] as const;

  // ─── ENCUADRE DEL MAPA GRANDE ─────────────────────────────────────────────
  // Todos los puntos que están visibles: ubicación, dirección de alerta, historial y recorridos.
  const puntosVisibles = (): Coord[] => {
    const pts: Coord[] = [location];
    if (destinoAlerta) pts.push(destinoAlerta.coordenada);
    if (resultadoBusqueda) pts.push(resultadoBusqueda.coord);
    (historial ?? []).forEach((p: Coord) => pts.push(p));
    recorridosVisibles.forEach((r: any) =>
      r.puntos.forEach((p: any) => pts.push({ latitude: p.latitude, longitude: p.longitude }))
    );
    return pts;
  };

  const verTodo = () => {
    const pts = puntosVisibles();
    if (pts.length < 2) {
      centrarEnMi();
      return;
    }
    mapaRef.current?.fitToCoordinates(pts, {
      edgePadding: { top: insets.top + 90, right: 60, bottom: insets.bottom + 130, left: 60 },
      animated: true,
    });
  };

  const centrarEnMi = () => {
    mapaRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      400
    );
  };

  const abrirInfoRecorrido = (recorrido: any) => {
    setRecorridoInfo(recorrido);
    setRecorridoInfoVisible(true);
  };

  return (
    <View style={[styles.contenedorPrincipal, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER GRADIENTE */}
        <LinearGradient
          colors={[theme.headercolor1, theme.headercolor2]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradiente, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.headerContenido}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloHeader}>{t.mapa.titulo}</Text>
              <Text style={styles.SubtituloHeader}>{t.mapa.subtitulo}</Text>
              <View style={styles.filaUbicacion}>
                <MaterialIcons name="place" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.subtituloHeader}>
                  {direccionActual || t.mapa.obteniendo}
                </Text>
              </View>
            </View>
            <Image
              source={require("../../../../assets/imagesAlertaMujer/ScMapa/iconoUbi.png")}
              style={{ width: 100, height: 85, resizeMode: "cover" }}
            />
          </View>
        </LinearGradient>

        {/* BARRA DE BÚSQUEDA DE DIRECCIÓN */}
        <BarraBusquedaDireccion
          style={{ marginHorizontal: 20, marginTop: 20 }}
          value={textoBusqueda}
          onChangeText={setTextoBusqueda}
          onResultado={manejarResultadoBusqueda}
          onLimpiar={limpiarBusqueda}
          ciudad={infoDireccion?.ciudad}
        />

        {/* MAPA */}
        <View style={ms.mapaCard}>
          <MapView
            style={ms.miniMapa}
            liteMode
            pointerEvents="none"
            toolbarEnabled={false}
            region={{
              latitude: centroMapa.latitude,
              longitude: centroMapa.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            {renderZonasClasificadas()}
            <Marker coordinate={location} title={t.mapa.tu_ubicacion_marcador} pinColor={theme.icono} />
            {resultadoBusqueda && (
              <Marker
                coordinate={resultadoBusqueda.coord}
                title={resultadoBusqueda.texto}
                pinColor="#E91E63"
              />
            )}
            {destinoAlerta && (
              <Marker
                coordinate={destinoAlerta.coordenada}
                title={t.mapa.direccion_alerta_marcador}
                description={destinoAlerta.direccion}
                pinColor="#7B1DB2"
              />
            )}
          </MapView>

          {/* Capa transparente: intercepta el toque para que Android no abra la app de Google Maps */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setFullscreen(true)}
            activeOpacity={0.9}
          >
            <View style={ms.miniBadge}>
              <View style={ms.miniBadgePunto} />
              <Text style={ms.miniBadgeTexto}>{t.mapa.activo}</Text>
            </View>
            <View style={ms.abrirBtn}>
              <MaterialIcons name="open-in-full" size={16} color={theme.icono} />
              <Text style={ms.abrirTexto}>{t.mapa.abrir_mapa_completo}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SWITCH DE RECORRIDOS */}
        <View style={[styles.switchRecorridosContainer, { backgroundColor: theme.card }]}>
          <View style={styles.switchRecorridosInfo}>
            <MaterialIcons name="route" size={20} color="#7B1DB2" />
            <View style={styles.switchRecorridosText}>
              <Text style={[styles.switchRecorridosTitle, { color: theme.text }]}>
                Mostrar recorridos
              </Text>
              <Text style={[styles.switchRecorridosSubtitle, { color: theme.contactSubtext }]}>
                {recorridos.length}/{MAX_RECORRIDOS} recorridos guardados
              </Text>
            </View>
          </View>
          <Switch
            value={mostrarRecorridosEnMapa}
            onValueChange={(value) => {
              setMostrarRecorridosEnMapa(value);
              console.log('Switch cambiado:', value);
            }}
            trackColor={{ false: '#ccc', true: theme.tabActiveColor }}
            thumbColor="#fff"
          />
        </View>

        {/* SWITCH DE SOLO IMPORTANTES */}
        {mostrarRecorridosEnMapa && (
          <View style={[styles.switchRecorridosContainer, { backgroundColor: theme.card }]}>
            <View style={styles.switchRecorridosInfo}>
              <MaterialIcons name="star" size={20} color="#FFD700" />
              <View style={styles.switchRecorridosText}>
                <Text style={[styles.switchRecorridosTitle, { color: theme.text }]}>
                  Solo importantes
                </Text>
                <Text style={[styles.switchRecorridosSubtitle, { color: theme.contactSubtext }]}>
                  {recorridos.filter((r: any) => r.importante).length}/{MAX_IMPORTANTES} importantes
                </Text>
              </View>
            </View>
            <Switch
              value={soloImportantes}
              onValueChange={setSoloImportantes}
              trackColor={{ false: '#ccc', true: theme.tabActiveColor }}
              thumbColor="#fff"
            />
          </View>
        )}

        {/* BOTONES DE ACCIÓN */}
        <View style={styles.filaBotones}>
          {acciones.map((a) => (
            <TouchableOpacity key={a.label} style={styles.botonAccion} onPress={a.accion}>
              <View style={styles.circuloBoton}>
                <MaterialIcons name={a.icono} size={22} color="#7B1DB2" />
              </View>
              <Text style={[styles.labelBoton, { color: theme.text }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TARJETA COORDENADAS */}
        <View style={[styles.tarjetaCoordenadas, { backgroundColor: theme.card }]}>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.columnaCoord}>
              <Text style={[styles.labelCoord, { color: theme.contactSubtext }]}>{t.mapa.latitud}</Text>
              <Text style={[styles.valorCoord, { color: theme.text }]}>{location.latitude.toFixed(5)}</Text>
            </View>
            <View style={styles.columnaCoord}>
              <Text style={[styles.labelCoord, { color: theme.contactSubtext }]}>{t.mapa.longitud}</Text>
              <Text style={[styles.valorCoord, { color: theme.text }]}>{location.longitude.toFixed(5)}</Text>
            </View>
          </View>

          <View style={styles.filaActivo}>
            <Text style={[styles.textoActualizacion, { color: theme.contactSubtext }]}>
              {t.mapa.ultima_actualizacion}{" "}
              {ultimaActualizacion ? `${t.inicio.hoy}, ${formatearHora(ultimaActualizacion)}` : "--"}
            </Text>
            <View style={styles.badgeActivo}>
              <View style={styles.puntoActivo} />
              <Text style={styles.textoActivo}>{t.mapa.activo}</Text>
            </View>
          </View>
        </View>

        {/* TÍTULO ACCIONES ADICIONALES */}
        <Text style={[styles.tituloHistorial, { color: theme.text }]}>
          {t.mapa.acciones_adicionales}
        </Text>

        {/* UBICACIONES GUARDADAS */}
        <TouchableOpacity
          style={[styles.itemHistorial, { backgroundColor: theme.card }]}
          onPress={irAUbicacionesGuardadas}
          activeOpacity={0.85}
        >
          <View style={[styles.numeroBurbuja, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="bookmark" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fechaItem, { color: theme.text }]}>{t.mapa.ubicaciones_guardadas}</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              {t.mapa.ubicaciones_guardadas_desc}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
        </TouchableOpacity>

        {/* ZONAS AUXILIARES */}
        <TouchableOpacity
          style={[styles.itemHistorial, { backgroundColor: theme.card }]}
          onPress={irAZonasAuxiliares}
          activeOpacity={0.85}
        >
          <View style={[styles.numeroBurbuja, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="shield" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fechaItem, { color: theme.text }]}>{t.mapa.zonas_auxiliares}</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              {t.mapa.zonas_auxiliares_desc}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext}/>
        </TouchableOpacity>

           {/* GUARDAR RECORRIDO */}
        <TouchableOpacity
          style={[styles.itemHistorial, { backgroundColor: theme.card }]}
          onPress={irAGuardarRecorrido}
          activeOpacity={0.85}
        >
          <View style={[styles.numeroBurbuja, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="add-location-alt" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fechaItem, { color: theme.text }]}>Guardar Recorrido</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              Crea rutas de punto A a punto B
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
        </TouchableOpacity>

        {/* HISTORIAL DE RECORRIDOS */}
        <TouchableOpacity
          style={[styles.itemHistorial, { backgroundColor: theme.card }]}
          onPress={irAHistorialRecorridos}
          activeOpacity={0.85}
        >
          <View style={[styles.numeroBurbuja, { backgroundColor: "rgb(237, 231, 246)" }]}>
            <MaterialIcons name="history" size={18} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fechaItem, { color: theme.text }]}>{t.mapa.historial_recorridos}</Text>
            <Text style={[styles.coordItem, { color: theme.contactSubtext }]}>
              {t.mapa.historial_recorridos_desc}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
        </TouchableOpacity>

       
      </ScrollView>

      {/* MODAL PANTALLA COMPLETA (mismo diseño que "Alerta de emergencia") */}
      <Modal
        visible={fullscreen}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setFullscreen(false)}
      >
        <View style={ms.modalContainer}>
          {mapaListo ? (
            <MapView
              ref={mapaRef}
              style={ms.modalMap}
              toolbarEnabled={false}
              initialRegion={{
                latitude: centroMapa.latitude,
                longitude: centroMapa.longitude,
                latitudeDelta: resultadoBusqueda ? 0.006 : 0.01,
                longitudeDelta: resultadoBusqueda ? 0.006 : 0.01,
              }}
            >
              {/* Zonas clasificadas: círculo del color de su nivel de seguridad */}
              {renderZonasClasificadas()}

              <PinesHistorial
                puntos={historial ?? []}
                actual={location}
                colorLinea={theme.icono}
                styles={ms}
                trackear={trackear}
                etiqueta={t.mapa.historial}
                tituloActual={t.mapa.tu_ubicacion_marcador}
              />

              {resultadoBusqueda && (
                <Marker
                  coordinate={resultadoBusqueda.coord}
                  title={resultadoBusqueda.texto}
                  pinColor="#E91E63"
                />
              )}

              {destinoAlerta && (
                <Marker
                  coordinate={destinoAlerta.coordenada}
                  anchor={{ x: 0.5, y: 0.5 }}
                  tracksViewChanges={trackear}
                  zIndex={998}
                  title={t.mapa.direccion_alerta_marcador}
                  description={destinoAlerta.direccion}
                >
                  <View style={ms.pinActual}>
                    <MaterialIcons name="place" size={20} color="#FFFFFF" />
                  </View>
                </Marker>
              )}

              {/* Recorridos guardados (misma lógica: interruptores de la pantalla y toque para ver información) */}
              {recorridosVisibles.map((recorrido: any, index: number) => {
                const routeColor = COLORES_RUTAS[index % COLORES_RUTAS.length];
                const puntos = recorrido.puntos.map((punto: any) => ({
                  latitude: punto.latitude,
                  longitude: punto.longitude,
                }));

                return (
                  <React.Fragment key={recorrido.id}>
                    {puntos.length > 1 && (
                      <Polyline
                        coordinates={puntos}
                        strokeWidth={4}
                        strokeColor={routeColor}
                        lineDashPattern={[6, 4]}
                        lineCap="round"
                        lineJoin="round"
                        tappable
                        onPress={() => abrirInfoRecorrido(recorrido)}
                      />
                    )}

                    {/* Marcador de inicio */}
                    <Marker
                      coordinate={puntos[0]}
                      anchor={{ x: 0.5, y: 0.5 }}
                      tracksViewChanges={trackear}
                      title={
                        recorrido.nombrePersonalizado ||
                        `${recorrido.barrioInicio} → ${recorrido.barrioFin}`
                      }
                      description="Inicio del recorrido"
                      onPress={() => abrirInfoRecorrido(recorrido)}
                    >
                      <View style={[ms.pinRuta, { backgroundColor: routeColor }]}>
                        <MaterialIcons name="trip-origin" size={14} color="#FFFFFF" />
                      </View>
                    </Marker>

                    {/* Marcador de fin */}
                    <Marker
                      coordinate={puntos[puntos.length - 1]}
                      anchor={{ x: 0.5, y: 0.5 }}
                      tracksViewChanges={trackear}
                      title="Fin"
                    >
                      <View style={[ms.pinRuta, { backgroundColor: "#F44336" }]}>
                        <MaterialIcons name="flag" size={14} color="#FFFFFF" />
                      </View>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapView>
          ) : (
            <View style={ms.modalLoading}>
              <ActivityIndicator size="large" color={theme.icono} />
            </View>
          )}

          {/* Barra superior: cerrar + estado de la ubicación */}
          <View style={ms.modalTopBar} pointerEvents="box-none">
            <TouchableOpacity
              style={ms.modalCloseBtn}
              onPress={() => setFullscreen(false)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t.mapa.cerrar_mapa}
            >
              <MaterialIcons name="close" size={20} color={theme.icono} />
              <Text style={ms.modalCloseText}>{t.mapa.cerrar_mapa}</Text>
            </TouchableOpacity>

            <View style={ms.modalTitlePill} pointerEvents="none">
              <Text style={ms.modalTitle} numberOfLines={1}>
                {t.mapa.tu_ubicacion_marcador}
              </Text>
              <Text style={ms.modalSub} numberOfLines={1}>
                {t.mapa.ultima_actualizacion}{" "}
                {ultimaActualizacion ? formatearHora(ultimaActualizacion) : "--"}
              </Text>
            </View>
          </View>

          {/* Búsqueda de dirección dentro del mapa grande */}
          <BarraBusquedaDireccion
            style={{
              position: "absolute",
              top: insets.top + 66,
              left: insets.left + 12,
              right: insets.right + 12,
            }}
            value={textoBusqueda}
            onChangeText={setTextoBusqueda}
            onResultado={(coord, texto) => setResultadoBusqueda({ coord, texto })}
            onLimpiar={limpiarBusqueda}
            ciudad={infoDireccion?.ciudad}
          />

          {/* Leyenda de niveles de seguridad */}
          {zonasClasificadas.length > 0 && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: insets.top + 126,
                left: insets.left + 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 12,
                height: 30,
                borderRadius: 15,
                backgroundColor: theme.containerBackground,
              }}
            >
              {(
                [
                  ["muy_segura", "Segura"],
                  ["moderada", "Moderada"],
                  ["muy_insegura", "Insegura"],
                ] as const
              ).map(([nivel, etiqueta]) => (
                <View key={nivel} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: COLOR_NIVEL[nivel],
                    }}
                  />
                  <Text style={{ fontSize: 10.5, fontWeight: "700", color: theme.text }}>
                    {etiqueta}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Coordenadas y dirección actual */}
          <View style={ms.modalInfo} pointerEvents="none">
            <Text style={ms.modalInfoText} numberOfLines={1}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
            {!!direccionActual && (
              <Text style={ms.modalInfoBarrio} numberOfLines={2}>
                {direccionActual}
              </Text>
            )}
          </View>

          {/* Ir a mi ubicación / encuadrar todos los puntos */}
          <TouchableOpacity
            style={ms.modalLocBtn}
            onPress={centrarEnMi}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <MaterialIcons name="my-location" size={22} color={theme.icono} />
          </TouchableOpacity>
          <TouchableOpacity
            style={ms.modalFitBtn}
            onPress={verTodo}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <MaterialIcons name="zoom-out-map" size={22} color={theme.icono} />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL INFORMACIÓN DE RECORRIDO */}
      <Modal visible={recorridoInfoVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setRecorridoInfoVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Información del Recorrido
                  </Text>
                  <TouchableOpacity onPress={() => setRecorridoInfoVisible(false)}>
                    <MaterialIcons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                
                {recorridoInfo && (
                  <View style={styles.modalBody}>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="route" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Nombre:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {recorridoInfo.nombrePersonalizado || `${recorridoInfo.barrioInicio} → ${recorridoInfo.barrioFin}`}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="place" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Inicio:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {recorridoInfo.barrioInicio}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="flag" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Fin:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {recorridoInfo.barrioFin}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="calendar-today" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Fecha:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {recorridoInfo.fecha}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="schedule" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Tiempo estimado:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {recorridoInfo.tiempoEstimado}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="straighten" size={20} color="#7B1DB2" />
                      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>Distancia:</Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {recorridoInfo.distanciaEstimada}
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setRecorridoInfoVisible(false)}
                >
                  <Text style={styles.modalCloseText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}