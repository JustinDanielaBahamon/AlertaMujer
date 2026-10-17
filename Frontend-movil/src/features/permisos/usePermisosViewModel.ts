import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { useMetodosActivacion } from "../../contexts/MetodosActivacionContext";
import { activarPermiso, PERMISOS, revisarPermisos, type EstadoPermiso, type IdPermiso } from "./permisos";

export function usePermisosViewModel() {
  const navigation = useNavigation();
  const { config, cambiar } = useMetodosActivacion();
  const [estados, setEstados] = useState<Record<IdPermiso, EstadoPermiso> | null>(null);

  const refrescar = useCallback(() => {
    revisarPermisos(config.agitar)
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

  const items = PERMISOS.map((p) => ({ ...p, estado: estados?.[p.id] ?? null }));
  const listos = items.filter((i) => i.estado?.concedido).length;

  return { items, listos, total: items.length, cargando: !estados, activar, volver: navigation.goBack };
}
