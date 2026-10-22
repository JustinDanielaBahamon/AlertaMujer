import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ActiveAlertScreen from "../features/activeAlert/view/ActiveAlertScreen";
import ContactAlertScreen from "../features/contactAlert/view/ContactAlertScreen";
import ActivacionScreen from "../features/activation/activation";
import AgregarContactoScreen from "../features/contacts/view/addContactScreen";
import DetalleAlertaScreen from "../features/history/view/alertDetail"; // ← nuevo
import HistorialMapa from "../features/history/view/history";
import ClasificarZonaScreen from "../features/map/view/classifyZoneView"; // Ajusta la ruta a tu archivo real// Ajusta la ruta a tu archivo real
import UbicacionesGuardadasScreen from "../features/map/view/SavedLocations";
import ZonasAuxiliaresScreen from "../features/map/view/HelpZones";
import HistorialRecorridosScreen from "../features/map/view/RouteHistory";
import GuardarRecorridoScreen from "../features/map/view/SaveRoute";
import ProfileScreen from "../features/profile/view/profileScreen";
import AboutScreen from "../features/settings/view/aboutScreen";
import ActivationMethodsScreen from "../features/settings/view/activationMethodsScreen";
import ReceivedAlertsScreen from "../features/receivedAlerts/view/ReceivedAlertsScreen";
import TripScreen from "../features/trip/view/TripScreen";
import PermissionsScreen from "../features/permissions/view/PermissionsScreen";
import NotificationsScreen from "../features/settings/view/notificationsScreen";
import DataRetentionScreen from "../features/settings/view/dataRetentionScreen";
import PrivacidadScreen from "../screens/policy/privacy";
import TerminosScreen from "../screens/policy/terms";
import BienvenidaTutorialScreen from "../screens/tutorial/welcome";
import BotonTutorialScreen from "../screens/tutorial/button";
import ContactoTutorialScreen from "../screens/tutorial/contact";
import MensajeTutorialScreen from "../screens/tutorial/message";
import NotificacionTutorialScreen from "../screens/tutorial/notification";
import SeguridadTutorialScreen from "../screens/tutorial/security";
import UbicacionTutorialScreen from "../screens/tutorial/location";
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
      <Stack.Screen name="Activation" component={ActivacionScreen} />
      {/* Sin gesto de volver: de la alerta activa solo se sale con "Estoy bien" */}
      <Stack.Screen name="ActiveAlert" component={ActiveAlertScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="ContactAlert" component={ContactAlertScreen} />
      <Stack.Screen name="ReceivedAlerts" component={ReceivedAlertsScreen} />
      <Stack.Screen name="Trip" component={TripScreen} />
      <Stack.Screen name="WelcomeTutorial" component={BienvenidaTutorialScreen} />
      <Stack.Screen name="ButtonTutorial" component={BotonTutorialScreen} />
      <Stack.Screen name="MessageTutorial" component={MensajeTutorialScreen} />
      <Stack.Screen name="LocationTutorial" component={UbicacionTutorialScreen} />
      <Stack.Screen name="ContactTutorial" component={ContactoTutorialScreen} />
      <Stack.Screen name="SecurityTutorial" component={SeguridadTutorialScreen} />
      <Stack.Screen name="NotificationTutorial" component={NotificacionTutorialScreen} />
      <Stack.Screen name="AddContact" component={AgregarContactoScreen} />
      <Stack.Screen name="AlertDetail" component={DetalleAlertaScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} /> 
      <Stack.Screen name="HistoryMap" component={HistorialMapa}/>
      <Stack.Screen name="ActivationMethods" component={ActivationMethodsScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="DataRetention" component={DataRetentionScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="TermsPolicy" component={TerminosScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacidadScreen} />
      <Stack.Screen name="ClassifyZone" component={ClasificarZonaScreen} />
      <Stack.Screen name="SavedLocations" component={UbicacionesGuardadasScreen} />
      <Stack.Screen name="HelpZones" component={ZonasAuxiliaresScreen} />
      <Stack.Screen name="RouteHistory" component={HistorialRecorridosScreen} />
      <Stack.Screen name="SaveRoute" component={GuardarRecorridoScreen} />
    </Stack.Navigator>
  );
}