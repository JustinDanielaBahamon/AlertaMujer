// Free map based on MapLibre + OpenFreeMap tiles (OpenStreetMap data).
// It replaces react-native-maps (Google Maps, which requires a key and billing) keeping
// the same API: <MapView>, <Marker>, <Polyline>, <Circle> and the methods
// animateToRegion / fitToCoordinates, so screens only change the import.
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

/** Free map style without a key (https://openfreemap.org). */
/** Minimum width (in degrees, ~300 m) when fitting several points. */
const MIN_WIDTH_DEGREES = 0.003;

/** Widens an interval [min, max] around its center up to the minimum width. */
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

/** Converts a region "delta" (visible degrees) to the equivalent zoom level. */
const zoomDeRegion = (r: Region) => {
  const delta = Math.max(r.longitudeDelta, r.latitudeDelta, 0.0005);
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.log2(360 / delta)));
};

const lngLat = (c: LatLng): [number, number] => [c.longitude, c.latitude];

// MapLibre source and layer ids: they must be unique and without special characters.
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
  /** They only existed in Google Maps; ignored. */
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
      // Points very close together (someone standing still: the GPS varies a few meters) would give a zoom beyond
      // the level that has streets drawn and the map would be empty: at least ~300 m are fitted
      const [west, east] = withMinWidth(Math.min(...lngs), Math.max(...lngs));
      const [south, north] = withMinWidth(Math.min(...lats), Math.max(...lats));
      camera.current?.fitBounds([west, south, east, north], {
        padding: options?.edgePadding,
        duration: options?.animated === false ? 0 : 500,
      });
    },
  }));

  // Controlled region: if the screen changes `region`, the camera follows it.
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

// Lets `MapView` also be used as the ref type (useRef<MapView>), as before.
type MapView = MapViewHandle;
export default MapView;

// ─── Marker ─────────────────────────────────────────────────────────────────

type MarkerProps = {
  coordinate: LatLng;
  pinColor?: string;
  title?: string;
  description?: string;
  /** {x: 0.5, y: 0.5} centers the view on the coordinate; by default the tip is at the bottom. */
  anchor?: { x: number; y: number };
  onPress?: () => void;
  zIndex?: number;
  /** It only existed in Google Maps; ignored. */
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
      {/* Fixed size: if the view has no width of its own, Android clips it near the edge of the map. */}
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
  /** In pixels, as in react-native-maps. */
  lineDashPattern?: number[];
  /** With MapLibre the line can always be tapped if it has onPress. */
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
  // MapLibre measures the pattern in multiples of the line width.
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

/** 64-sided polygon that approximates a circle of `radius` meters around `center`. */
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
