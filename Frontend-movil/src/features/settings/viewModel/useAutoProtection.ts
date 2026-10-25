import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";
import type { MainStackParamList } from "../../../navigation/types";
import {
  autoProtectionState,
  autoProtectionSupported,
  disableAutoProtection,
  enableAutoProtection,
} from "../../security/autoProtection";

type Nav = NativeStackNavigationProp<MainStackParamList>;

/** The "Protección automática" switch: explains the permission first, then turns it on or off. */
export function useAutoProtection() {
  const { user } = useAuth();
  const { t } = useLocale();
  const s = t.seguridadAlerta;
  const navigation = useNavigation<Nav>();
  const [state, setState] = useState(autoProtectionState());
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => setState(autoProtectionState()), []);
  // Coming back from the system settings: the permission may have changed
  useFocusEffect(refresh);

  const turnOn = useCallback(async () => {
    if (!user?.id) return;
    setBusy(true);
    const result = await enableAutoProtection(user.id);
    setBusy(false);
    refresh();
    switch (result) {
      case "ok":
        Alert.alert(s.auto_titulo, s.auto_activada);
        break;
      case "no_places":
        Alert.alert(s.auto_titulo, s.auto_sin_lugares, [
          { text: t.modal.cerrar, style: "cancel" },
          {
            text: s.auto_ir_mapa,
            onPress: () => navigation.navigate("DrawerHome", { screen: "Home", params: { screen: "Map" } }),
          },
        ]);
        break;
      case "no_permission":
        Alert.alert(s.auto_titulo, s.auto_sin_permiso, [
          { text: t.modal.cerrar, style: "cancel" },
          { text: s.auto_continuar, onPress: () => void Linking.openSettings() },
        ]);
        break;
      default:
        Alert.alert(s.auto_titulo, s.auto_error);
    }
  }, [user?.id, s, t, navigation, refresh]);

  const toggle = useCallback(
    (on: boolean) => {
      if (busy) return;
      if (!on) {
        void disableAutoProtection().then(refresh);
        setState((v) => ({ ...v, enabled: false }));
        return;
      }
      // The system dialog for "Permitir todo el tiempo" is confusing without a word first
      Alert.alert(s.auto_permiso_titulo, s.auto_permiso_texto, [
        { text: t.modal.cerrar, style: "cancel" },
        { text: s.auto_continuar, onPress: () => void turnOn() },
      ]);
    },
    [busy, s, t, turnOn, refresh],
  );

  return {
    supported: autoProtectionSupported(),
    enabled: state.enabled,
    // On but the permission was taken away later: it cannot watch with the app closed
    missingPermission: state.enabled && !state.permissions,
    busy,
    toggle,
    openSettings: () => void Linking.openSettings(),
  };
}
