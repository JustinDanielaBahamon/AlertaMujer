import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import type { MainStackParamList } from "./types";
import { useAuth } from "../contexts/AuthContext";
import DrawerNavigator from "./drawer/DrawerNavigator";
import ActivacionScreen from "../features/BotonActivacion/activacion";
import BienvenidaTutorialScreen from "../screens/tutorial/bienvenida";
import BotonTutorialScreen from "../screens/tutorial/boton";
import MensajeTutorialScreen from "../screens/tutorial/mensaje";
import UbicacionTutorialScreen from "../screens/tutorial/ubicacion";
import ContactoTutorialScreen from "../screens/tutorial/contacto";
import SeguridadTutorialScreen from "../screens/tutorial/seguridad";
import NotificacionTutorialScreen from "../screens/tutorial/notificacion";
import AgregarContactoScreen from "../features/contactos/view/agregarScreen";
import DetalleAlertaScreen from "../features/historial/view/detallesAlerta"; // ← nuevo
import PerfilScreen from "../features/perfil/view/perfilScreen";
import HistorialMapa from "../features/historial/view/historial";
import MetodosActivacionScreen from "../features/settings/view/metodosActivacionScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

type Props = {
  initialRouteName: keyof MainStackParamList;
};

export default function MainNavigator({ initialRouteName }: Props) {
  const { clearPendingMainRoute } = useAuth();

  useEffect(() => {
    clearPendingMainRoute();
  }, [clearPendingMainRoute]);

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="DrawerHome" component={DrawerNavigator} />
      <Stack.Screen name="Activacion" component={ActivacionScreen} />
      <Stack.Screen name="TutorialBienvenida" component={BienvenidaTutorialScreen} />
      <Stack.Screen name="TutorialBoton" component={BotonTutorialScreen} />
      <Stack.Screen name="TutorialMensaje" component={MensajeTutorialScreen} />
      <Stack.Screen name="TutorialUbicacion" component={UbicacionTutorialScreen} />
      <Stack.Screen name="TutorialContacto" component={ContactoTutorialScreen} />
      <Stack.Screen name="TutorialSeguridad" component={SeguridadTutorialScreen} />
      <Stack.Screen name="TutorialNotificacion" component={NotificacionTutorialScreen} />
      <Stack.Screen name="AgregarContacto" component={AgregarContactoScreen} />
      <Stack.Screen name="DetalleAlerta" component={DetalleAlertaScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} /> 
      <Stack.Screen name="historialMapa" component={HistorialMapa}/>
      <Stack.Screen name="MetodosActivacion" component={MetodosActivacionScreen} />
    </Stack.Navigator>
  );
}