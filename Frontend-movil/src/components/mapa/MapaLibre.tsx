// Mapa gratuito basado en MapLibre + teselas de OpenFreeMap (datos de OpenStreetMap).
// Reemplaza a react-native-maps (Google Maps, que exige clave y facturación) manteniendo
// la misma forma de uso: <MapView>, <Marker>, <Polyline>, <Circle> y los métodos
// animateToRegion / fitToCoordinates, para que las pantallas solo cambien el import.
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker as MarkerLibre,
  type CameraRef,
} from "@maplibre/maplibre-react-native";
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";

/** Estilo de mapa gratuito y sin clave (https://openfreemap.org). */
export const ESTILO_MAPA = "https://tiles.openfreemap.org/styles/liberty";

export type LatLng = { latitude: number; longitude: number };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };
export type MapPressEvent = { nativeEvent: { coordinate: LatLng } };

type EdgePadding = { top: number; right: number; bottom: number; left: number };

const ZOOM_MIN = 2;
const ZOOM_MAX = 19;

/** Convierte el "delta" de una región (grados visibles) al nivel de zoom equivalente. */
const zoomDeRegion = (r: Region) => {
  const delta = Math.max(r.longitudeDelta, r.latitudeDelta, 0.0005);
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.log2(360 / delta)));
};

const lngLat = (c: LatLng): [number, number] => [c.longitude, c.latitude];

