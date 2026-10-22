import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { useActivationMethods } from "../../contexts/MetodosActivacionContext";
import { grantPermission, PERMISSIONS, checkPermissions, type PermissionStatus, type PermissionId } from "./permisos";
import { EXPLANATION, recentInterruptions, type Interruption } from "./saludProteccion";
import SensorSacudidas from "../../../modules/sensor-sacudidas";
import { useAutomaticRecording } from "./useGrabacionAutomatica";

// Cámara y micrófono se muestran junto a sus interruptores de grabación automática
const RECORDING_PERMISSIONS: PermissionId[] = ["camara", "microfono"];

export function usePermissionsViewModel() {
  const navigation = useNavigation();
  const { config, change } = useActivationMethods();
  const [statuses, setStatuses] = useState<Record<PermissionId, PermissionStatus> | null>(null);
  const [interruptions, setInterruptions] = useState<Interruption[]>([]);

  const refresh = useCallback(() => {
    const cortes = recentInterruptions();
    setInterruptions(cortes);
    checkPermissions(config.agitar, cortes.filter((c) => c.cause === "sistema").length)
      .then(setStatuses)
      .catch((e) => console.warn("No se pudieron revisar los permisos:", e));
  }, [config.agitar]);

  // Al entrar y al volver de los ajustes de Android (la usuaria pudo cambiar algo allá)
  useFocusEffect(refresh);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const activate = useCallback(
    async (id: PermissionId) => {
      if (id === "agitar") {
        change("agitar", true); // useProteccionAgitar enciende el servicio y pide lo que falte
        return;
      }
      if (!statuses) return;
      await grantPermission(id, statuses[id]);
      refresh();
    },
    [statuses, change, refresh],
  );

  const recording = useAutomaticRecording(refresh);

  const items = PERMISSIONS.map((p) => ({ ...p, status: statuses?.[p.id] ?? null })).filter(
    (i) => !i.status?.hidden && !RECORDING_PERMISSIONS.includes(i.id),
  );
  const readyItems = items.filter((i) => i.status?.granted === true).length;

  // Salud de la protección: verificada con los cierres que registró Android
  const latest = interruptions[0];
  const health = !config.agitar
    ? null
    : {
        times: interruptions.length,
        explanation: latest ? EXPLANATION[latest.cause] : null,
        // Si la cortó el sistema, el arreglo es el inicio automático de la marca
        canFix: latest?.cause === "sistema",
        fix: () => {
          SensorSacudidas.abrirInicioAutomatico();
        },
      };

  // Si la grabación está encendida pero luego se quitó el permiso desde Android, se avisa en la tarjeta
  const evidence = {
    video: { enabled: recording.recordVideo, noPermission: recording.recordVideo && statuses?.camara.granted === false },
    audio: { enabled: recording.recordAudio, noPermission: recording.recordAudio && statuses?.microfono.granted === false },
    changeVideo: recording.toggleRecordVideo,
    changeAudio: recording.toggleRecordAudio,
  };

  return { items, readyItems: readyItems, total: items.length, loading: !statuses, activate: activate, health: health, evidence: evidence, goBack: navigation.goBack };
}
