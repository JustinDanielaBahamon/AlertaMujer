import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import { loginWithEmail } from "../services/login.service";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

type LoginNavigation = NativeStackNavigationProp<AuthStackParamList, "Login">;

export function useLoginViewModel() {
  const navigation = useNavigation<LoginNavigation>();
  const { signIn } = useAuth();

  const [correo, setCorreo]                   = useState("");
  const [password, setPassword]               = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando]               = useState(false);

  const [errorCorreo, setErrorCorreo]     = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorGeneral, setErrorGeneral]   = useState("");

  // Google OAuth con redirectUri correcto
   const [, response, promptAsync] = Google.useAuthRequest({
  clientId:        "266164512214-a48icf7ct4140gor9pq64iq04ebvp4ta.apps.googleusercontent.com",
  androidClientId: "266164512214-u4jqsko28es0lns9ubpes0vrnr3hgjqv.apps.googleusercontent.com",
  redirectUri: makeRedirectUri({
    scheme: "frontedmovil",
    native: "frontedmovil://",
  }),
});

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;
      if (token) {
        console.log("Token Google:", token);
        // signInWithGoogleToken(token) cuando tengas el endpoint
      }
    } else if (response?.type === "error") {
      setErrorGeneral("No se pudo iniciar sesión con Google. Intenta de nuevo.");
    }
  }, [response]);

  const toggleMostrarPassword = useCallback(() => {
    setMostrarPassword((v) => !v);
  }, []);

  const irARecuperarContrasena = useCallback(() => {
    navigation.navigate("RecuperarContrasena");
  }, [navigation]);

  const irARegistro = useCallback(() => {
    navigation.navigate("Registro");
  }, [navigation]);

  const limpiarErrores = () => {
    setErrorCorreo("");
    setErrorPassword("");
    setErrorGeneral("");
  };

  const iniciarSesion = useCallback(async () => {
    limpiarErrores();
    let hayError = false;

    if (!correo.trim()) {
      setErrorCorreo("Ingresa tu correo");
      hayError = true;
    } else {
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
      if (!emailValido) {
        setErrorCorreo("El correo no tiene un formato válido");
        hayError = true;
      }
    }

    if (password.length < 6) {
      setErrorPassword("La contraseña debe tener al menos 6 caracteres");
      hayError = true;
    }

    if (hayError) return;

    setCargando(true);
    try {
      const user = await loginWithEmail(correo.trim(), password);
      signIn(user);
    } catch (e: any) {
      const msg = e?.message ?? "";
      if (
        msg.includes("user-not-found") ||
        msg.includes("no encontrado")  ||
        msg.includes("invalid-credential") ||
        msg.includes("EMAIL_NOT_FOUND")
      ) {
        setErrorCorreo("Este correo no está registrado.");
        setErrorGeneral("¿Eres nueva? Regístrate para continuar.");
        setTimeout(() => navigation.navigate("Registro"), 2000);
      } else {
        setErrorGeneral("Correo o contraseña incorrectos");
      }
    } finally {
      setCargando(false);
    }
  }, [correo, password, signIn, navigation]);

  const continuarConGoogle = useCallback(() => {
    limpiarErrores();
    void promptAsync();
  }, [promptAsync]);

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
    errorCorreo,
    errorPassword,
    errorGeneral,
  };
}