import * as Location from "expo-location";

// Interface para datos de ubicación mejorados
export interface UbicacionDetallada {
  direccionCompleta: string;
  calle: string;
  numero: string;
  barrio: string;
  ciudad: string;
  municipio: string;
  departamento: string;
  pais: string;
  codigoPostal: string;
  latitud: number;
  longitud: number;
  precision: number;
}

// Configuración de alta precisión para GPS
const HIGH_ACCURACY_CONFIG = {
  accuracy: Location.Accuracy.BestForNavigation, // Máxima precisión para navegación
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

/**
 * Servicio centralizado para manejo de ubicación con alta precisión
 */
export class LocationService {
  /**
   * Solicita permisos de ubicación
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error al solicitar permisos de ubicación:", error);
      return false;
    }
  }

  /**
   * Obtiene la ubicación actual con máxima precisión
   */
  static async getCurrentPosition(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Permisos de ubicación denegados");
      }

      const location = await Location.getCurrentPositionAsync(HIGH_ACCURACY_CONFIG);
      console.log("Ubicación GPS obtenida con precisión:", location.coords.accuracy, "metros");
      return location;
    } catch (error) {
      console.error("Error al obtener ubicación GPS:", error);
      return null;
    }
  }

  /**
   * Realiza geocoding inverso mejorado para obtener dirección detallada
   */
  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<UbicacionDetallada | null> {
    try {
      const reverse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverse.length > 0) {
        const info = reverse[0];

        // Extracción mejorada de datos con múltiples fallbacks (solo propiedades válidas)
        const calle = info.street || info.name || "Calle desconocida";
        const numero = info.streetNumber || "";
        const barrio = info.district || info.subregion || "Sector desconocido";
        const ciudad = info.city || "Ciudad desconocida";
        const municipio = info.subregion || info.city || "Municipio desconocido";
        const departamento = info.region || "Departamento desconocido";
        const pais = info.country || "País desconocido";
        const codigoPostal = info.postalCode || "";

        // Construcción de dirección más completa
        const direccionCompleta = `${calle} ${numero}`.trim();
        const ciudadCompleta = ciudad !== "Ciudad desconocida"
          ? `${ciudad}, ${departamento}`
          : ciudad;

        const ubicacionDetallada: UbicacionDetallada = {
          direccionCompleta,
          calle,
          numero,
          barrio,
          ciudad: ciudadCompleta,
          municipio,
          departamento,
          pais,
          codigoPostal,
          latitud: latitude,
          longitud: longitude,
          precision: 0, // Se actualiza cuando se obtiene del GPS
        };

        console.log("Geocoding inverso mejorado:", ubicacionDetallada);
        return ubicacionDetallada;
      }

      return null;
    } catch (error) {
      console.error("Error en geocoding inverso:", error);
      return null;
    }
  }

  /**
   * Obtiene ubicación completa (GPS + geocoding) con máxima precisión
   */
  static async getFullLocation(): Promise<UbicacionDetallada | null> {
    try {
      const location = await this.getCurrentPosition();
      if (!location) return null;

      const { latitude, longitude, accuracy } = location.coords;

      const geocoding = await this.reverseGeocode(latitude, longitude);
      if (!geocoding) return null;

      // Actualizar precisión con valor real del GPS (manejar null)
      geocoding.precision = accuracy || 0;

      return geocoding;
    } catch (error) {
      console.error("Error al obtener ubicación completa:", error);
      return null;
    }
  }

  /**
   * Calcula distancia entre dos coordenadas en metros (fórmula Haversine)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Obtiene dirección formateada para mostrar en UI
   */
  static formatAddress(ubicacion: UbicacionDetallada): string {
    const partes = [];
    if (ubicacion.barrio && ubicacion.barrio !== "Sector desconocido") {
      partes.push(ubicacion.barrio);
    }
    if (ubicacion.ciudad && ubicacion.ciudad !== "Ciudad desconocida") {
      partes.push(ubicacion.ciudad);
    }
    return partes.length > 0 ? partes.join(", ") : ubicacion.direccionCompleta;
  }

  /**
   * Obtiene dirección corta para títulos y encabezados
   */
  static formatShortAddress(ubicacion: UbicacionDetallada): string {
    if (ubicacion.barrio && ubicacion.barrio !== "Sector desconocido") {
      return ubicacion.barrio;
    }
    if (ubicacion.calle && ubicacion.calle !== "Calle desconocida") {
      return ubicacion.calle;
    }
    return ubicacion.ciudad || "Ubicación desconocida";
  }
}