// Ids de fuentes y capas de MapLibre: deben ser únicos y sin caracteres especiales.
const useIdMapa = (prefijo: string) => `${prefijo}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

// ─── MapView ────────────────────────────────────────────────────────────────

type MapViewProps = {
  style?: StyleProp<ViewStyle>;
  initialRegion?: Region;
  region?: Region;
  onPress?: (event: MapPressEvent) => void;
  onMapReady?: () => void;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
  /** Solo existían en Google Maps; se ignoran. */
  toolbarEnabled?: boolean;
  liteMode?: boolean;
  pointerEvents?: "box-none" | "none" | "box-only" | "auto";
  children?: ReactNode;
};

export type MapViewHandle = {
  animateToRegion: (region: Region, duration?: number) => void;
  fitToCoordinates: (
    coordinates: LatLng[],
    options?: { edgePadding?: EdgePadding; animated?: boolean },
  ) => void;
};

const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  {
    style,
    initialRegion,
    region,
    onPress,
    onMapReady,
    scrollEnabled = true,
    zoomEnabled = true,
    rotateEnabled = true,
    pitchEnabled = true,
    pointerEvents,
    children,
  },
  ref,
) {
  const camara = useRef<CameraRef>(null);
  const inicial = initialRegion ?? region;

  useImperativeHandle(ref, () => ({
    animateToRegion: (r, duration = 500) =>
      camara.current?.easeTo({ center: lngLat(r), zoom: zoomDeRegion(r), duration }),
    fitToCoordinates: (coords, options) => {
      if (coords.length === 0) return;
      if (coords.length === 1) {
        camara.current?.easeTo({ center: lngLat(coords[0]), zoom: 16, duration: 500 });
        return;
      }
      const lngs = coords.map((c) => c.longitude);
      const lats = coords.map((c) => c.latitude);
      camara.current?.fitBounds(
        [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)],
        { padding: options?.edgePadding, duration: options?.animated === false ? 0 : 500 },
      );
    },
  }));

  // Región controlada: si la pantalla cambia `region`, la cámara la sigue.
  useEffect(() => {
    if (!region) return;
    camara.current?.easeTo({ center: lngLat(region), zoom: zoomDeRegion(region), duration: 400 });
  }, [region?.latitude, region?.longitude, region?.latitudeDelta, region?.longitudeDelta]);

  return (
    <Map
      style={[styles.mapa, style]}
      pointerEvents={pointerEvents}
      mapStyle={ESTILO_MAPA}
      dragPan={scrollEnabled}
      touchZoom={zoomEnabled}
      doubleTapZoom={zoomEnabled}
      touchRotate={rotateEnabled}
      touchPitch={pitchEnabled}
      logo={false}
      compass={false}
      attribution
      attributionPosition={{ bottom: 4, right: 4 }}
      onDidFinishLoadingMap={onMapReady ? () => onMapReady() : undefined}
      onPress={
        onPress
          ? (e) => {
              const [longitude, latitude] = e.nativeEvent.lngLat;
              onPress({ nativeEvent: { coordinate: { latitude, longitude } } });
            }
          : undefined
      }
    >
      <Camera
        ref={camara}
        initialViewState={inicial ? { center: lngLat(inicial), zoom: zoomDeRegion(inicial) } : undefined}
      />
      {children}
    </Map>
  );
});

// Permite usar `MapView` también como tipo de la referencia (useRef<MapView>), igual que antes.
type MapView = MapViewHandle;
export default MapView;

// ─── Marker ─────────────────────────────────────────────────────────────────

type MarkerProps = {
  coordinate: LatLng;
  pinColor?: string;
  title?: string;
  description?: string;
  /** {x: 0.5, y: 0.5} centra la vista en la coordenada; por defecto la punta queda abajo. */
  anchor?: { x: number; y: number };
  onPress?: () => void;
  zIndex?: number;
  /** Solo existía en Google Maps; se ignora. */
  tracksViewChanges?: boolean;
  children?: ReactElement;
};

export function Marker({ coordinate, pinColor = "#E53935", title, description, anchor, onPress, zIndex, children }: MarkerProps) {
  const [mostrarTitulo, setMostrarTitulo] = useState(false);
  const centrado = anchor ? anchor.y <= 0.6 : false;
  const tieneTexto = Boolean(title || description);

  const tocar = () => {
    if (tieneTexto) setMostrarTitulo((v) => !v);
    onPress?.();
  };

  return (
    <MarkerLibre lngLat={lngLat(coordinate)} anchor={children && centrado ? "center" : "bottom"}>
      <TouchableOpacity activeOpacity={0.8} onPress={tocar} style={[styles.marcador, zIndex != null && { zIndex }]}>
        {mostrarTitulo && tieneTexto && (
          <View style={styles.burbuja}>
            {title ? <Text style={styles.burbujaTitulo} numberOfLines={2}>{title}</Text> : null}
            {description ? <Text style={styles.burbujaTexto} numberOfLines={3}>{description}</Text> : null}
          </View>
        )}
        {children ?? <Ionicons name="location-sharp" size={38} color={pinColor} style={styles.pin} />}
      </TouchableOpacity>
    </MarkerLibre>
  );
}

// ─── Polyline ───────────────────────────────────────────────────────────────

type PolylineProps = {
  coordinates: LatLng[];
  strokeColor?: string;
  strokeWidth?: number;
  lineCap?: "butt" | "round" | "square";
  lineJoin?: "miter" | "round" | "bevel";
  /** En píxeles, como en react-native-maps. */
  lineDashPattern?: number[];
  /** Con MapLibre la línea siempre se puede tocar si tiene onPress. */
  tappable?: boolean;
  onPress?: () => void;
};

export function Polyline({
  coordinates,
  strokeColor = "#E91E63",
  strokeWidth = 3,
  lineCap = "round",
  lineJoin = "round",
  lineDashPattern,
  onPress,
}: PolylineProps) {
  const id = useIdMapa("linea");
  if (coordinates.length < 2) return null;

  const datos: GeoJSON.Feature = {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: coordinates.map(lngLat) },
  };
  // MapLibre mide el patrón en múltiplos del grosor de la línea.
  const guiones = lineDashPattern?.length ? lineDashPattern.map((v) => Math.max(v / strokeWidth, 0.1)) : undefined;

  return (
    <GeoJSONSource id={id} data={datos} onPress={onPress ? () => onPress() : undefined} hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}>
      <Layer
        id={`${id}-capa`}
        type="line"
        layout={{ "line-cap": lineCap, "line-join": lineJoin }}
        paint={{
          "line-color": strokeColor,
          "line-width": strokeWidth,
          ...(guiones ? { "line-dasharray": guiones } : {}),
        }}
      />
    </GeoJSONSource>
  );
}

// ─── Circle ─────────────────────────────────────────────────────────────────

type CircleProps = {
  center: LatLng;
  /** Radio en metros. */
  radius: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
};

/** Polígono de 64 lados que aproxima un círculo de `radio` metros alrededor de `centro`. */
function poligonoCirculo(centro: LatLng, radio: number): number[][] {
  const puntos: number[][] = [];
  const latRad = (centro.latitude * Math.PI) / 180;
  const metrosPorGradoLat = 111_320;
  const metrosPorGradoLng = 111_320 * Math.cos(latRad);
  for (let i = 0; i <= 64; i++) {
    const angulo = (i / 64) * 2 * Math.PI;
    puntos.push([
      centro.longitude + (radio * Math.cos(angulo)) / metrosPorGradoLng,
      centro.latitude + (radio * Math.sin(angulo)) / metrosPorGradoLat,
    ]);
  }
  return puntos;
}

export function Circle({ center, radius, fillColor = "rgba(233,30,99,0.2)", strokeColor = "#E91E63", strokeWidth = 1 }: CircleProps) {
  const id = useIdMapa("circulo");
  const datos: GeoJSON.Feature = {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [poligonoCirculo(center, radius)] },
  };

  return (
    <GeoJSONSource id={id} data={datos}>
      <Layer id={`${id}-relleno`} type="fill" paint={{ "fill-color": fillColor }} />
      <Layer id={`${id}-borde`} type="line" paint={{ "line-color": strokeColor, "line-width": strokeWidth }} />
    </GeoJSONSource>
  );
}

const styles = StyleSheet.create({
  mapa: { flex: 1 },
  marcador: { alignItems: "center" },
  pin: {
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  burbuja: {
    maxWidth: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
    elevation: 3,
  },
  burbujaTitulo: { fontSize: 13, fontWeight: "700", color: "#222222" },
  burbujaTexto: { fontSize: 12, color: "#555555", marginTop: 2 },
});
