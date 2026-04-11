import { NavigationContainer } from "@react-navigation/native";
import { useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { MainStackParamList } from "./types";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

export default function AppNavigator() {
  const { user, pendingMainRoute } = useAuth();
  const mainEntryRef = useRef<keyof MainStackParamList | null>(null);

  if (user && mainEntryRef.current === null) {
    mainEntryRef.current = pendingMainRoute ?? "DrawerHome";
  }
  if (!user) {
    mainEntryRef.current = null;
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainNavigator
          key={user.correo}
          initialRouteName={mainEntryRef.current ?? "DrawerHome"}
        />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
