import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useContactsContext } from "../../../contexts/ContactsContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { getOrCreateDevice } from "../../../services/devices.service";
import { frequentLocationsService, type FrequentLocationApi } from "../../../services/frequent-locations.service";
import { getPlace, placeDescription, searchPlaces, type FoundPlace } from "../../../services/geocoding.service";
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
import {
  onTripSignalEnded,
  stopTripSignal,
  syncTripSignal,
  tripSignalStatus,
  type TripSignalState,
} from "../tripSignal";

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
  // Point B: the destination point (saved place, address found or tapped on the map)
  const [mapPoint, setMapPoint] = useState<LatLng | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Point A: always where she is now
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [originLabel, setOriginLabel] = useState("");
  const [found, setFound] = useState<FoundPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [signalState, setSignalState] = useState<TripSignalState>("running");

  // Every time the screen shows the trip, the signal-of-life service is (re)started for it
  const show = useCallback((found: Trip | null) => {
    setTrip(found);
    syncTripSignal(found)
      .then(setSignalState)
      .catch(() => setSignalState("failed"));
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

  // Point A: her current location and its neighborhood, as soon as the screen opens
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const here = await LocationService.getCurrentPosition(false);
        if (!here || !active) return;
        const point = { latitude: here.coords.latitude, longitude: here.coords.longitude };
        setOrigin(point);
        const where = await getPlace(point.latitude, point.longitude).catch(() => null);
        if (active && where) setOriginLabel(where.neighborhood ?? placeDescription(where));
      } catch {
        // Without location point A is shown as "your current location"
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // While she types the destination (and has not chosen a point) addresses are searched near her
  useEffect(() => {
    if (mapPoint || destination.trim().length < 3) {
      setFound([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let active = true;
    // One query per pause in typing (OpenStreetMap asks for at most 1 per second)
    const id = setTimeout(() => {
      searchPlaces(destination, origin)
        .then((r) => active && setFound(r))
        .finally(() => active && setSearching(false));
    }, 700);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [destination, mapPoint, origin]);

  // On-screen countdown and arrival preview (every 15 s is enough: they are shown in minutes)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const choosePlace = (l: FrequentLocationApi) => {
    setPlace(l);
    setMapPoint(l.latitude != null && l.longitude != null ? { latitude: Number(l.latitude), longitude: Number(l.longitude) } : null);
    setDestination(l.name);
  };

  // An address from the search: it becomes point B
  const chooseFound = (f: FoundPlace) => {
    setPlace(null);
    setMapPoint({ latitude: f.latitude, longitude: f.longitude });
    setDestination(f.name);
    setFound([]);
  };

  const openPicker = () => setPickerOpen(true);

  // Point B tapped on the map: its address becomes the destination name
  const chooseMapPoint = async (point: LatLng, name?: string) => {
    setMapPoint(point);
    setPlace(null);
    if (name) {
      setDestination(name);
      return;
    }
    const where = await getPlace(point.latitude, point.longitude).catch(() => null);
    if (where) setDestination(placeDescription(where));
  };

  const clearMapPoint = () => {
    setMapPoint(null);
    setPlace(null);
  };

  // Writing again after choosing a point means a different destination
  const changeDestination = (text: string) => {
    setDestination(text);
    if (mapPoint) clearMapPoint();
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
      const target = mapPoint;
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
    originLabel: originLabel,
    found: found,
    searching: searching,
    chooseFound: chooseFound,
    pickerOpen: pickerOpen,
    openPicker: openPicker,
    closePicker: () => setPickerOpen(false),
    chooseMapPoint: chooseMapPoint,
    clearMapPoint: clearMapPoint,
    origin: origin,
    // Whether the phone is sending its signal of life (or why not)
    signalState: signalState,
    lastSignal: lastSignal,
    queuedSignals: signal?.queued ?? 0,
    hasDestinationPoint: !!trip && trip.destinationLatitude != null,
  };
}
