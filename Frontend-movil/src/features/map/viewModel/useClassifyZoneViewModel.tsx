import * as Location from "expo-location";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { LocationService, type DetailedLocation } from "../../../services/location.service";

export type RiskLevel =
  | "muy_seguro"
  | "medio_seguro"
  | "peligroso";

export type ClassifyZoneForm = {
  address: string;
  city: string;
  neighborhood: string;
  description: string;
  riskLevel: RiskLevel | null;
  latitude: number | null;
  longitude: number | null;
};

const MAX_DESCRIPTION_LENGTH = 250;

export function useClassifyZoneViewModel(
  initialLat: number = 2.962828,
  initialLng: number = -75.2855952
) {
  const [latitude, setLatitude] = useState<number>(initialLat);
  const [longitude, setLongitude] = useState<number>(initialLng);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [error, setError] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  const form = useMemo<ClassifyZoneForm>(
    () => ({
      address,
      city,
      neighborhood,
      description,
      riskLevel,
      latitude,
      longitude,
    }),
    [address, city, neighborhood, description, riskLevel, latitude, longitude]
  );

  const isFormValid = useMemo(() => {
    return (
      address.trim().length > 0 &&
      city.trim().length > 0 &&
      neighborhood.trim().length > 0 &&
      riskLevel !== null
    );
  }, [address, city, neighborhood, riskLevel]);

  const selectRisk = useCallback((level: RiskLevel) => {
    setRiskLevel(level);
    setError("");
  }, []);

  const updateDescription = useCallback((text: string) => {
    setDescription(text.slice(0, MAX_DESCRIPTION_LENGTH));
  }, []);

  //  Obtener la ubicación actual mediante GPS y reverse geocoding con alta precisión
  const getCurrentLocation = useCallback(async () => {
    try {
      setGettingLocation(true);

      // Usar el servicio centralizado de ubicación con alta precisión
      const location = await LocationService.getFullLocation();

      if (location) {
        setLatitude(location.latitudeValue);
        setLongitude(location.longitudeValue);
        setAddress(location.fullAddress);
        setNeighborhood(location.neighborhood);
        setCity(location.city);

      } else {
        Alert.alert(
          "Error de ubicación",
          "No se pudo obtener la ubicación actual. Verifica que el GPS esté encendido."
        );
      }
    } catch (err) {
      console.error("Error al obtener ubicación actual:", err);
      Alert.alert(
        "Error de ubicación",
        "No se pudo obtener la ubicación actual. Verifica que el GPS esté encendido."
      );
    } finally {
      setGettingLocation(false);
    }
  }, []);

  const sendReport = useCallback(() => {
    if (!isFormValid) {
      setError("Completa dirección, ciudad, barrio y nivel de riesgo.");
      return false;
    }

    setError("");
    return true;
  }, [form, isFormValid]);

  return {
    form,
    error,
    isFormValid,
    gettingLocation: gettingLocation,
    descriptionLength: description.length,
    maxDescriptionLength: MAX_DESCRIPTION_LENGTH,
    setAddress: setAddress,
    setCity: setCity,
    setNeighborhood: setNeighborhood,
    updateDescription: updateDescription,
    selectRisk: selectRisk,
    getCurrentLocation: getCurrentLocation,
    sendReport: sendReport,
  };
}