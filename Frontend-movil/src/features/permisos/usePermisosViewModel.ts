import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { useMetodosActivacion } from "../../contexts/MetodosActivacionContext";
import { activarPermiso, PERMISOS, revisarPermisos, type EstadoPermiso, type IdPermiso } from "./permisos";
import { EXPLICACION, interrupcionesRecientes, type Interrupcion } from "./saludProteccion";
import SensorSacudidas from "../../../modules/sensor-sacudidas";
import { useGrabacionAutomatica } from "./useGrabacionAutomatica";

// Cámara y micrófono se muestran junto a sus interruptores de grabación automática
const DE_GRABACION: IdPermiso[] = ["camara", "microfono"];

export function usePermisosViewModel() {
  const navigation = useNavigation();
  const { config, cambiar } = useMetodosActivacion();
  const [estados, setEstados] = useState<Record<IdPermiso, EstadoPermiso> | null>(null);
  const [interrupciones, setInterrupciones] = useState<Interrupcion[]>([]);

  const refrescar = useCallback(() => {
    const cortes = interrupcionesRecientes();
    setInterrupciones(cortes);
    revisarPermisos(config.agitar, cortes.filter((c) => c.causa === "sistema").length)
      .then(setEstados)
      .catch((e) => console.warn("No se pudieron revisar los permisos:", e));
  }, [config.agitar]);

  // Al entrar y al volver de los ajustes de Android (la usuaria pudo cambiar algo allá)
  useFocusEffect(refrescar);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active") refrescar();
    });
    return () => sub.remove();
  }, [refrescar]);

  const activar = useCallback(
    async (id: IdPermiso) => {
      if (id === "agitar") {
        cambiar("agitar", true); // useProteccionAgitar enciende el servicio y pide lo que falte
        return;
      }
      if (!estados) return;
      await activarPermiso(id, estados[id]);
      refrescar();
    },
    [estados, cambiar, refrescar],
  );

  const grabacion = useGrabacionAutomatica(refrescar);

  const items = PERMISOS.map((p) => ({ ...p, estado: estados?.[p.id] ?? null })).filter(
    (i) => !i.estado?.oculto && !DE_GRABACION.includes(i.id),
  );
  const listos = items.filter((i) => i.estado?.concedido === true).length;

  // Salud de la protección: verificada con los cierres que registró Android
  const ultima = interrupciones[0];
  const salud = !config.agitar
    ? null
    : {
        veces: interrupciones.length,
        explicacion: ultima ? EXPLICACION[ultima.causa] : null,
        // Si la cortó el sistema, el arreglo es el inicio automático de la marca
        puedeArreglar: ultima?.causa === "sistema",
        arreglar: () => {
          SensorSacudidas.abrirInicioAutomatico();
        },
      };

  // Si la grabación está encendida pero luego se quitó el permiso desde Android, se avisa en la tarjeta
  const evidencias = {
    video: { activo: grabacion.grabarVideo, sinPermiso: grabacion.grabarVideo && estados?.camara.concedido === false },
    audio: { activo: grabacion.grabarAudio, sinPermiso: grabacion.grabarAudio && estados?.microfono.concedido === false },
    cambiarVideo: grabacion.cambiarGrabarVideo,
    cambiarAudio: grabacion.cambiarGrabarAudio,
  };

  return { items, listos, total: items.length, cargando: !estados, activar, salud, evidencias, volver: navigation.goBack };
}
