import "react-native-gesture-handler";
import { useCallback, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import GlobalAlertHost from "./src/components/ui/alertaGlobal/alertaGlobal";
import UpdateNotice from "./src/features/version/AvisoActualizacion";
import ImagePreload from "./src/components/ui/PrecargaImagenes/PrecargaImagenes";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ContactsProvider } from "./src/contexts/ContactosContext";
import { EvidenceProvider } from "./src/contexts/EvidenciaContext";
import { LocaleProvider } from "./src/contexts/LocaleContext";
import { ActivationMethodsProvider } from "./src/contexts/MetodosActivacionContext";
import { NotificationsProvider } from "./src/contexts/NotificacionesContext";
import { RoutesProvider } from "./src/contexts/RecorridosContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import LocationReport from "./src/components/ReporteUbicacion";
import AnimatedSplash from "./src/components/ui/SplashAnimado/SplashAnimado";

// El splash nativo se mantiene hasta que la animación de apertura esté dibujada encima
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