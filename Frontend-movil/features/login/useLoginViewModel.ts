import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../src/navigation/types";
import { useAuth } from "../../src/contexts/AuthContext";
import { loginWithEmail } from "./login.service";

type LoginNavigation = NativeStackNavigationProp<AuthStackParamList, "Login">;

export function useLoginViewModel() {
  const navigation = useNavigation<LoginNavigation>();
  const { signIn } = useAuth();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const toggleMostrarPassword = useCallback(() => {
    setMostrarPassword((v) => !v);
  }, []);

  const irARecuperarContrasena = useCallback(() => {
    navigation.navigate("RecuperarContrasena");
  }, [navigation]);

  const irARegistro = useCallback(() => {
    navigation.navigate("Registro");
  }, [navigation]);

  const iniciarSesion = useCallback(async () => {
    setCargando(true);
    try {
      const user = await loginWithEmail(correo.trim(), password);
      signIn(user);
    } finally {
      setCargando(false);
    }
  }, [correo, password, signIn]);

  const continuarConGoogle = useCallback(() => {
    // Placeholder: OAuth + signIn(user) cuando exista endpoint.
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
    cargando,
  };
}
