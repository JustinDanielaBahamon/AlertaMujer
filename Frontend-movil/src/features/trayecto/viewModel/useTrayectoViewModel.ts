import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
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
 * "Avísame si no llego": la usuaria dice a dónde va y en cuánto llega. Si no confirma a tiempo, el
 * servidor avisa a sus contactos con su última ubicación, aunque su celular se quede sin datos.
 */
export function useTripViewModel() {
  const navigation = useNavigation();
  const { t } = useLocale();
  const tr = t.trayecto;
  const { user } = useAuth();
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

  // Cuenta regresiva en pantalla (cada 15 s basta: se muestra en minutos)
  useEffect(() => {
    if (!trip) return;
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, [trip]);

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

  return {
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
