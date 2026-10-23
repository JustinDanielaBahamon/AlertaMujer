import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useContactsContext } from "../../../contexts/ContactsContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { getOrCreateDevice } from "../../../services/devices.service";
import { frequentLocationsService, type FrequentLocationApi } from "../../../services/frequent-locations.service";
import {
  extendTrip,
  cancelTrip,
  confirmArrival,
  startTrip,
  activeTrip,
  type Trip,
} from "../../../services/safe-trips.service";

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

  const load = useCallback(() => {
    setLoading(true);
    activeTrip()
      .then(setTrip)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

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
    setDestination(l.name);
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
      const device = await getOrCreateDevice();
      setTrip(
        await startTrip({
          destination: destination.trim(),
          minutes,
          deviceId: device.id,
          latitude: place?.latitude,
          longitude: place?.longitude,
        }),
      );
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
      if (updated.status === "active") setTrip(updated);
      else {
        setTrip(null);
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
  };
}
