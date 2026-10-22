import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useActivationMethods } from "../../../contexts/ActivationMethodsContext";
import type { MainStackParamList } from "../../../navigation/types";
import { grantPermission, checkPermissions, type PermissionStatus, type PermissionId } from "../../permissions/permissions";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type LocaleT = ReturnType<typeof useLocale>["t"];

export type ProtectionId = "gps" | "bateria" | "pantallaCompleta" | "inicioAutomatico" | "agitar";

export interface ProtectionItem {
  id: ProtectionId;
  icon: string; // MaterialIcons
  title: string;
  desc: string;
  /** true ready, false missing, null cannot be checked (it must be checked in the settings). */
  ready: boolean | null;
  /** The button opens the system settings instead of asking directly. */
  opensSettings: boolean;
}

type Statuses = Record<PermissionId, PermissionStatus> & { gpsOn: boolean };

const texts = (t: LocaleT): Record<ProtectionId, { icon: string; title: string; desc: string }> => ({
  gps: { icon: "my-location", title: t.tutorial.proteccion_gps_titulo, desc: t.tutorial.proteccion_gps_desc },
  bateria: { icon: "battery-charging-full", title: t.tutorial.proteccion_bateria_titulo, desc: t.tutorial.proteccion_bateria_desc },
  pantallaCompleta: { icon: "fullscreen", title: t.tutorial.proteccion_pantalla_titulo, desc: t.tutorial.proteccion_pantalla_desc },
  inicioAutomatico: { icon: "autorenew", title: t.tutorial.proteccion_inicio_titulo, desc: t.tutorial.proteccion_inicio_desc },
  agitar: { icon: "vibration", title: t.tutorial.proteccion_agitar_titulo, desc: t.tutorial.proteccion_agitar_desc },
});

/**
 * Last tutorial page: the phone settings that keep protection alive in the
 * background. Nothing is asked on its own: each setting is enabled when the user taps its button.
 */
export function useProtectionTutorialViewModel() {
  const { t } = useLocale();
  const navigation = useNavigation<Nav>();
  const { config, change } = useActivationMethods();
  const [statuses, setStatuses] = useState<Statuses | null>(null);

  const refresh = useCallback(() => {
    Promise.all([checkPermissions(config.agitar), Location.hasServicesEnabledAsync().catch(() => false)])
      .then(([permissions, gpsOn]) => setStatuses({ ...permissions, gpsOn }))
      .catch((e) => console.warn("No se pudieron revisar los ajustes de protección:", e));
  }, [config.agitar]);

  // On entering and when coming back from Android settings
  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const items = useMemo<ProtectionItem[]>(() => {
    if (!statuses) return [];
    const info = texts(t);
    const list: ProtectionItem[] = [
      {
        id: "gps",
        ...info.gps,
        ready: statuses.gpsOn && statuses.ubicacion.granted === true,
        opensSettings: !statuses.ubicacion.canAsk,
      },
      { id: "bateria", ...info.bateria, ready: statuses.bateria.granted, opensSettings: false },
      { id: "pantallaCompleta", ...info.pantallaCompleta, ready: statuses.pantallaCompleta.granted, opensSettings: false },
    ];
    if (!statuses.inicioAutomatico.hidden) {
      list.push({ id: "inicioAutomatico", ...info.inicioAutomatico, ready: statuses.inicioAutomatico.granted, opensSettings: true });
    }
    list.push({ id: "agitar", ...info.agitar, ready: config.agitar, opensSettings: false });
    return list;
  }, [statuses, config.agitar, t]);

  const activate = useCallback(
    async (id: ProtectionId) => {
      if (!statuses) return;
      if (id === "agitar") {
        change("agitar", true);
        return;
      }
      if (id === "gps") {
        if (statuses.ubicacion.granted !== true) await grantPermission("ubicacion", statuses.ubicacion);
        // Shows the Android prompt to turn on location: here the user did ask for it
        if (!statuses.gpsOn) await Location.enableNetworkProviderAsync().catch(() => undefined);
      } else {
        await grantPermission(id, statuses[id]);
      }
      refresh();
    },
    [statuses, change, refresh],
  );

  // From Settings it goes back to where it was; after sign-up it enters the app
  const start = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace("DrawerHome");
  }, [navigation]);

  const readyItems = items.filter((i) => i.ready === true).length;
  return { items, readyItems: readyItems, total: items.length, loading: !statuses, activate: activate, start: start };
}
