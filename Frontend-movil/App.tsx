import "react-native-gesture-handler";
import { useCallback, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
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
import AnimatedSplash from "./src/components/ui/AnimatedSplash/AnimatedSplash";

// The native splash stays until the opening animation is drawn on top
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const finishSplash = useCallback(() => setShowSplash(false), []);

  return (
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
                    {showSplash && <AnimatedSplash onFinish={finishSplash} />}
                  </ActivationMethodsProvider>
                </NotificationsProvider>
              </EvidenceProvider>
            </RoutesProvider>
          </ContactsProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}