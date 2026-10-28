import notifee, { AndroidImportance } from "@notifee/react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { bigStyle } from "../../../notifications/notificationStyle";
import { addToInbox } from "../../../notifications/inbox";
import { useAuth } from "../../../contexts/AuthContext";
import { frequentLocationsService } from "../../../services/frequent-locations.service";
import { getRiskZones, ownRiskZones, zoneStatus, type ZoneStatus } from "../../../services/riskZones";
import type { ZoneApi } from "../../../services/zones.service";

const ZONE_CHANNEL = "zonas_riesgo";
// The same zone is not announced again for a while
const NOTICE_AGAIN_MS = 30 * 60 * 1000;

type Point = { latitude: number; longitude: number };

/**
 * Where she is with respect to the risk zones while the home screen is open: safe, near or inside one.
 * The zones are the administration's plus the places she classified as "Muy insegura". It answers at
 * once with the position the phone already knows, then follows it (every ~30 m) without asking for
 * permission, and she gets a notification when she approaches or enters a zone.
 */
export function useZoneStatus(initialPoint: Point | null) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [zones, setZones] = useState<ZoneApi[]>([]);
  const [point, setPoint] = useState<Point | null>(initialPoint);
  const notified = useRef(new Map<string, number>());

  useEffect(() => {
    if (initialPoint) setPoint(initialPoint);
  }, [initialPoint?.latitude, initialPoint?.longitude]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      let watch: Location.LocationSubscription | null = null;
      Promise.all([
        getRiskZones(),
        user?.id ? frequentLocationsService.getByUser(user.id).catch(() => []) : Promise.resolve([]),
      ]).then(([official, own]) => active && setZones([...official, ...ownRiskZones(own)]));
      (async () => {
        const { granted } = await Location.getForegroundPermissionsAsync().catch(() => ({ granted: false }));
        if (!granted || !active) return;
        // At once: the position the phone already knows (the GPS can take a while indoors)
        const last = await Location.getLastKnownPositionAsync({ maxAge: 15 * 60 * 1000 }).catch(() => null);
        if (last && active) setPoint({ latitude: last.coords.latitude, longitude: last.coords.longitude });
        watch = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 30, timeInterval: 15000 },
          (p) => setPoint({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        ).catch(() => null);
        if (!active) watch?.remove();
      })();
      return () => {
        active = false;
        watch?.remove();
      };
    }, [user?.id]),
  );

  const status: ZoneStatus | null = point ? zoneStatus(point, zones) : null;

  useEffect(() => {
    if (!status || status.kind === "safe" || !status.zone) return;
    const key = `${status.kind}:${status.zone.id}`;
    const now = Date.now();
    if (now - (notified.current.get(key) ?? 0) < NOTICE_AGAIN_MS) return;
    notified.current.set(key, now);
    const text = t.inicio.zona_aviso_texto.replace("{zona}", status.zone.name);
    const title = status.kind === "inside" ? t.inicio.zona_dentro : t.inicio.zona_cerca;
    (async () => {
      await addToInbox({ id: `zone-${key}`, kind: "zone", title, body: text, target: { screen: "Map" } });
      await notifee.createChannel({
        id: ZONE_CHANNEL,
        name: "Zonas de riesgo",
        description: "Aviso al acercarte o entrar a una zona de riesgo",
        importance: AndroidImportance.HIGH,
      });
      await notifee.displayNotification({
        id: "zona-riesgo",
        title: status.kind === "inside" ? t.inicio.zona_dentro : t.inicio.zona_cerca,
        body: text,
        android: { channelId: ZONE_CHANNEL, ...bigStyle(text), pressAction: { id: "default", launchActivity: "default" } },
      });
    })().catch(() => {});
  }, [status?.kind, status?.zone?.id]);

  return status;
}
