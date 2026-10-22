import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "./types";
import IndexScreen from "../screens/index";
import LoginScreen from "../features/authentication/views/loginScreen";
import RegistroScreen from "../screens/registro";
import RecoverPasswordScreen from "../features/authentication/views/recuperarContraseñaScreen";
import TerminosScreen from "../screens/politica/terminos";
import PrivacidadScreen from "../screens/politica/privacidad";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Index" component={IndexScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={RegistroScreen} />
      <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} />
      <Stack.Screen name="TermsPolicy" component={TerminosScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacidadScreen} />
    </Stack.Navigator>
  );
}
