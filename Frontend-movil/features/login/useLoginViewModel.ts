import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../src/navigation/types";

type LoginNavigation = NativeStackNavigationProp<RootStackParamList, "Login">;

export function useLoginViewModel() {
  const navigation = useNavigation<LoginNavigation>();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const toggleMostrarPassword = useCallback(() => {
    setMostrarPassword((v) => !v);
  }, []);

  const irARecuperarContrasena = useCallback(() => {
    navigation.navigate("RecuperarContrasena");
  }, [navigation]);

  const irARegistro = useCallback(() => {
    navigation.navigate("Registro");
  }, [navigation]);

  const iniciarSesion = useCallback(() => {
    // Aquí irá la llamada al servicio de auth (Model); por ahora solo navega.
    navigation.replace("DrawerHome");
  }, [navigation]);

  const continuarConGoogle = useCallback(() => {
    // Placeholder: integrar OAuth cuando exista endpoint.
  }, []);

  return {
    correo,
    setCorreo,
    password,
    setPassword,
    mostrarPassword,
    toggleMostrarPassword,
    irARecuperarContrasena,
    irARegistro,
    iniciarSesion,
    continuarConGoogle,
  };
}
