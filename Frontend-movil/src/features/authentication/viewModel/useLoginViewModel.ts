import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import { loginWithEmail, loginWithGoogleIdToken } from "../services/login.service";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// Inicio de sesión nativo de Google (Credential Manager de Android): sin navegador ni redirección.
// webClientId es el cliente web del proyecto: el ID token sale con ese "aud", que el backend acepta.
// Google solo responde si el SHA-1 del APK está registrado en Firebase (app Android
// com.alertamujer.app); si no, devuelve DEVELOPER_ERROR.
GoogleSignin.configure({
  webClientId: "266164512214-a48icf7ct4140gor9pq64iq04ebvp4ta.apps.googleusercontent.com",
});

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

  // Google: se pide el ID token (identidad verificable) y se envía al backend.
  const continuarConGoogle = useCallback(async () => {
    limpiarErrores();
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const respuesta = await GoogleSignin.signIn();
      if (!isSuccessResponse(respuesta)) return; // la usuaria cerró la ventana de Google
      const idToken = respuesta.data.idToken;
      if (!idToken) {
        setErrorGeneral("Google no devolvió la identidad. Intenta de nuevo.");
        return;
      }
      setCargando(true);
      const { usuario, token, refreshToken } = await loginWithGoogleIdToken(idToken);
      signIn(usuario, token, { refreshToken });
    } catch (e: unknown) {
      if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) return;
      if (isErrorWithCode(e) && e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorGeneral("Este teléfono no tiene Google Play Services actualizado.");
      } else if (e instanceof Error && !isErrorWithCode(e)) {
        setErrorGeneral(e.message); // errores del backend (cuenta bloqueada, etc.)
      } else {
        console.warn("Google Sign-In falló:", isErrorWithCode(e) ? e.code : e);
        setErrorGeneral("No se pudo iniciar sesión con Google. Intenta de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  }, [signIn]);

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