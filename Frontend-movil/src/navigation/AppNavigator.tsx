import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import DrawerNavigator from "./DrawerNavigator";
import IndexScreen from "../../app/index";
import LoginScreen from "../../app/login";
import RegistroScreen from "../../app/registro";
import ActivacionScreen from "../../app/activacion";
import RecuperarContrasenaScreen from "../../features/login/recuperarContraseña";
import BienvenidaTutorialScreen from "../../app/tutorial/bienvenida";
import BotonTutorialScreen from "../../app/tutorial/boton";
import MensajeTutorialScreen from "../../app/tutorial/mensaje";
import UbicacionTutorialScreen from "../../app/tutorial/ubicacion";
import ContactoTutorialScreen from "../../app/tutorial/contacto";
import SeguridadTutorialScreen from "../../app/tutorial/seguridad";
import NotificacionTutorialScreen from "../../app/tutorial/notificacion";
import TerminosScreen from "../../app/politica/terminos";
import PrivacidadScreen from "../../app/politica/privacidad";
import AgregarContactoScreen from "../../features/Agregarcontacto/agregarScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Index" component={IndexScreen} />
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Registro" component={RegistroScreen} />
        <RootStack.Screen name="RecuperarContrasena" component={RecuperarContrasenaScreen} />
        <RootStack.Screen name="Activacion" component={ActivacionScreen} />
        <RootStack.Screen name="DrawerHome" component={DrawerNavigator} />
        <RootStack.Screen name="TutorialBienvenida" component={BienvenidaTutorialScreen} />
        <RootStack.Screen name="TutorialBoton" component={BotonTutorialScreen} />
        <RootStack.Screen name="TutorialMensaje" component={MensajeTutorialScreen} />
        <RootStack.Screen name="TutorialUbicacion" component={UbicacionTutorialScreen} />
        <RootStack.Screen name="TutorialContacto" component={ContactoTutorialScreen} />
        <RootStack.Screen name="TutorialSeguridad" component={SeguridadTutorialScreen} />
        <RootStack.Screen name="TutorialNotificacion" component={NotificacionTutorialScreen} />
        <RootStack.Screen name="PoliticaTerminos" component={TerminosScreen} />
        <RootStack.Screen name="PoliticaPrivacidad" component={PrivacidadScreen} />
        <RootStack.Screen name="AgregarContacto" component={AgregarContactoScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}