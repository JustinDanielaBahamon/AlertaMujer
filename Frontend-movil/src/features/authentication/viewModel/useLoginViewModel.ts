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

// Native Google sign-in (Android Credential Manager): no browser or redirect.
// webClientId is the web client (type 3) of the alerta-mujer-b4fae Firebase project, the same as the
// Android client in google-services.json: if they belong to different projects Google returns DEVELOPER_ERROR.
// The ID token comes with that "aud", which the backend accepts (google.client-ids).
// Google only responds if the APK SHA-1 is registered in Firebase (Android app
// com.alertamujer.app); otherwise it returns DEVELOPER_ERROR.
GoogleSignin.configure({
  webClientId: "656563018279-blo6edqva74tbsdce0mau3n6rv007fvi.apps.googleusercontent.com",
});

type LoginNavigation = NativeStackNavigationProp<AuthStackParamList, "Login">;

export function useLoginViewModel() {
  const navigation = useNavigation<LoginNavigation>();
  const { signIn } = useAuth();

  const [email, setEmail]                   = useState("");
  const [password, setPassword]               = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]               = useState(false);

  const [emailError, setEmailError]     = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [generalError, setGeneralError]   = useState("");

  const toggleShowPassword = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const goToRecoverPassword = useCallback(() => {
    navigation.navigate("RecoverPassword");
  }, [navigation]);

  const goToSignUp = useCallback(() => {
    navigation.navigate("SignUp");
  }, [navigation]);

  const clearErrors = () => {
    setEmailError("");
    setErrorPassword("");
    setGeneralError("");
  };

  const signInWithEmail = useCallback(async () => {
    clearErrors();
    let hayError = false;

    if (!email.trim()) {
      setEmailError("Ingresa tu correo");
      hayError = true;
    } else {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      if (!validEmail) {
        setEmailError("El correo no tiene un formato válido");
        hayError = true;
      }
    }

    if (password.length < 8) {
      setErrorPassword("La contraseña debe tener al menos 8 caracteres");
      hayError = true;
    }

    if (hayError) return;

    setLoading(true);
    try {
      const { user, token, refreshToken } = await loginWithEmail(email.trim(), password);
      signIn(user, token, { refreshToken });
    } catch (e: any) {
      const msg = e?.message ?? "";
      if (
        msg.includes("user-not-found") ||
        msg.includes("no encontrado")  ||
        msg.includes("invalid-credential") ||
        msg.includes("EMAIL_NOT_FOUND") ||
        msg.includes("Invalid credentials")
      ) {
        setEmailError("Este correo no está registrado.");
        setGeneralError("¿Eres nueva? Regístrate para continuar.");
        setTimeout(() => navigation.navigate("SignUp"), 2000);
      } else {
        setGeneralError("Correo o contraseña incorrectos");
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, signIn, navigation]);

  // Google: request the ID token (verifiable identity) and send it to the backend.
  const continueWithGoogle = useCallback(async () => {
    clearErrors();
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Google remembers the last account and signs in with it directly; after forgetting it, it always shows the
      // picker with every account on the phone (and the option to add another)
      await GoogleSignin.signOut().catch(() => {});
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return; // the user closed the Google window
      const idToken = response.data.idToken;
      if (!idToken) {
        setGeneralError("Google no devolvió la identidad. Intenta de nuevo.");
        return;
      }
      setLoading(true);
      const { user, token, refreshToken } = await loginWithGoogleIdToken(idToken);
      signIn(user, token, { refreshToken });
    } catch (e: unknown) {
      if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) return;
      if (isErrorWithCode(e) && e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setGeneralError("Este teléfono no tiene Google Play Services actualizado.");
      } else if (e instanceof Error && !isErrorWithCode(e)) {
        setGeneralError(e.message); // backend errors (account blocked, etc.)
      } else {
        console.warn("Google Sign-In falló:", isErrorWithCode(e) ? e.code : e);
        setGeneralError("No se pudo iniciar sesión con Google. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  return {
    email: email,
    setEmail: setEmail,
    password,
    setPassword,
    showPassword: showPassword,
    toggleShowPassword: toggleShowPassword,
    goToRecoverPassword: goToRecoverPassword,
    goToSignUp: goToSignUp,
    signIn: signInWithEmail,
    continueWithGoogle: continueWithGoogle,
    loading: loading,
    emailError: emailError,
    errorPassword,
    generalError: generalError,
  };
}