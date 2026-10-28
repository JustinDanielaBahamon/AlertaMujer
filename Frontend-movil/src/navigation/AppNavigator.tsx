import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import CompleteSignUpScreen from "../features/completeSignUp/CompleteSignUpScreen";
import { profileIncomplete } from "../features/completeSignUp/profileIncomplete";
import { getMe } from "../services/users.service";
import { useAuth } from "../contexts/AuthContext";
import type { MainStackParamList } from "./types";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { useSosAlerts } from "../notifications/useSosAlerts";
import { useShakeProtection } from "../features/shake/useShakeProtection";
import { useProtectionReminder } from "../features/permissions/useProtectionReminder";
import { syncAutoProtection } from "../features/security/autoProtection";
import AutoProtectionStop from "../features/security/AutoProtectionStop";
import { useResumeAlert } from "../features/activeAlert/useResumeAlert";
import { useSosLink } from "../features/widget/useSosLink";

export default function AppNavigator() {
  const { user, pendingMainRoute, restoring } = useAuth();
  const mainEntryRef = useRef<keyof MainStackParamList | null>(null);
  const navigation = useNavigationContainerRef<MainStackParamList>();
  // Emergency alarm when a person who has this user as a contact activates an alert
  useSosAlerts(navigation, !!user && !restoring);
  // Alert activation by shaking the phone (if the user turned it on in Settings)
  useShakeProtection(navigation, !!user && !restoring && user.id !== 0);
  // If there is an active alert of her own (the app closed with the alert in progress), go back to it
  useResumeAlert(navigation, !!user && !restoring && user.id !== 0);
  // Tap on the home screen "SOS" widget (opens alertamujer://sos)
  useSosLink(navigation, !!user && !restoring && user.id !== 0);

  // Accounts created with Google: phone, document and birth date are missing. If the query
  // fails (no signal) the app is not blocked: it is checked again the next time it opens.
  const [missingData, setMissingData] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const realSession = !!user && !restoring && user.id !== 0 && user.role_id !== 2;
  useEffect(() => {
    setProfileChecked(false);
    if (!realSession) {
      setMissingData(false);
      return;
    }
    let valid = true;
    getMe()
      .then((u) => valid && setMissingData(profileIncomplete(u)))
      .catch(() => {})
      .finally(() => valid && setProfileChecked(true));
    return () => {
      valid = false;
    };
  }, [realSession, user?.correo]);

  // Notice if something is missing for alerts to work (shake off, permissions...). It waits until the
  // sign-up is complete: it never covers the "Complete your sign-up" screen.
  const signUpDone = !!user && user.role_id === 2 ? true : profileChecked && !missingData;
  useProtectionReminder(navigation, !!user && !restoring && user.id !== 0 && signUpDone);

  // Automatic protection: her frequent places or the risk zones may have changed since last time
  const sessionUserId = !restoring && user && user.id !== 0 ? user.id : null;
  useEffect(() => {
    if (sessionUserId != null) void syncAutoProtection(sessionUserId);
  }, [sessionUserId]);

  // The native splash covers only the restoring of the session
  useEffect(() => {
    if (!restoring) SplashScreen.hideAsync().catch(() => {});
  }, [restoring]);

  if (user && mainEntryRef.current === null) {
    mainEntryRef.current = pendingMainRoute ?? "DrawerHome";
  }
  if (!user) {
    mainEntryRef.current = null;
  }

  // Avoid flashing the login screen while the session is restored
  if (restoring) {
    return null;
  }

  return (
    <>
      <NavigationContainer ref={navigation}>
        {user && missingData ? (
          <CompleteSignUpScreen onDone={() => setMissingData(false)} />
        ) : user ? (
          <MainNavigator
            key={user.correo}
            initialRouteName={mainEntryRef.current ?? "DrawerHome"}
          />
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
      {/* "Detener" of the automatic protection with her cancel PIN */}
      <AutoProtectionStop withSession={!!user && user.id !== 0} />
    </>
  );
}
