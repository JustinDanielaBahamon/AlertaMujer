import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "./types";
import IndexScreen from "../screens/index";
import LoginScreen from "../features/authentication/views/loginScreen";
import RegistroScreen from "../screens/signUp";
import RecoverPasswordScreen from "../features/authentication/views/recoverPasswordScreen";
import TerminosScreen from "../screens/policy/terms";
import PrivacidadScreen from "../screens/policy/privacy";

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
