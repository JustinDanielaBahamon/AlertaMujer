import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useMetodosActivacion } from "../../../contexts/MetodosActivacionContext";
import type { MainStackParamList } from "../../../navigation/types";
import { activarPermiso, revisarPermisos, type EstadoPermiso, type IdPermiso } from "../../permisos/permisos";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type LocaleT = ReturnType<typeof useLocale>["t"];

export type IdProteccion = "gps" | "bateria" | "pantallaCompleta" | "inicioAutomatico" | "agitar";

export interface ProteccionItem {
  id: IdProteccion;
  icono: string; // MaterialIcons
  titulo: string;
  desc: string;
  /** true listo, false falta, null no se puede comprobar (hay que revisarlo en los ajustes). */
  listo: boolean | null;
  /** El botón abre los ajustes del sistema en vez de pedir directamente. */
  abreAjustes: boolean;
}

type Estados = Record<IdPermiso, EstadoPermiso> & { gpsEncendido: boolean };

const textos = (t: LocaleT): Record<IdProteccion, { icono: string; titulo: string; desc: string }> => ({
  gps: { icono: "my-location", titulo: t.tutorial.proteccion_gps_titulo, desc: t.tutorial.proteccion_gps_desc },
  bateria: { icono: "battery-charging-full", titulo: t.tutorial.proteccion_bateria_titulo, desc: t.tutorial.proteccion_bateria_desc },
  pantallaCompleta: { icono: "fullscreen", titulo: t.tutorial.proteccion_pantalla_titulo, desc: t.tutorial.proteccion_pantalla_desc },
  inicioAutomatico: { icono: "autorenew", titulo: t.tutorial.proteccion_inicio_titulo, desc: t.tutorial.proteccion_inicio_desc },
  agitar: { icono: "vibration", titulo: t.tutorial.proteccion_agitar_titulo, desc: t.tutorial.proteccion_agitar_desc },
});

/**
 * Última página del tutorial: los ajustes del celular que mantienen viva la protección en segundo
 * plano. Nada se pide solo: cada ajuste se activa cuando la usuaria toca su botón.
 */
export function useProtectionTutorialViewModel() {
  const { t } = useLocale();
  const navigation = useNavigation<Nav>();
  const { config, cambiar } = useMetodosActivacion();
  const [estados, setEstados] = useState<Estados | null>(null);

  const refrescar = useCallback(() => {
    Promise.all([revisarPermisos(config.agitar), Location.hasServicesEnabledAsync().catch(() => false)])
      .then(([permisos, gpsEncendido]) => setEstados({ ...permisos, gpsEncendido }))
      .catch((e) => console.warn("No se pudieron revisar los ajustes de protección:", e));
  }, [config.agitar]);

  // Al entrar y al volver de los ajustes de Android
  useEffect(() => {
    refrescar();
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active") refrescar();
    });
    return () => sub.remove();
  }, [refrescar]);

  const items = useMemo<ProteccionItem[]>(() => {
    if (!estados) return [];
    const info = textos(t);
    const lista: ProteccionItem[] = [
      {
        id: "gps",
        ...info.gps,
        listo: estados.gpsEncendido && estados.ubicacion.concedido === true,
        abreAjustes: !estados.ubicacion.puedePreguntar,
      },
      { id: "bateria", ...info.bateria, listo: estados.bateria.concedido, abreAjustes: false },
      { id: "pantallaCompleta", ...info.pantallaCompleta, listo: estados.pantallaCompleta.concedido, abreAjustes: false },
    ];
    if (!estados.inicioAutomatico.oculto) {
      lista.push({ id: "inicioAutomatico", ...info.inicioAutomatico, listo: estados.inicioAutomatico.concedido, abreAjustes: true });
    }
    lista.push({ id: "agitar", ...info.agitar, listo: config.agitar, abreAjustes: false });
    return lista;
  }, [estados, config.agitar, t]);

  const activar = useCallback(
    async (id: IdProteccion) => {
      if (!estados) return;
      if (id === "agitar") {
        cambiar("agitar", true);
        return;
      }
      if (id === "gps") {
        if (estados.ubicacion.concedido !== true) await activarPermiso("ubicacion", estados.ubicacion);
        // Muestra el aviso de Android para encender la ubicación: aquí sí lo pidió la usuaria
        if (!estados.gpsEncendido) await Location.enableNetworkProviderAsync().catch(() => undefined);
      } else {
        await activarPermiso(id, estados[id]);
      }
      refrescar();
    },
    [estados, cambiar, refrescar],
  );

  // Desde Ajustes se vuelve a donde estaba; después del registro entra a la app
  const empezar = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace("DrawerHome");
  }, [navigation]);

  const listos = items.filter((i) => i.listo === true).length;
  return { items, listos, total: items.length, cargando: !estados, activar, empezar };
}
