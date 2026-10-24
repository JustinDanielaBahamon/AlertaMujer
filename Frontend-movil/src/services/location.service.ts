import * as Location from "expo-location";
import { getPlace } from "./geocoding.service";
import { locationPermission } from "./safePermissions";

// Interface for improved location data
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

// Typed errors to tell the cause of a location failure
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

// High-accuracy GPS settings
const HIGH_ACCURACY_CONFIG = {
  accuracy: Location.Accuracy.BestForNavigation, // Maximum accuracy for navigation
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

/**
 * Central service for high-accuracy location handling
 */
export class LocationService {
  /**
   * Requests location permissions
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
   * Checks whether the device location services are on
   */
  static async hasServicesEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch {
      return false;
    }
  }

  /**
   * Gets the current location with maximum accuracy.
   * Checks system services before asking for permissions.
   * Throws typed errors so the caller can tell the cause.
   */
  static async getCurrentPosition(requestPermission = true): Promise<Location.LocationObject | null> {
    try {
      // 1) Device location services (GPS/network) enabled?
      const activeServices = await Location.hasServicesEnabledAsync();
      if (!activeServices) {
        throw new LocationServicesDisabledError();
      }

      // 2) Does the app have permission?
      const hasPermission = await this.requestPermissions(requestPermission);
      if (!hasPermission) {
        throw new LocationPermissionDeniedError();
      }

      // expo-location has no "timeout": without GPS signal (indoors) the reading never ends.
      // We wait for a while and, if it does not arrive, the last location the phone knows is used.
      const location = await Promise.race([
        Location.getCurrentPositionAsync(HIGH_ACCURACY_CONFIG),
        new Promise<null>((resolver) => setTimeout(() => resolver(null), MAX_GPS_TIME_MS)),
      ]);
      return location ?? (await Location.getLastKnownPositionAsync({ maxAge: MAX_AGE_MS }));
    } catch (error) {
      // Rethrow typed errors so the ViewModel classifies them
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
   * Improved reverse geocoding to get a detailed address
   */
  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<DetailedLocation | null> {
    try {
      // The phone geocoder gives city and region, but on some phones its neighborhood is wrong
      // (e.g. a Vietnamese district for a point in Neiva): OpenStreetMap gives the neighborhood
      const [reverse, osm] = await Promise.all([
        Location.reverseGeocodeAsync({ latitude, longitude }),
        getPlace(latitude, longitude).catch(() => null),
      ]);

      if (reverse.length > 0) {
        const info = reverse[0];

        // Improved data extraction with several fallbacks (valid properties only)
        const street = info.street || info.name || "Calle desconocida";
        const number = info.streetNumber || "";
        const neighborhood = osm?.neighborhood || info.district || info.subregion || "Sector desconocido";
        const city = info.city || "Ciudad desconocida";
        const municipality = info.subregion || info.city || "Municipio desconocido";
        const department = info.region || "Departamento desconocido";
        const country = info.country || "País desconocido";
        const postalCode = info.postalCode || "";

        // Builds a more complete address
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
          precision: 0, // Updated when it comes from the GPS
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
   * Gets the full location (GPS + geocoding) with maximum accuracy.
   * Propagates LocationServicesDisabledError and LocationPermissionDeniedError
   * so the caller shows the right message.
   */
  /** askPermission = false when a screen opens: it only checks and shows no system prompts. */
  static async getFullLocation(requestPermission = true): Promise<DetailedLocation | null> {
    // We do not catch typed errors — we let them bubble up to the ViewModel
    const location = await this.getCurrentPosition(requestPermission);
    if (!location) return null;

    const { latitude, longitude, accuracy } = location.coords;

    const geocoding = await this.reverseGeocode(latitude, longitude);
    if (!geocoding) return null;

    // Update the accuracy with the real GPS value (handle null)
    geocoding.precision = accuracy || 0;

    return geocoding;
  }

  /**
   * Computes the distance between two coordinates in meters (Haversine formula)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
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
   * Gets a formatted address to show in the UI
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
   * Gets a short address for titles and headers
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