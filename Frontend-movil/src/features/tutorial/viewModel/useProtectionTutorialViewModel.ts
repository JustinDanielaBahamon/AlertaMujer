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
  /** true listo, false falta, null no se puede comprobar (hay que revisarlo en los ajustes). */
  ready: boolean | null;
  /** El botón abre los ajustes del sistema en vez de pedir directamente. */
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
 * Última página del tutorial: los ajustes del celular que mantienen viva la protección en segundo
 * plano. Nada se pide solo: cada ajuste se activa cuando la usuaria toca su botón.
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

  // Al entrar y al volver de los ajustes de Android
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
        // Muestra el aviso de Android para encender la ubicación: aquí sí lo pidió la usuaria
        if (!statuses.gpsOn) await Location.enableNetworkProviderAsync().catch(() => undefined);
      } else {
        await grantPermission(id, statuses[id]);
      }
      refresh();
    },
    [statuses, change, refresh],
  );

  // Desde Ajustes se vuelve a donde estaba; después del registro entra a la app
  const start = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace("DrawerHome");
  }, [navigation]);

  const readyItems = items.filter((i) => i.ready === true).length;
  return { items, readyItems: readyItems, total: items.length, loading: !statuses, activate: activate, start: start };
}
