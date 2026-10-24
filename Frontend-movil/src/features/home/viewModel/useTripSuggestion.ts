import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { activeTrip } from "../../../services/safe-trips.service";

const DISMISSED_KEY = "@alerta-mujer:trip-card-dismissed";

const today = () => new Date().toDateString();
// Shown at most once each time the app is opened
let shownThisSession = false;

/**
 * Discreet "¿Vas a algún lado?" card on the home screen. Not shown with a trip in progress, with an
 * alert of her own active, or once she closed it today.
 */
export function useTripSuggestion(hasActiveAlert: boolean) {
  const [hasTrip, setHasTrip] = useState(true);
  const [dismissed, setDismissed] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      AsyncStorage.getItem(DISMISSED_KEY)
        .then((day) => active && setDismissed(day === today()))
        .catch(() => active && setDismissed(false));
      activeTrip()
        .then((trip) => active && setHasTrip(!!trip))
        .catch(() => active && setHasTrip(false));
      return () => {
        active = false;
      };
    }, []),
  );

  const [seen, setSeen] = useState(shownThisSession);

  // "Ahora no": not again today
  const dismiss = useCallback(() => {
    setDismissed(true);
    AsyncStorage.setItem(DISMISSED_KEY, today()).catch(() => {});
  }, []);

  // Started a trip or the popup hid itself: not again until the app is opened again
  const markSeen = useCallback(() => {
    shownThisSession = true;
    setSeen(true);
  }, []);

  return { visible: !seen && !dismissed && !hasTrip && !hasActiveAlert, dismiss, markSeen };
}
