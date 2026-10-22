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
/** Ancho mínimo (en grados, ~300 m) al encuadrar varios puntos. */
const MIN_WIDTH_DEGREES = 0.003;

/** Agranda un intervalo [min, max] alrededor de su centro hasta el ancho mínimo. */
export function withMinWidth(min: number, max: number, minimum = MIN_WIDTH_DEGREES): [number, number] {
  if (max - min >= minimum) return [min, max];
  const center = (min + max) / 2;
  return [center - minimum / 2, center + minimum / 2];
}

export const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

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
const useMapId = (prefix: string) => `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

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
  const camera = useRef<CameraRef>(null);
  const initial = initialRegion ?? region;

  useImperativeHandle(ref, () => ({
    animateToRegion: (r, duration = 500) =>
      camera.current?.easeTo({ center: lngLat(r), zoom: zoomDeRegion(r), duration }),
    fitToCoordinates: (coords, options) => {
      if (coords.length === 0) return;
      if (coords.length === 1) {
        camera.current?.easeTo({ center: lngLat(coords[0]), zoom: 16, duration: 500 });
        return;
      }
      const lngs = coords.map((c) => c.longitude);
      const lats = coords.map((c) => c.latitude);
      // Puntos muy juntos (alguien quieto: el GPS varía unos metros) darían un zoom mayor al que
      // tiene calles dibujadas y el mapa quedaría vacío: se encuadra como mínimo ~300 m
      const [west, east] = withMinWidth(Math.min(...lngs), Math.max(...lngs));
      const [south, north] = withMinWidth(Math.min(...lats), Math.max(...lats));
      camera.current?.fitBounds([west, south, east, north], {
        padding: options?.edgePadding,
        duration: options?.animated === false ? 0 : 500,
      });
    },
  }));

  // Región controlada: si la pantalla cambia `region`, la cámara la sigue.
  useEffect(() => {
    if (!region) return;
    camera.current?.easeTo({ center: lngLat(region), zoom: zoomDeRegion(region), duration: 400 });
  }, [region?.latitude, region?.longitude, region?.latitudeDelta, region?.longitudeDelta]);

  return (
    <Map
      style={[styles.map, style]}
      pointerEvents={pointerEvents}
      mapStyle={MAP_STYLE}
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
        ref={camera}
        initialViewState={initial ? { center: lngLat(initial), zoom: zoomDeRegion(initial) } : undefined}
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
  const [showTitle, setShowTitle] = useState(false);
  const centered = anchor ? anchor.y <= 0.6 : false;
  const hasText = Boolean(title || description);

  const tap = () => {
    if (hasText) setShowTitle((v) => !v);
    onPress?.();
  };

  return (
    <MarkerLibre lngLat={lngLat(coordinate)} anchor={children && centered ? "center" : "bottom"}>
      {/* Tamaño fijo: si la vista no tiene ancho propio, Android la recorta al acercarse al borde del mapa. */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={tap}
        style={[styles.marker, showTitle && hasText && styles.markerWithBubble, zIndex != null && { zIndex }]}
      >
        {showTitle && hasText && (
          <View style={styles.bubble}>
            {title ? <Text style={styles.bubbleTitle} numberOfLines={2}>{title}</Text> : null}
            {description ? <Text style={styles.bubbleText} numberOfLines={3}>{description}</Text> : null}
          </View>
        )}
        {children ?? (
          <View style={styles.pinBox}>
            <Ionicons name="location-sharp" size={38} color={pinColor} style={styles.pin} />
          </View>
        )}
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
  const id = useMapId("linea");
  if (coordinates.length < 2) return null;

  const data: GeoJSON.Feature = {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: coordinates.map(lngLat) },
  };
  // MapLibre mide el patrón en múltiplos del grosor de la línea.
  const dashes = lineDashPattern?.length ? lineDashPattern.map((v) => Math.max(v / strokeWidth, 0.1)) : undefined;

  return (
    <GeoJSONSource id={id} data={data} onPress={onPress ? () => onPress() : undefined} hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}>
      <Layer
        id={`${id}-capa`}
        type="line"
        layout={{ "line-cap": lineCap, "line-join": lineJoin }}
        paint={{
          "line-color": strokeColor,
          "line-width": strokeWidth,
          ...(dashes ? { "line-dasharray": dashes } : {}),
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
function circlePolygon(center: LatLng, radio: number): number[][] {
  const points: number[][] = [];
  const latRad = (center.latitude * Math.PI) / 180;
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLng = 111_320 * Math.cos(latRad);
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * 2 * Math.PI;
    points.push([
      center.longitude + (radio * Math.cos(angle)) / metersPerDegreeLng,
      center.latitude + (radio * Math.sin(angle)) / metersPerDegreeLat,
    ]);
  }
  return points;
}

export function Circle({ center, radius, fillColor = "rgba(233,30,99,0.2)", strokeColor = "#E91E63", strokeWidth = 1 }: CircleProps) {
  const id = useMapId("circulo");
  const data: GeoJSON.Feature = {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [circlePolygon(center, radius)] },
  };

  return (
    <GeoJSONSource id={id} data={data}>
      <Layer id={`${id}-relleno`} type="fill" paint={{ "fill-color": fillColor }} />
      <Layer id={`${id}-borde`} type="line" paint={{ "line-color": strokeColor, "line-width": strokeWidth }} />
    </GeoJSONSource>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  marker: { alignItems: "center" },
  markerWithBubble: { width: 210 },
  pinBox: { width: 44, height: 44, alignItems: "center", justifyContent: "flex-end" },
  pin: {
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bubble: {
    maxWidth: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
    elevation: 3,
  },
  bubbleTitle: { fontSize: 13, fontWeight: "700", color: "#222222" },
  bubbleText: { fontSize: 12, color: "#555555", marginTop: 2 },
});
