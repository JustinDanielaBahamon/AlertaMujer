import "react-native-gesture-handler";
import { useCallback, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import AlertaGlobalHost from "./src/components/ui/alertaGlobal/alertaGlobal";
import AvisoActualizacion from "./src/features/version/AvisoActualizacion";
import PrecargaImagenes from "./src/components/ui/PrecargaImagenes/PrecargaImagenes";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ContactosProvider } from "./src/contexts/ContactosContext";
import { EvidenciaProvider } from "./src/contexts/EvidenciaContext";
import { LocaleProvider } from "./src/contexts/LocaleContext";
import { MetodosActivacionProvider } from "./src/contexts/MetodosActivacionContext";
import { NotificacionesProvider } from "./src/contexts/NotificacionesContext";
import { RecorridosProvider } from "./src/contexts/RecorridosContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import ReporteUbicacion from "./src/components/ReporteUbicacion";
import SplashAnimado from "./src/components/ui/SplashAnimado/SplashAnimado";

// El splash nativo se mantiene hasta que la animación de apertura esté dibujada encima
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [mostrarSplash, setMostrarSplash] = useState(true);
  const terminarSplash = useCallback(() => setMostrarSplash(false), []);

  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <ReporteUbicacion />
          <ContactosProvider>
            <RecorridosProvider>
              <EvidenciaProvider>
                <NotificacionesProvider>
                  <MetodosActivacionProvider>
                    <PrecargaImagenes />
                    <AppNavigator />
                    <AlertaGlobalHost />
                    <AvisoActualizacion />
                    {mostrarSplash && <SplashAnimado onTerminar={terminarSplash} />}
                  </MetodosActivacionProvider>
                </NotificacionesProvider>
              </EvidenciaProvider>
            </RecorridosProvider>
          </ContactosProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}