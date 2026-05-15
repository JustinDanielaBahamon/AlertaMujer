import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "./types";
import IndexScreen from "../screens/index";
import LoginScreen from "../features/authentication/views/loginScreen";
import RegistroScreen from "../screens/registro";
import RecuperarContrasenaScreen from "../features/authentication/views/recuperarContraseñaScreen";
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
      <Stack.Screen name="Registro" component={RegistroScreen} />
      <Stack.Screen name="RecuperarContrasena" component={RecuperarContrasenaScreen} />
      <Stack.Screen name="PoliticaTerminos" component={TerminosScreen} />
      <Stack.Screen name="PoliticaPrivacidad" component={PrivacidadScreen} />
    </Stack.Navigator>
  );
}
