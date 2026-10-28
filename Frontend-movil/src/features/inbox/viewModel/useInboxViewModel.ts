import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback } from "react";
import type { MainStackParamList } from "../../../navigation/types";
import { useInbox, type InboxEntry } from "../../../notifications/inbox";

type Nav = NativeStackNavigationProp<MainStackParamList>;

/** The bell's inbox: opening it marks everything as read; each entry leads to its screen. */
export function useInboxViewModel() {
  const navigation = useNavigation<Nav>();
  const { entries, markRead, clear } = useInbox();

  // What she sees counts as read when she leaves (the dots stay while she is looking)
  useFocusEffect(
    useCallback(() => () => void markRead(), [markRead]),
  );

  const open = useCallback(
    (entry: InboxEntry) => {
      const target = entry.target;
      if (!target) return;
      switch (target.screen) {
        case "ContactAlert":
          navigation.navigate("ContactAlert", {
            alertId: target.alertId,
            userName: target.userName,
            code: target.code,
            delivery: target.delivery,
          });
          break;
        case "Trip":
          navigation.navigate("Trip");
          break;
        case "History":
          navigation.navigate("DrawerHome", { screen: "Home", params: { screen: "History" } });
          break;
        case "Map":
          navigation.navigate("DrawerHome", { screen: "Home", params: { screen: "Map" } });
          break;
      }
    },
    [navigation],
  );

  return { entries, open, clear };
}
