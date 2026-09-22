import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import AlertaActivaScreen from "../features/AlertaActiva/view/AlertaActivaScreen";
import ActivacionScreen from "../features/BotonActivacion/activacion";
import AgregarContactoScreen from "../features/contactos/view/agregarScreen";
import DetalleAlertaScreen from "../features/historial/view/detallesAlerta"; // ← nuevo
import HistorialMapa from "../features/historial/view/historial";
import ClasificarZonaScreen from "../features/mapa/view/classifyZoneView"; // Ajusta la ruta a tu archivo real// Ajusta la ruta a tu archivo real
import UbicacionesGuardadasScreen from "../features/mapa/view/UbicacionesGuardadas";
import ZonasAuxiliaresScreen from "../features/mapa/view/ZonasAuxiliares";
import HistorialRecorridosScreen from "../features/mapa/view/HistorialRecorridos";
import GuardarRecorridoScreen from "../features/mapa/view/GuardarRecorrido";
import PerfilScreen from "../features/perfil/view/perfilScreen";
import MetodosActivacionScreen from "../features/settings/view/metodosActivacionScreen";
import BienvenidaTutorialScreen from "../screens/tutorial/bienvenida";
import BotonTutorialScreen from "../screens/tutorial/boton";
import ContactoTutorialScreen from "../screens/tutorial/contacto";
import MensajeTutorialScreen from "../screens/tutorial/mensaje";
import NotificacionTutorialScreen from "../screens/tutorial/notificacion";
import SeguridadTutorialScreen from "../screens/tutorial/seguridad";
import UbicacionTutorialScreen from "../screens/tutorial/ubicacion";
import DrawerNavigator from "./drawer/DrawerNavigator";
import type { MainStackParamList } from "./types";

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
      <Stack.Screen name="AlertaActiva" component={AlertaActivaScreen} />
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
      <Stack.Screen name="ClasificarZona" component={ClasificarZonaScreen} />
      <Stack.Screen name="UbicacionesGuardadas" component={UbicacionesGuardadasScreen} />
      <Stack.Screen name="ZonasAuxiliares" component={ZonasAuxiliaresScreen} />
      <Stack.Screen name="HistorialRecorridos" component={HistorialRecorridosScreen} />
      <Stack.Screen name="GuardarRecorrido" component={GuardarRecorridoScreen} />
    </Stack.Navigator>
  );
}