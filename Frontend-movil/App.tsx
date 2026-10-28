import "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GlobalAlertHost from "./src/components/ui/globalAlert/globalAlert";
import UpdateNotice from "./src/features/version/UpdateNotice";
import ImagePreload from "./src/components/ui/ImagePreload/ImagePreload";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ContactsProvider } from "./src/contexts/ContactsContext";
import { EvidenceProvider } from "./src/contexts/EvidenceContext";
import { LocaleProvider } from "./src/contexts/LocaleContext";
import { ActivationMethodsProvider } from "./src/contexts/ActivationMethodsContext";
import { NotificationsProvider } from "./src/contexts/NotificationsContext";
import { RoutesProvider } from "./src/contexts/RoutesContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import LocationReport from "./src/components/LocationReporting";
import { syncDiscreet } from "./src/features/settings/discreetMode";

// The native splash stays until the session is restored (AppNavigator hides it): no opening animation,
// the app must be usable at once, above all when it opens from an alert notification
SplashScreen.preventAutoHideAsync().catch(() => {});

// The native services (recorder, trip) read the saved "Modo discreto" choice
syncDiscreet().catch(() => {});

export default function App() {
  // SafeAreaProvider at the root: screens rendered outside a navigator (e.g. CompleteSignUpScreen)
  // also need the safe area insets, otherwise useSafeAreaInsets throws and the app closes
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <AuthProvider>
            <LocationReport />
            <ContactsProvider>
              <RoutesProvider>
                <EvidenceProvider>
                  <NotificationsProvider>
                    <ActivationMethodsProvider>
                      <ImagePreload />
                      <AppNavigator />
                      <GlobalAlertHost />
                      <UpdateNotice />
                    </ActivationMethodsProvider>
                  </NotificationsProvider>
                </EvidenceProvider>
              </RoutesProvider>
            </ContactsProvider>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
