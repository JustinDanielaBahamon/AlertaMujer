import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useContactsContext } from "../../../contexts/ContactsContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { getOrCreateDevice } from "../../../services/devices.service";
import { frequentLocationsService, type FrequentLocationApi } from "../../../services/frequent-locations.service";
import { getPlace, placeDescription } from "../../../services/geocoding.service";
import { LocationService } from "../../../services/location.service";
import {
  extendTrip,
  cancelTrip,
  confirmArrival,
  startTrip,
  activeTrip,
  type Trip,
} from "../../../services/safe-trips.service";
import type { LatLng } from "../../../components/map/MapLibreMap";
import { onTripSignalEnded, stopTripSignal, syncTripSignal, tripSignalStatus } from "../tripSignal";

export const QUICK_MINUTES = [15, 30, 45, 60, 90];

/**
 * "Let me know if I don't arrive": the user says where she is going and when she will arrive. If she does not
 * confirm in time, the
 * server notifies her contacts with her last location, even if her phone runs out of data.
 */
export function useTripViewModel() {
  const navigation = useNavigation<any>();
  const { t } = useLocale();
  const tr = t.trayecto;
  const { user } = useAuth();
  const { contacts } = useContactsContext();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [destination, setDestination] = useState("");
  const [place, setPlace] = useState<FrequentLocationApi | null>(null);
  const [minutes, setMinutes] = useState(30);
  const [places, setPlaces] = useState<FrequentLocationApi[]>([]);
  const [now, setNow] = useState(Date.now());
  // Destination marked on the map (when it is not a saved place) and its address
  const [mapPoint, setMapPoint] = useState<LatLng | null>(null);
  const [mapPointLabel, setMapPointLabel] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [signalReady, setSignalReady] = useState(true);

  // Every time the screen shows the trip, the signal-of-life service is (re)started for it
  const show = useCallback((found: Trip | null) => {
    setTrip(found);
    syncTripSignal(found)
      .then(setSignalReady)
      .catch(() => setSignalReady(false));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    activeTrip()
      .then(show)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [show]);

  useFocusEffect(load);

  // Arrival confirmed from the notification, or the trip ended on the server
  useEffect(() => onTripSignalEnded(() => load()), [load]);

  useEffect(() => {
    if (!user?.id) return;
    frequentLocationsService.getByUser(user.id).then(setPlaces).catch(() => {});
  }, [user?.id]);

  // On-screen countdown and arrival preview (every 15 s is enough: they are shown in minutes)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const choosePlace = (l: FrequentLocationApi) => {
    setPlace(l);
    setMapPoint(null);
    setDestination(l.name);
  };

  // The map opens on her current location (the origin of the trip)
  const openPicker = async () => {
    setPickerOpen(true);
    if (origin) return;
    try {
      const here = await LocationService.getCurrentPosition(true);
      if (here) setOrigin({ latitude: here.coords.latitude, longitude: here.coords.longitude });
    } catch {
      // Without location the map opens on the default region
    }
  };

  const chooseMapPoint = async (point: LatLng) => {
    setMapPoint(point);
    setPlace(null);
    setMapPointLabel("");
    const found = await getPlace(point.latitude, point.longitude).catch(() => null);
    const label = found ? placeDescription(found) : "";
    setMapPointLabel(label);
    // A name is suggested only if she has not written one
    setDestination((current) => (current.trim() ? current : label));
  };

  const clearMapPoint = () => {
    setMapPoint(null);
    setMapPointLabel("");
  };

  const changeDestination = (text: string) => {
    setDestination(text);
    if (place && text !== place.name) setPlace(null);
  };

  const error = (e: any) =>
    Alert.alert(tr.titulo, e?.response?.data?.message ?? tr.error_conexion);

  const start = async () => {
    if (!destination.trim() || busy) return;
    setBusy(true);
    try {
      // The service needs the location permission to send her position during the trip
      await LocationService.requestPermissions(true);
      const device = await getOrCreateDevice();
      const target = place ?? mapPoint;
      show(
        await startTrip({
          destination: destination.trim(),
          minutes,
          deviceId: device.id,
          latitude: target?.latitude,
          longitude: target?.longitude,
        }),
      );
      clearMapPoint();
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  };

  const action = async (fn: () => Promise<Trip>, onDone?: (t: Trip) => void) => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await fn();
      if (updated.status === "active") show(updated);
      else {
        setTrip(null);
        stopTripSignal();
        onDone?.(updated);
      }
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  };

  const arrived = () =>
    trip && action(() => confirmArrival(trip.id), () => Alert.alert(tr.llegaste_titulo, tr.llegaste_texto));

  const extend = (min: number) => trip && action(() => extendTrip(trip.id, min));

  const cancel = () =>
    trip &&
    Alert.alert(tr.cancelar_titulo, tr.cancelar_texto, [
      { text: t.modal.cancelar, style: "cancel" },
      { text: tr.cancelar_confirmar, style: "destructive", onPress: () => action(() => cancelTrip(trip.id)) },
    ]);

  const minutesLeft = trip ? Math.ceil((trip.arrival.getTime() - now) / 60000) : 0;
  // Share of the trip time already used (0 to 1), for the progress bar
  const totalMs = trip ? trip.arrival.getTime() - trip.startTime.getTime() : 0;
  const progress = trip && totalMs > 0 ? Math.min(1, Math.max(0, (now - trip.startTime.getTime()) / totalMs)) : 0;
  // Who gets the notice if she does not confirm
  const contactNames = contacts.map((c) => (c.name ?? "").trim().split(" ")[0]).filter(Boolean);
  const goToAddContact = () => navigation.navigate("AddContact");
  // Read on each refresh of "now" (every 15 s)
  const signal = trip ? tripSignalStatus() : null;
  const lastSignal = signal?.lastSentAt ? new Date(signal.lastSentAt) : trip?.lastSeenAt ?? null;

  return {
    arrivalPreview: new Date(now + minutes * 60000),
    progress: progress,
    contactNames: contactNames,
    goToAddContact: goToAddContact,
    trip: trip,
    loading: loading,
    busy: busy,
    destination: destination,
    changeDestination: changeDestination,
    places: places,
    place: place,
    choosePlace: choosePlace,
    minutes: minutes,
    setMinutes: setMinutes,
    minutesLeft: minutesLeft,
    start: start,
    arrived: arrived,
    extend: extend,
    cancel: cancel,
    goBack: navigation.goBack,
    mapPoint: mapPoint,
    mapPointLabel: mapPointLabel,
    pickerOpen: pickerOpen,
    openPicker: openPicker,
    closePicker: () => setPickerOpen(false),
    chooseMapPoint: chooseMapPoint,
    clearMapPoint: clearMapPoint,
    origin: origin,
    // false: the phone could not start sending its signal of life (permission or old version)
    signalReady: signalReady,
    lastSignal: lastSignal,
    queuedSignals: signal?.queued ?? 0,
    hasDestinationPoint: !!trip && trip.destinationLatitude != null,
  };
}
