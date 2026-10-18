import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { MainStackParamList } from "./types";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { useAlertasSos } from "../notifications/useAlertasSos";
import { useProteccionAgitar } from "../features/agitar/useProteccionAgitar";
import { useRecordatorioProteccion } from "../features/permisos/useRecordatorioProteccion";
import { useReanudarAlerta } from "../features/AlertaActiva/useReanudarAlerta";

export default function AppNavigator() {
  const { user, pendingMainRoute, restoring } = useAuth();
  const mainEntryRef = useRef<keyof MainStackParamList | null>(null);
  const navegacion = useNavigationContainerRef<MainStackParamList>();
  // Alarma de emergencia cuando una persona que tiene a esta usuaria como contacto activa una alerta
  useAlertasSos(navegacion, !!user && !restoring);
  // Activación de la alerta al agitar el teléfono (si la usuaria la encendió en Ajustes)
  useProteccionAgitar(navegacion, !!user && !restoring && user.id !== 0);
  // Aviso si falta algo para que las alertas funcionen (agitar apagado, permisos...)
  useRecordatorioProteccion(navegacion, !!user && !restoring && user.id !== 0);
  // Si hay una alerta propia activa (la app se cerró con la alerta en curso), se vuelve a ella
  useReanudarAlerta(navegacion, !!user && !restoring && user.id !== 0);

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
    <NavigationContainer ref={navegacion}>
      {user ? (
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
