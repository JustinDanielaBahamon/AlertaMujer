import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker } from "../../../components/map/MapLibreMap";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useRoutes } from "../../../contexts/RoutesContext";
import { useAuth } from "../../../contexts/AuthContext";
import { frequentLocationsService } from "../../../services/frequent-locations.service";
import { placeDescription, getPlace, type FoundPlace } from "../../../services/geocoding.service";
import { LocationService } from "../../../services/location.service";
import PlaceSearchField from "../../../components/ui/placeSearch/PlaceSearchField";
import { POINT_A_COLOR, POINT_B_COLOR } from "../routeColors";
import { styles } from "../styles/SaveRoute.style";

type SelectedPoint = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string; // "Carrera 7 · Barrio Altico", by reverse geocoding
};

// What is shown and stored for a point: the name the user gave and/or the address
const pointLabel = (name: string, point: SelectedPoint, byDefault: string) =>
  [name.trim() || point.name, point.address].filter(Boolean).join(" · ") || byDefault;

type MethodSelection = "mapa" | "ubicaciones";

export default function SaveRoute() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<any>();
  const { addManualRoute } = useRoutes();

  const [pointA, setPointA] = useState<SelectedPoint | null>(null);
  const [pointB, setPointB] = useState<SelectedPoint | null>(null);
  const [pointAName, setPointAName] = useState("");
  const [pointBName, setPointBName] = useState("");
  const [routeName, setRouteName] = useState("");
  const [methodSelection, setMethodSelection] = useState<MethodSelection>("mapa");
  const [locationsModalVisible, setLocationsModalVisible] = useState(false);
  const [selectingPoint, setSelectingPoint] = useState<"A" | "B" | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  // Real saved locations from the backend
  const [savedLocations, setSavedLocations] = useState<Array<{ id: string; name: string; latitude: number; longitude: number; address: string }>>([]);
  const { user } = useAuth();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) return;
      try {
        const locations = await frequentLocationsService.getByUser(user.id);
        if (!mounted) return;
        setSavedLocations(
          locations.map((u) => ({
            id: String(u.id),
            name: u.name,
            latitude: Number(u.latitude),
            longitude: Number(u.longitude),
            address: u.address ?? u.city ?? "",
          }))
        );
      } catch (err) {
        console.error("Error al cargar ubicaciones guardadas:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Her location: the address search shows nearby places first and the map starts there
  const [here, setHere] = useState<{ latitude: number; longitude: number } | null>(null);
  React.useEffect(() => {
    LocationService.getCurrentPosition(false)
      .then((p) => p && setHere({ latitude: p.coords.latitude, longitude: p.coords.longitude }))
      .catch(() => {});
  }, []);

  // A searched address becomes point A or B
  const chooseFound = (point: "A" | "B", place: FoundPlace) => {
    const selected = {
      latitude: place.latitude,
      longitude: place.longitude,
      name: place.name,
      address: place.detail,
    };
    if (point === "A") setPointA(selected);
    else setPointB(selected);
    setSelectingPoint(null);
  };

  // The small map follows the chosen points (both in view when there are two)
  const mapRegion = React.useMemo(() => {
    const points = [pointA, pointB].filter(Boolean) as SelectedPoint[];
    if (points.length === 0) return here ? { ...here, latitudeDelta: 0.02, longitudeDelta: 0.02 } : undefined;
    const lats = points.map((p) => p.latitude);
    const lngs = points.map((p) => p.longitude);
    const latitudeDelta = Math.max(0.01, (Math.max(...lats) - Math.min(...lats)) * 1.6);
    const longitudeDelta = Math.max(0.01, (Math.max(...lngs) - Math.min(...lngs)) * 1.6);
    return {
      latitude: (Math.max(...lats) + Math.min(...lats)) / 2,
      longitude: (Math.max(...lngs) + Math.min(...lngs)) / 2,
      latitudeDelta,
      longitudeDelta,
    };
  }, [pointA, pointB, here]);

  // Looks up the address and neighborhood of the point tapped on the map
  const completeAddress = async (
    point: SelectedPoint,
    assign: React.Dispatch<React.SetStateAction<SelectedPoint | null>>,
  ) => {
    const place = await getPlace(point.latitude, point.longitude);
    const address = place ? placeDescription(place) : "";
    if (!address) return;
    // Only if the user did not change the point in the meantime
    assign((current) =>
      current && current.latitude === point.latitude && current.longitude === point.longitude
        ? { ...current, address }
        : current,
    );
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const point = { latitude, longitude };

    if (selectingPoint === "A") {
      setPointA(point);
      setSelectingPoint(null);
      completeAddress(point, setPointA);
    } else if (selectingPoint === "B") {
      setPointB(point);
      setSelectingPoint(null);
      completeAddress(point, setPointB);
    }
  };

  const selectFromLocations = (location: (typeof savedLocations)[number], point: "A" | "B") => {
    const selectedPointItem = {
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.name,
      address: location.address,
    };

    if (point === "A") {
      setPointA(selectedPointItem);
    } else {
      setPointB(selectedPointItem);
    }
    setLocationsModalVisible(false);
  };

  const startPointSelection = (point: "A" | "B") => {
    setSelectingPoint(point);
    if (methodSelection === "ubicaciones") {
      setLocationsModalVisible(true);
    }
  };

  const [saving, setSaving] = useState(false);

  const saveRoute = async () => {
    if (!pointA || !pointB) {
      alert("Por favor selecciona ambos puntos del recorrido");
      return;
    }
    if (saving) return;

    // Compute the distance between point A and B with the Haversine formula
    const computeDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in km
    };

    const distanceKm = computeDistance(pointA.latitude, pointA.longitude, pointB.latitude, pointB.longitude);
    // Estimated walking time at 5 km/h (same as on the web)
    const estimatedMinutes = Math.round((distanceKm / 5) * 60);

    const startTime = pointLabel(pointAName, pointA, "Punto A");
    const end = pointLabel(pointBName, pointB, "Punto B");
    const shortName = (name: string, point: SelectedPoint, byDefault: string) =>
      name.trim() || point.name || point.address?.split(" · ")[0] || byDefault;

    setSaving(true);
    const result = await addManualRoute({
      name:
        routeName.trim() ||
        `Ruta ${shortName(pointAName, pointA, "A")} → ${shortName(pointBName, pointB, "B")}`,
      startTime,
      end,
      points: [
        { latitude: pointA.latitude, longitude: pointA.longitude, timestamp: "" },
        { latitude: pointB.latitude, longitude: pointB.longitude, timestamp: "" },
      ],
      distanceKm,
      estimatedMinutes,
    });
    setSaving(false);

    if (!result.ok) {
      alert(result.reason ?? "No se pudo guardar el recorrido");
      return;
    }
    alert("Recorrido guardado exitosamente");
    navigation.goBack();
  };

  const clearSelection = () => {
    setPointA(null);
    setPointB(null);
    setSelectingPoint(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <LinearGradient
          colors={[theme.headercolor1, theme.headercolor2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Guardar Recorrido</Text>
            <Text style={styles.headerSubtitle}>
              Define la ruta de punto A a punto B
            </Text>
          </View>
        </LinearGradient>

        {/* ROUTE NAME */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Nombre del recorrido
          </Text>
          <View style={[styles.nameInputContainer, { backgroundColor: theme.background }]}>
            <MaterialIcons name="route" size={18} color={theme.contactSubtext} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.nameInput, { color: theme.text }]}
              placeholder="Ej: Camino seguro Sanjuan - Plaza, Recorrido de la tarde..."
              placeholderTextColor={theme.contactSubtext}
              value={routeName}
              onChangeText={setRouteName}
            />
          </View>
          <Text style={[styles.helperText, { color: theme.contactSubtext }]}>
            Si no ingresas un nombre, se generará uno automáticamente
          </Text>
        </View>

        {/* SELECTION METHOD */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Método de selección
          </Text>
          
          <View style={styles.methodContainer}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                methodSelection === "mapa" && styles.methodButtonActive,
                { borderColor: methodSelection === "mapa" ? theme.tabActiveColor : theme.contactSubtext }
              ]}
              onPress={() => setMethodSelection("mapa")}
            >
              <MaterialIcons 
                name="map" 
                size={20} 
                color={methodSelection === "mapa" ? "#7B1DB2" : theme.contactSubtext} 
              />
              <Text style={[
                styles.methodButtonText,
                { color: methodSelection === "mapa" ? "#7B1DB2" : theme.text }
              ]}>
                Mapa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                methodSelection === "ubicaciones" && styles.methodButtonActive,
                { borderColor: methodSelection === "ubicaciones" ? theme.tabActiveColor : theme.contactSubtext }
              ]}
              onPress={() => setMethodSelection("ubicaciones")}
            >
              <MaterialIcons 
                name="bookmark" 
                size={20} 
                color={methodSelection === "ubicaciones" ? "#7B1DB2" : theme.contactSubtext} 
              />
              <Text style={[
                styles.methodButtonText,
                { color: methodSelection === "ubicaciones" ? "#7B1DB2" : theme.text }
              ]}>
                Ubicaciones
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MAP */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 2.9271,
              longitude: -75.2874,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            region={mapRegion}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            onPress={handleMapPress}
          >
            {pointA && (
              <Marker
                coordinate={pointA}
                title="Punto A - Inicio"
                description={pointA.name || pointA.address}
                pinColor={POINT_A_COLOR}
              />
            )}
            
            {pointB && (
              <Marker
                coordinate={pointB}
                title="Punto B - Fin"
                description={pointB.name || pointB.address}
                pinColor={POINT_B_COLOR}
              />
            )}
          </MapView>

          {selectingPoint && (
            <View style={styles.instructionOverlay}>
              <Text style={styles.instructionText}>
                Toca en el mapa para seleccionar {selectingPoint === "A" ? "Punto A" : "Punto B"}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.openMapButton}
            onPress={() => setMapFullscreen(true)}
          >
            <MaterialIcons name="open-in-full" size={18} color="#fff" />
            <Text style={styles.openMapText}>Abrir mapa completo</Text>
          </TouchableOpacity>
        </View>

        {/* POINT SELECTION */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Puntos del recorrido
          </Text>

          {/* Quick way: write the address of each point */}
          <PlaceSearchField
            letter="A"
            accent={POINT_A_COLOR}
            placeholder="Busca la dirección del punto A"
            near={here}
            textColor={theme.text}
            background={theme.background}
            noResultsText="No encontramos esa dirección. Márcala en el mapa."
            onPick={(place) => chooseFound("A", place)}
          />
          <PlaceSearchField
            letter="B"
            accent={POINT_B_COLOR}
            placeholder="Busca la dirección del punto B"
            near={here}
            textColor={theme.text}
            background={theme.background}
            noResultsText="No encontramos esa dirección. Márcala en el mapa."
            onPick={(place) => chooseFound("B", place)}
          />

          {/* POINT A */}
          <TouchableOpacity
            style={[
              styles.pointButton,
              pointA && styles.pointButtonSelected,
              { borderColor: pointA ? POINT_A_COLOR : theme.contactSubtext }
            ]}
            onPress={() => startPointSelection("A")}
          >
            <View style={[styles.pointIcon, { backgroundColor: pointA ? POINT_A_COLOR : "#E0E0E0" }]}>
              <MaterialIcons name="radio-button-checked" size={24} color="#fff" />
            </View>
            <View style={styles.pointInfo}>
              <Text style={[styles.pointLabel, { color: theme.text }]}>
                Punto A - Inicio
              </Text>
              {pointA ? (
                <Text style={[styles.pointCoordinates, { color: theme.contactSubtext }]}>
                  {pointA.name || pointA.address || `${pointA.latitude.toFixed(4)}, ${pointA.longitude.toFixed(4)}`}
                </Text>
              ) : (
                <Text style={[styles.pointPlaceholder, { color: theme.contactSubtext }]}>
                  {methodSelection === "mapa" ? "Toca el mapa para seleccionar" : "Selecciona de ubicaciones guardadas"}
                </Text>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
          </TouchableOpacity>

          {/* Name field for Point A */}
          {pointA && (
            <View style={[styles.nameInputContainer, { backgroundColor: theme.background }]}>
              <MaterialIcons name="edit" size={18} color={theme.contactSubtext} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.nameInput, { color: theme.text }]}
                placeholder="Nombre del punto A (ej: Casa, Trabajo)"
                placeholderTextColor={theme.contactSubtext}
                value={pointAName}
                onChangeText={setPointAName}
              />
            </View>
          )}

          {/* POINT B */}
          <TouchableOpacity
            style={[
              styles.pointButton,
              pointB && styles.pointButtonSelected,
              { borderColor: pointB ? POINT_B_COLOR : theme.contactSubtext }
            ]}
            onPress={() => startPointSelection("B")}
          >
            <View style={[styles.pointIcon, { backgroundColor: pointB ? POINT_B_COLOR : "#E0E0E0" }]}>
              <MaterialIcons name="radio-button-checked" size={24} color="#fff" />
            </View>
            <View style={styles.pointInfo}>
              <Text style={[styles.pointLabel, { color: theme.text }]}>
                Punto B - Fin
              </Text>
              {pointB ? (
                <Text style={[styles.pointCoordinates, { color: theme.contactSubtext }]}>
                  {pointB.name || pointB.address || `${pointB.latitude.toFixed(4)}, ${pointB.longitude.toFixed(4)}`}
                </Text>
              ) : (
                <Text style={[styles.pointPlaceholder, { color: theme.contactSubtext }]}>
                  {methodSelection === "mapa" ? "Toca el mapa para seleccionar" : "Selecciona de ubicaciones guardadas"}
                </Text>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
          </TouchableOpacity>

          {/* Name field for Point B */}
          {pointB && (
            <View style={[styles.nameInputContainer, { backgroundColor: theme.background }]}>
              <MaterialIcons name="edit" size={18} color={theme.contactSubtext} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.nameInput, { color: theme.text }]}
                placeholder="Nombre del punto B (ej: Gimnasio, Supermercado)"
                placeholderTextColor={theme.contactSubtext}
                value={pointBName}
                onChangeText={setPointBName}
              />
            </View>
          )}
        </View>


        {/* ACTIONS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={clearSelection}
          >
            <Text style={styles.secondaryButtonText}>Limpiar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
              (!pointA || !pointB) && styles.primaryButtonDisabled
            ]}
            onPress={saveRoute}
            disabled={!pointA || !pointB}
          >
            <Text style={styles.primaryButtonText}>Guardar Recorrido</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SAVED LOCATIONS MODAL */}
      <Modal visible={locationsModalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setLocationsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Seleccionar {selectingPoint === "A" ? "Punto A" : "Punto B"}
                  </Text>
                  <TouchableOpacity onPress={() => setLocationsModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalList}>
                  {savedLocations.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      style={[styles.locationItem, { backgroundColor: theme.background }]}
                      onPress={() => selectFromLocations(location, selectingPoint!)}
                    >
                      <View style={styles.locationIcon}>
                        <MaterialIcons name="place" size={20} color="#7B1DB2" />
                      </View>
                      <View style={styles.locationInfo}>
                        <Text style={[styles.locationName, { color: theme.text }]}>
                          {location.name}
                        </Text>
                        <Text style={[styles.locationAddress, { color: theme.contactSubtext }]}>
                          {location.address}
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* FULL MAP MODAL */}
      <Modal visible={mapFullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 2.9271,
              longitude: -75.2874,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            onPress={handleMapPress}
          >
            {pointA && (
              <Marker
                coordinate={pointA}
                title="Punto A - Inicio"
                description={pointA.name || pointA.address}
                pinColor={POINT_A_COLOR}
              />
            )}
            
            {pointB && (
              <Marker
                coordinate={pointB}
                title="Punto B - Fin"
                description={pointB.name || pointB.address}
                pinColor={POINT_B_COLOR}
              />
            )}
          </MapView>

          <TouchableOpacity
            style={styles.fullscreenCloseButton}
            onPress={() => setMapFullscreen(false)}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}