import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../../contexts/AuthContext";
import { frequentLocationsService } from "../../../services/frequent-locations.service";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { locationPermission } from "../../../services/safePermissions";
import { LinearGradient } from "expo-linear-gradient"; // <-- NEW IMPORT
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "../../../components/map/MapLibreMap";

import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import type { MainStackParamList } from "../../../navigation/types";
import { createStyles } from "../styles/classifyZone.style";
import AddressSearchBar from "./AddressSearchBar";
import { lettersOnly } from "../../../utils/validators";

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

type ClassifyZoneRouteProp = {
  key: string;
  name: "ClassifyZone";
  params?: {
    latitude?: number;
    longitude?: number;
    locationToEdit?: {
      id: string;
      name: string;
      notes?: string;
      riskLevel: "muy_segura" | "moderada" | "muy_insegura";
      description: string;
    };
  };
};

type AddressInfo = {
  address: string;
  neighborhood: string;
  municipality: string;
  city: string;
  department: string;
  country: string;
};

const NAME_SUGGESTIONS = [
  { label: "Casa", icon: "home" as const },
  { label: "Trabajo", icon: "work" as const },
  { label: "Otro", icon: "edit" as const },
];

export default function ClassifyZoneView() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ClassifyZoneRouteProp>();
  const { user } = useAuth();

  // Current coordinates in state to allow updates when "My location" is pressed
  const locationToEdit = route.params?.locationToEdit;
  const initialLat = route.params?.latitude ?? 2.962828;
  const initialLng = route.params?.longitude ?? -75.2855952;

  const [coords, setCoords] = useState({
    latitude: initialLat,
    longitude: initialLng,
  });

  const styles = createStyles(theme);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(locationToEdit?.name || "");
  const [notes, setNotes] = useState(locationToEdit?.notes || "");
  const [nameError, setNameError] = useState(false);
  const [maxNotesReached, setMaxNotesReached] = useState(false);
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [description, setDescription] = useState(locationToEdit?.description || "");
  const [safetyLevel, setSafetyLevel] = useState<string | null>(
    locationToEdit?.riskLevel || null
  );

  const [isLocationHovered, setIsLocationHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Improved reusable reverse geocoding function
  const fetchAddress = useCallback(
    async (lat: number, lng: number) => {
      try {
        setLoading(true);
        const reverse = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });

        const info = reverse[0];

        // Improved data extraction with several fallbacks (valid properties only)
        const street = info?.street || info?.name || t.mapa.sin_calle;
        const number = info?.streetNumber || "";
        const detectedNeighborhood = info?.district || info?.subregion || t.mapa.sector_desconocido;
        const detectedCity = info?.city || info?.region || t.mapa.ciudad_desconocida;
        const detectedMunicipality = info?.subregion || info?.city || t.mapa.municipio_desconocido;
        const detectedDepartment = info?.region || t.mapa.departamento_desconocido;
        const detectedCountry = info?.country || t.mapa.pais_desconocido;
        const postalCode = info?.postalCode || "";

        // Builds a more complete address
        const fullAddress = `${street} ${number}`.trim();
        const fullCity = detectedCity !== t.mapa.ciudad_desconocida
          ? `${detectedCity}, ${detectedDepartment}`
          : detectedCity;

        const addressData: AddressInfo = {
          address: fullAddress,
          neighborhood: detectedNeighborhood,
          municipality: detectedMunicipality,
          city: fullCity,
          department: detectedDepartment,
          country: detectedCountry,
        };

        setAddressInfo(addressData);
        setAddress(addressData.address);
        setCity(addressData.city);
        setNeighborhood(addressData.neighborhood);

      } catch {
        const fallbackData: AddressInfo = {
          address: t.mapa.sin_calle,
          neighborhood: t.mapa.sector_desconocido,
          municipality: t.mapa.municipio_desconocido,
          city: t.mapa.ciudad_desconocida,
          department: t.mapa.departamento_desconocido,
          country: t.mapa.pais_desconocido,
        };
        setAddressInfo(fallbackData);
        setAddress(fallbackData.address);
        setCity(fallbackData.city);
        setNeighborhood(fallbackData.neighborhood);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  // Initial load
  useEffect(() => {
    fetchAddress(coords.latitude, coords.longitude);
  }, [coords, fetchAddress]);

  // Handler for "Use my current location"
  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      if (!(await locationPermission())) {
        Alert.alert("Permiso denegado", "Se requiere permiso de ubicación.");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoords({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (err) {
      Alert.alert("Error", "No se pudo obtener la ubicación actual.");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    // Validation: name required
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    // Validation: safety level required
    if (!safetyLevel) {
      Alert.alert("Atención", "Por favor selecciona el nivel de seguridad de la zona.");
      return;
    }

    setSaving(true);

    try {
      if (!user?.id) {
        Alert.alert("Error", "Debes iniciar sesión para guardar ubicaciones.");
        return;
      }

      // Validation: check for a duplicate name (only when creating)
      if (!locationToEdit) {
        const existing = await frequentLocationsService.getByUser(user.id);
        const duplicateName = existing.some(
          (u) => u.name.toLowerCase() === name.trim().toLowerCase()
        );
        if (duplicateName) {
          Alert.alert(
            "Nombre duplicado",
            "Ya existe una ubicación con este nombre. Por favor usa un nombre diferente."
          );
          return;
        }
      }

      const payload = {
        user_profile_id: user.id,
        name: name.trim(),
        address: address.trim() || addressInfo?.address || "",
        city: city.trim() || addressInfo?.city || "",
        latitude: coords.latitude,
        longitude: coords.longitude,
        notes: notes.trim() || description.trim() || undefined,
        risk_level: safetyLevel,
      };

      if (locationToEdit) {
        await frequentLocationsService.update(locationToEdit.id, payload);
      } else {
        await frequentLocationsService.create(payload);
      }

      // Navigate to the saved locations screen
      navigation.navigate("SavedLocations");
    } catch (error) {
      console.error("Error al guardar ubicación:", error);
      Alert.alert("Error", "Error al guardar la ubicación");
    } finally {
      setSaving(false);
    }
  };

    if (loading && !addressInfo) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#7B1DB2" />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          {t.mapa.cargando}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================= UPDATED HEADER ================= */}
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
            <Text style={styles.headerTitle}>Clasificar zona</Text>
            <Text style={styles.headerSubtitle}>
              Ayuda a otras mujeres reportando la seguridad
            </Text>
          </View>
        </LinearGradient>
        {/* ======================================================= */}

        {/* LOCATION ON THE MAP */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          <MaterialIcons
            name="location-on"
            size={15}
            color="#7B1DB2"
          />{" "}
          Ubicación en el mapa
        </Text>

        {/* SEARCH ADDRESS */}
        <AddressSearchBar
          style={{ marginHorizontal: 18, marginBottom: 12 }}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onResult={(coord) => setCoords(coord)}
          city={
            city && city !== t.mapa.ciudad_desconocida ? city : undefined
          }
          placeholder="Buscar dirección (ej: Carrera 5 #12-30)"
        />

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: coords.latitude,
                longitude: coords.longitude,
              }}
              pinColor="#7B1DB2"
            />
          </MapView>

          <View style={styles.mapCenterMarker}>
            <View style={styles.mapCenterDot} />
          </View>

          <TouchableOpacity 
            style={styles.mapLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <MaterialIcons
              name="my-location"
              size={18}
              color="#7B1DB2"
            />
          </TouchableOpacity>
        </View>

        {/* USE CURRENT LOCATION */}
        <Pressable
          onPress={handleUseCurrentLocation}
          onHoverIn={() => setIsLocationHovered(true)}
          onHoverOut={() => setIsLocationHovered(false)}
          style={({ pressed }) => {
            const isActive = pressed || isLocationHovered;
            return [
              styles.useLocationButton,
              isActive && { backgroundColor: "#5A1387" },
            ];
          }}
        >
          {({ pressed }) => {
            const isActive = pressed || isLocationHovered;
            return (
              <Text
                style={[
                  styles.useLocationText,
                  isActive && { color: "#FFFFFF", fontWeight: "bold" },
                ]}
              >
                Usar mi ubicación actual
              </Text>
            );
          }}
        </Pressable>

        {/* LOCATION NAME */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          <MaterialIcons
            name="bookmark"
            size={15}
            color="#7B1DB2"
          />{" "}
          Nombre de la ubicación
        </Text>
        <View style={styles.fieldLabelRow}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Nombre *
          </Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
            nameError && styles.inputError,
          ]}
          placeholder="Ej: Casa, Trabajo, Gimnasio"
          placeholderTextColor={theme.contactSubtext}
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (nameError) setNameError(false);
          }}
          maxLength={100}
        />
        {nameError && (
          <View style={styles.errorRow}>
            <MaterialIcons name="error-outline" size={13} color="#D81B60" />
            <Text style={styles.errorText}>El nombre es obligatorio</Text>
          </View>
        )}

        <View style={styles.chipsRow}>
          {NAME_SUGGESTIONS.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={styles.chip}
              onPress={() => {
                setName(s.label);
                setNameError(false);
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name={s.icon} size={13} color="#7B1DB2" />
              <Text style={styles.chipText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ZONE INFORMATION */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          <MaterialIcons
            name="home"
            size={15}
            color="#7B1DB2"
          />{" "}
          Información de la zona
        </Text>

        {/* ADDRESS */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Dirección
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
          ]}
          placeholder="Ej: Carrera 1e Oeste #48"
          placeholderTextColor={theme.contactSubtext}
          maxLength={120}
          value={address}
          onChangeText={setAddress}
        />

        {/* CITY */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Ciudad
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
          ]}
          placeholder="Ej: Neiva"
          placeholderTextColor={theme.contactSubtext}
          maxLength={60}
          value={city}
          onChangeText={(v) => setCity(lettersOnly(v, 60))}
        />

        {/* BARRIO */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Barrio / Comuna
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
          ]}
          placeholder="Ej: Barrio Santa Inés"
          placeholderTextColor={theme.contactSubtext}
          maxLength={60}
          value={neighborhood}
          onChangeText={setNeighborhood}
        />

        {/* ZONE DESCRIPTION */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Descripción de la zona
        </Text>
        <TextInput
          style={[
            styles.descriptionInput,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
          ]}
          placeholder="Describe cómo es esta zona, incidentes frecuentes, iluminación, tránsito de personas, etc."
          placeholderTextColor={theme.contactSubtext}
          multiline
          maxLength={250}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
        <Text
          style={[
            styles.characterCounter,
            { color: theme.contactSubtext },
          ]}
        >
          {description.length}/250
        </Text>

        {/* ADDITIONAL NOTES */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Notas adicionales (opcional)
        </Text>
        <TextInput
          style={[
            styles.descriptionInput,
            {
              color: theme.text,
              backgroundColor: theme.card,
            },
          ]}
          placeholder="Agrega notas personales sobre esta ubicación"
          placeholderTextColor={theme.contactSubtext}
          multiline
          maxLength={200}
          textAlignVertical="top"
          value={notes}
          onChangeText={(val) => {
            setNotes(val);
            setMaxNotesReached(val.length >= 200);
          }}
        />
        <Text
          style={[
            styles.characterCounter,
            { color: theme.contactSubtext },
          ]}
        >
          {notes.length}/200
        </Text>
        {maxNotesReached && (
          <View style={styles.errorRow}>
            <MaterialIcons name="warning" size={13} color="#D81B60" />
            <Text style={styles.errorText}>Máximo de caracteres alcanzado</Text>
          </View>
        )}

        {/* SAFETY LEVEL */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          <MaterialIcons
            name="security"
            size={15}
            color="#7B1DB2"
          />{" "}
          Nivel de seguridad
        </Text>
        <Text style={[styles.securityDescription, { color: theme.contactSubtext }]}>
          Selecciona la opción que mejor describa esta zona.
        </Text>

        <View style={styles.securityGrid}>
          {/* VERY SAFE */}
          <TouchableOpacity
            style={[
              styles.securityOption,
              styles.verySafe,
              safetyLevel === "muy_segura" && styles.selectedSecurity,
            ]}
            onPress={() => setSafetyLevel("muy_segura")}
          >
            <MaterialIcons name="verified-user" size={20} color="#FFFFFF" />
            <Text style={styles.verySafeText}>Muy segura</Text>
            <Text style={styles.securitySmallText}>Zona muy segura</Text>
          </TouchableOpacity>

          {/* MODERATE */}
          <TouchableOpacity
            style={[
              styles.securityOption,
              styles.moderate,
              safetyLevel === "moderada" && styles.selectedSecurity,
            ]}
            onPress={() => setSafetyLevel("moderada")}
          >
            <MaterialIcons name="warning" size={20} color="#FFFFFF" />
            <Text style={styles.moderateText}>Moderada</Text>
            <Text style={styles.securitySmallText}>Riesgo medio</Text>
          </TouchableOpacity>

          {/* MUY INSEGURA */}
          <TouchableOpacity
            style={[
              styles.securityOption,
              styles.veryUnsafe,
              safetyLevel === "muy_insegura" && styles.selectedSecurity,
            ]}
            onPress={() => setSafetyLevel("muy_insegura")}
          >
            <MaterialIcons name="report" size={20} color="#FFFFFF" />
            <Text style={styles.veryUnsafeText}>Muy insegura</Text>
            <Text style={styles.securitySmallText}>Riesgo muy alto</Text>
          </TouchableOpacity>
        </View>

        {/* SAVE LOCATION */}
        <TouchableOpacity
          style={[styles.submitButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="bookmark" size={17} color="#fff" />
              <Text style={styles.submitButtonText}>Guardar ubicación</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: theme.contactSubtext }]}>
          Tu ubicación será guardada con su clasificación de seguridad.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
