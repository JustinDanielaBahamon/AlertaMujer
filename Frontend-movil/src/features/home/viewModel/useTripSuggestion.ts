import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { activeTrip } from "../../../services/safe-trips.service";

const DISMISSED_KEY = "@alerta-mujer:trip-card-dismissed";
// The first time it announces what is new in the trip (signal of life, destination, risk zones)
const NEWS_KEY = "@alerta-mujer:news-trip-signal";

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
  const [isNews, setIsNews] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      AsyncStorage.multiGet([DISMISSED_KEY, NEWS_KEY])
        .then(([[, day], [, news]]) => {
          if (!active) return;
          setIsNews(!news);
          // The news is shown even if the suggestion was closed today
          setDismissed(!!news && day === today());
        })
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

  const newsRead = () => {
    setIsNews(false);
    AsyncStorage.setItem(NEWS_KEY, "1").catch(() => {});
  };

  // "Ahora no": not again today
  const dismiss = useCallback(() => {
    setDismissed(true);
    newsRead();
    AsyncStorage.setItem(DISMISSED_KEY, today()).catch(() => {});
  }, []);

  // Started a trip or the popup hid itself: not again until the app is opened again
  const markSeen = useCallback((read = true) => {
    shownThisSession = true;
    setSeen(true);
    if (read) newsRead();
  }, []);

  return { visible: !seen && !dismissed && !hasTrip && !hasActiveAlert, isNews, dismiss, markSeen };
}
