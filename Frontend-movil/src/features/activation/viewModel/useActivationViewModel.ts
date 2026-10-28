import { useCallback, useEffect, useRef, useState } from "react";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Vibration } from "react-native";
import { useEvidence } from "../../../contexts/EvidenceContext";
import { useNotifications } from "../../../contexts/NotificationsContext";
import ShakeSensor from "../../../../modules/shake-sensor";
import type { MainStackParamList } from "../../../navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;
type ActivationRoute = RouteProp<MainStackParamList, "Activation">;

export function useActivationViewModel() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ActivationRoute>();
  // If a contact comes in, the alert is only for that person (not for everyone)
  const contact = route.params?.contact;
  const method = route.params?.method;
  const { config } = useNotifications();
  const { recordVideo, recordAudio } = useEvidence();
  const [counter, setCounter] = useState(5);

  // Avoids navigating twice (for example, if "Activate now" is tapped right when the countdown reaches 0)
  const alreadyNavigatedRef = useRef(false);

  const goToActiveAlert = useCallback(() => {
    if (alreadyNavigatedRef.current) return;
    alreadyNavigatedRef.current = true;
    navigation.replace("ActiveAlert", contact || method ? { contact: contact, method: method } : undefined);
  }, [navigation, contact, method]);

  // A countdown left under another screen must not keep running and fire an alert by itself:
  // it only advances while it is the screen on display
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return undefined;
    if (counter > 0) {
      // A short vibration for each second of the countdown (5, 4, 3, 2, 1)
      if (config.vibracion) Vibration.vibrate(200);
      const timer = setTimeout(() => setCounter((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    goToActiveAlert();
    return undefined;
  }, [counter, goToActiveAlert, config.vibracion, isFocused]);

  // 4 x "volume down" within 2 s cancels it without looking at the screen (only during the countdown)
  useEffect(() => {
    if (!isFocused || typeof ShakeSensor?.startVolumeCancel !== "function") return undefined;
    const sub = ShakeSensor.addListener("onVolumeCancel", () => {
      if (alreadyNavigatedRef.current) return;
      alreadyNavigatedRef.current = true;
      Vibration.vibrate([0, 120, 120, 120]);
      navigation.goBack();
    });
    ShakeSensor.startVolumeCancel();
    return () => {
      sub.remove();
      ShakeSensor.stopVolumeCancel();
    };
  }, [isFocused, navigation]);

  // Skips the countdown and goes straight to the active alert screen
  const activateNow = useCallback(() => {
    goToActiveAlert();
  }, [goToActiveAlert]);

  const cancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return { counter: counter, cancel: cancel, activateNow: activateNow, recordVideo: recordVideo, recordAudio: recordAudio };
}