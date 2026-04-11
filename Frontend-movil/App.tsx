import "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { LocaleProvider } from "./src/contexts/LocaleContext";

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}