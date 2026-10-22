import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import CompleteSignUpScreen from "../features/completarRegistro/CompletarRegistroScreen";
import { profileIncomplete } from "../features/completarRegistro/perfilIncompleto";
import { getMe } from "../services/users.service";
import { useAuth } from "../contexts/AuthContext";
import type { MainStackParamList } from "./types";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { useSosAlerts } from "../notifications/useAlertasSos";
import { useShakeProtection } from "../features/agitar/useProteccionAgitar";
import { useProtectionReminder } from "../features/permisos/useRecordatorioProteccion";
import { useResumeAlert } from "../features/AlertaActiva/useReanudarAlerta";
import { useSosLink } from "../features/widget/useEnlaceSOS";

export default function AppNavigator() {
  const { user, pendingMainRoute, restoring } = useAuth();
  const mainEntryRef = useRef<keyof MainStackParamList | null>(null);
  const navigation = useNavigationContainerRef<MainStackParamList>();
  // Alarma de emergencia cuando una persona que tiene a esta usuaria como contacto activa una alerta
  useSosAlerts(navigation, !!user && !restoring);
  // Activación de la alerta al agitar el teléfono (si la usuaria la encendió en Ajustes)
  useShakeProtection(navigation, !!user && !restoring && user.id !== 0);
  // Aviso si falta algo para que las alertas funcionen (agitar apagado, permisos...)
  useProtectionReminder(navigation, !!user && !restoring && user.id !== 0);
  // Si hay una alerta propia activa (la app se cerró con la alerta en curso), se vuelve a ella
  useResumeAlert(navigation, !!user && !restoring && user.id !== 0);
  // Toque en el widget "SOS" de la pantalla de inicio (abre alertamujer://sos)
  useSosLink(navigation, !!user && !restoring && user.id !== 0);

  // Cuentas creadas con Google: faltan teléfono, documento y fecha de nacimiento. Si la consulta
  // falla (sin señal) no se bloquea la app: se vuelve a revisar en la próxima apertura.
  const [missingData, setMissingData] = useState(false);
  const realSession = !!user && !restoring && user.id !== 0 && user.role_id !== 2;
  useEffect(() => {
    if (!realSession) {
      setMissingData(false);
      return;
    }
    let valid = true;
    getMe()
      .then((u) => valid && setMissingData(profileIncomplete(u)))
      .catch(() => {});
    return () => {
      valid = false;
    };
  }, [realSession, user?.correo]);

  if (user && mainEntryRef.current === null) {
    mainEntryRef.current = pendingMainRoute ?? "DrawerHome";
  }
  if (!user) {
    mainEntryRef.current = null;
  }

  // Evitar parpadeo de la pantalla de login mientras se restaura la sesión
  if (restoring) {
    return null;
  }

  return (
    <NavigationContainer ref={navigation}>
      {user && missingData ? (
        <CompleteSignUpScreen onDone={() => setMissingData(false)} />
      ) : user ? (
        <MainNavigator
          key={user.correo}
          initialRouteName={mainEntryRef.current ?? "DrawerHome"}
        />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
