import * as Location from "expo-location";
import { locationPermission } from "./permisosSeguros";

// Interface para datos de ubicación mejorados
export interface DetailedLocation {
  fullAddress: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  municipality: string;
  department: string;
  country: string;
  postalCode: string;
  latitudeValue: number;
  longitudeValue: number;
  precision: number;
}

// Errores tipados para distinguir la causa del fallo de ubicación
export class LocationServicesDisabledError extends Error {
  constructor() {
    super("Los servicios de ubicación del dispositivo están desactivados");
    this.name = "LocationServicesDisabledError";
  }
}

export class LocationPermissionDeniedError extends Error {
  constructor() {
    super("Permisos de ubicación denegados");
    this.name = "LocationPermissionDeniedError";
  }
}

const MAX_GPS_TIME_MS = 15 * 1000;
const MAX_AGE_MS = 15 * 60 * 1000;

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
  static async requestPermissions(ask = true): Promise<boolean> {
    try {
      return await locationPermission(ask);
    } catch (error) {
      console.error("Error al solicitar permisos de ubicación:", error);
      return false;
    }
  }

  /**
   * Verifica si los servicios de ubicación del dispositivo están activos
   */
  static async hasServicesEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch {
      return false;
    }
  }

  /**
   * Obtiene la ubicación actual con máxima precisión.
   * Verifica servicios del sistema antes de pedir permisos.
   * Lanza errores tipados para que el llamador pueda distinguir la causa.
   */
  static async getCurrentPosition(requestPermission = true): Promise<Location.LocationObject | null> {
    try {
      // 1) Servicios de ubicación del dispositivo (GPS/red) habilitados?
      const activeServices = await Location.hasServicesEnabledAsync();
      if (!activeServices) {
        throw new LocationServicesDisabledError();
      }

      // 2) La app tiene permiso?
      const hasPermission = await this.requestPermissions(requestPermission);
      if (!hasPermission) {
        throw new LocationPermissionDeniedError();
      }

      // expo-location no tiene "timeout": sin señal GPS (bajo techo) la lectura no termina nunca.
      // Se espera un tiempo y, si no llega, se usa la última ubicación que conoce el teléfono.
      const location = await Promise.race([
        Location.getCurrentPositionAsync(HIGH_ACCURACY_CONFIG),
        new Promise<null>((resolver) => setTimeout(() => resolver(null), MAX_GPS_TIME_MS)),
      ]);
      return location ?? (await Location.getLastKnownPositionAsync({ maxAge: MAX_AGE_MS }));
    } catch (error) {
      // Re-lanzar errores tipados para que el ViewModel los clasifique
      if (
        error instanceof LocationServicesDisabledError ||
        error instanceof LocationPermissionDeniedError
      ) {
        throw error;
      }
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
  ): Promise<DetailedLocation | null> {
    try {
      const reverse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverse.length > 0) {
        const info = reverse[0];

        // Extracción mejorada de datos con múltiples fallbacks (solo propiedades válidas)
        const street = info.street || info.name || "Calle desconocida";
        const number = info.streetNumber || "";
        const neighborhood = info.district || info.subregion || "Sector desconocido";
        const city = info.city || "Ciudad desconocida";
        const municipality = info.subregion || info.city || "Municipio desconocido";
        const department = info.region || "Departamento desconocido";
        const country = info.country || "País desconocido";
        const postalCode = info.postalCode || "";

        // Construcción de dirección más completa
        const fullAddress = `${street} ${number}`.trim();
        const fullCity = city !== "Ciudad desconocida"
          ? `${city}, ${department}`
          : city;

        const detailedLocation: DetailedLocation = {
          fullAddress,
          street,
          number,
          neighborhood,
          city: fullCity,
          municipality,
          department,
          country,
          postalCode,
          latitudeValue: latitude,
          longitudeValue: longitude,
          precision: 0, // Se actualiza cuando se obtiene del GPS
        };

        return detailedLocation;
      }

      return null;
    } catch (error) {
      console.error("Error en geocoding inverso:", error);
      return null;
    }
  }

  /**
   * Obtiene ubicación completa (GPS + geocoding) con máxima precisión.
   * Propaga LocationServicesDisabledError y LocationPermissionDeniedError
   * para que el llamador muestre el mensaje apropiado.
   */
  /** pedirPermiso = false al abrir una pantalla: solo consulta y no muestra avisos del sistema. */
  static async getFullLocation(requestPermission = true): Promise<DetailedLocation | null> {
    // No capturamos errores tipados — los dejamos subir al ViewModel
    const location = await this.getCurrentPosition(requestPermission);
    if (!location) return null;

    const { latitude, longitude, accuracy } = location.coords;

    const geocoding = await this.reverseGeocode(latitude, longitude);
    if (!geocoding) return null;

    // Actualizar precisión con valor real del GPS (manejar null)
    geocoding.precision = accuracy || 0;

    return geocoding;
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
  static formatAddress(location: DetailedLocation): string {
    const parts = [];
    if (location.neighborhood && location.neighborhood !== "Sector desconocido") {
      parts.push(location.neighborhood);
    }
    if (location.city && location.city !== "Ciudad desconocida") {
      parts.push(location.city);
    }
    return parts.length > 0 ? parts.join(", ") : location.fullAddress;
  }

  /**
   * Obtiene dirección corta para títulos y encabezados
   */
  static formatShortAddress(location: DetailedLocation): string {
    if (location.neighborhood && location.neighborhood !== "Sector desconocido") {
      return location.neighborhood;
    }
    if (location.street && location.street !== "Calle desconocida") {
      return location.street;
    }
    return location.city || "Ubicación desconocida";
  }
}