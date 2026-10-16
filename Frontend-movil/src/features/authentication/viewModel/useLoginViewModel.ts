import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import { loginWithEmail, loginWithGoogleIdToken } from "../services/login.service";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

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

  // Google: se pide el ID token (identidad verificable) y se envía al backend.
  // Sin redirectUri manual: en el APK Expo usa el que Google espera para la app Android
  // (paquete com.alertamujer.app). El Client ID de Android debe tener registrado el SHA-1 de EAS.
  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "266164512214-a48icf7ct4140gor9pq64iq04ebvp4ta.apps.googleusercontent.com",
    androidClientId: "266164512214-u4jqsko28es0lns9ubpes0vrnr3hgjqv.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params?.id_token ?? response.authentication?.idToken;
      if (!idToken) {
        setErrorGeneral("Google no devolvió la identidad. Intenta de nuevo.");
        return;
      }
      setCargando(true);
      loginWithGoogleIdToken(idToken)
        .then(({ usuario, token, refreshToken }) => signIn(usuario, token, { refreshToken }))
        .catch((e: Error) => setErrorGeneral(e.message))
        .finally(() => setCargando(false));
    } else if (response?.type === "error") {
      setErrorGeneral("No se pudo iniciar sesión con Google. Intenta de nuevo.");
    }
  }, [response, signIn]);

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

    if (password.length < 8) {
      setErrorPassword("La contraseña debe tener al menos 8 caracteres");
      hayError = true;
    }

    if (hayError) return;

    setCargando(true);
    try {
      const { usuario, token, refreshToken } = await loginWithEmail(correo.trim(), password);
      signIn(usuario, token, { refreshToken });
    } catch (e: any) {
      const msg = e?.message ?? "";
      if (
        msg.includes("user-not-found") ||
        msg.includes("no encontrado")  ||
        msg.includes("invalid-credential") ||
        msg.includes("EMAIL_NOT_FOUND") ||
        msg.includes("Invalid credentials")
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