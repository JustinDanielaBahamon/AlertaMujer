import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { useActivationMethods } from "../../contexts/ActivationMethodsContext";
import { grantPermission, PERMISSIONS, checkPermissions, type PermissionStatus, type PermissionId } from "./permissions";
import { EXPLANATION, recentInterruptions, type Interruption } from "./protectionHealth";
import ShakeSensor from "../../../modules/shake-sensor";
import { useAutomaticRecording } from "./useAutomaticRecording";

// Camera and microphone are shown next to their automatic recording switches
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

  // On entering and when coming back from Android settings (the user may have changed something there)
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
        change("agitar", true); // useShakeProtection starts the service and asks for whatever is missing
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

  // Protection health: verified with the exits Android recorded
  const latest = interruptions[0];
  const health = !config.agitar
    ? null
    : {
        times: interruptions.length,
        explanation: latest ? EXPLANATION[latest.cause] : null,
        // If the system cut it, the fix is the brand's auto start
        canFix: latest?.cause === "sistema",
        fix: () => {
          ShakeSensor.openAutoStart();
        },
      };

  // If recording is on but the permission was later removed in Android, the card warns about it
  const evidence = {
    video: { enabled: recording.recordVideo, noPermission: recording.recordVideo && statuses?.camara.granted === false },
    audio: { enabled: recording.recordAudio, noPermission: recording.recordAudio && statuses?.microfono.granted === false },
    changeVideo: recording.toggleRecordVideo,
    changeAudio: recording.toggleRecordAudio,
  };

  return { items, readyItems: readyItems, total: items.length, loading: !statuses, activate: activate, health: health, evidence: evidence, goBack: navigation.goBack };
}
