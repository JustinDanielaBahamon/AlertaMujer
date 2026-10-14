import "react-native-gesture-handler";
import AlertaGlobalHost from "./src/components/ui/alertaGlobal/alertaGlobal";
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

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <ContactosProvider>
            <RecorridosProvider>
              <EvidenciaProvider>
                <NotificacionesProvider>
                  <MetodosActivacionProvider>
                    <PrecargaImagenes />
                    <AppNavigator />
                    <AlertaGlobalHost />
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