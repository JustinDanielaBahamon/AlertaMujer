import * as Location from "expo-location";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { LocationService, type UbicacionDetallada } from "../../../services/location.service";

export type NivelRiesgo =
  | "muy_seguro"
  | "medio_seguro"
  | "peligroso";

export type ClasificarZonaForm = {
  direccion: string;
  ciudad: string;
  barrio: string;
  descripcion: string;
  nivelRiesgo: NivelRiesgo | null;
  latitude: number | null;
  longitude: number | null;
};

const MAX_DESCRIPTION_LENGTH = 250;

export function useClasificarZonaViewModel(
  initialLat: number = 2.962828,
  initialLng: number = -75.2855952
) {
  const [latitude, setLatitude] = useState<number>(initialLat);
  const [longitude, setLongitude] = useState<number>(initialLng);
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nivelRiesgo, setNivelRiesgo] = useState<NivelRiesgo | null>(null);
  const [error, setError] = useState("");
  const [obtenerUbicacionCargando, setObtenerUbicacionCargando] = useState(false);

  const form = useMemo<ClasificarZonaForm>(
    () => ({
      direccion,
      ciudad,
      barrio,
      descripcion,
      nivelRiesgo,
      latitude,
      longitude,
    }),
    [direccion, ciudad, barrio, descripcion, nivelRiesgo, latitude, longitude]
  );

  const isFormValid = useMemo(() => {
    return (
      direccion.trim().length > 0 &&
      ciudad.trim().length > 0 &&
      barrio.trim().length > 0 &&
      nivelRiesgo !== null
    );
  }, [direccion, ciudad, barrio, nivelRiesgo]);

  const seleccionarRiesgo = useCallback((nivel: NivelRiesgo) => {
    setNivelRiesgo(nivel);
    setError("");
  }, []);

  const actualizarDescripcion = useCallback((texto: string) => {
    setDescripcion(texto.slice(0, MAX_DESCRIPTION_LENGTH));
  }, []);

  //  Obtener la ubicación actual mediante GPS y reverse geocoding con alta precisión
  const obtenerUbicacionActual = useCallback(async () => {
    try {
      setObtenerUbicacionCargando(true);

      // Usar el servicio centralizado de ubicación con alta precisión
      const ubicacion = await LocationService.getFullLocation();

      if (ubicacion) {
        setLatitude(ubicacion.latitud);
        setLongitude(ubicacion.longitud);
        setDireccion(ubicacion.direccionCompleta);
        setBarrio(ubicacion.barrio);
        setCiudad(ubicacion.ciudad);

        console.log("Ubicación mejorada obtenida:", {
          direccion: ubicacion.direccionCompleta,
          barrio: ubicacion.barrio,
          ciudad: ubicacion.ciudad,
          precision: ubicacion.precision,
        });
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
      setObtenerUbicacionCargando(false);
    }
  }, []);

  const enviarReporte = useCallback(() => {
    if (!isFormValid) {
      setError("Completa dirección, ciudad, barrio y nivel de riesgo.");
      return false;
    }

    console.log("Reporte listo para enviar:", form);
    setError("");
    return true;
  }, [form, isFormValid]);

  return {
    form,
    error,
    isFormValid,
    obtenerUbicacionCargando,
    descriptionLength: descripcion.length,
    maxDescriptionLength: MAX_DESCRIPTION_LENGTH,
    setDireccion,
    setCiudad,
    setBarrio,
    actualizarDescripcion,
    seleccionarRiesgo,
    obtenerUbicacionActual,
    enviarReporte,
  };
}