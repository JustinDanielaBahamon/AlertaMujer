import "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { LocaleProvider } from "./src/contexts/LocaleContext";
import { ContactosProvider } from "./src/contexts/ContactosContext";
import { RecorridosProvider } from "./src/contexts/RecorridosContext";

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <ContactosProvider>
            <RecorridosProvider>
              <AppNavigator />
            </RecorridosProvider>
          </ContactosProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}