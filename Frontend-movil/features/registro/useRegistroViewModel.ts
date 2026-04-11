import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../src/navigation/types";
import { useAuth } from "../../src/contexts/AuthContext";

type ErroresType = {
  correo?: string;
  password?: string;
  confirmPassword?: string;
};

type RegistroNavigation = NativeStackNavigationProp<AuthStackParamList, "Registro">;

export function useRegistroViewModel() {
  const navigation = useNavigation<RegistroNavigation>();
  const { signIn } = useAuth();

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState("");

  const [documento, setDocumento] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  const [leyoTerminos, setLeyoTerminos] = useState(false);
  const [leyoPrivacidad, setLeyoPrivacidad] = useState(false);
  const [errorTerminos, setErrorTerminos] = useState("");

  const [errores, setErrores] = useState<ErroresType>({});

  const validarFormulario = useCallback(() => {
    const nuevosErrores: ErroresType = {};

    if (!correo) {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!correo.includes("@")) {
      nuevosErrores.correo = "Correo inválido";
    }

    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      nuevosErrores.password = "Mínimo 6 caracteres";
    }

    if (password !== confirmPassword) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }, [correo, password, confirmPassword]);

  const irATerminos = useCallback(() => {
    setErrorTerminos("");
    setLeyoTerminos(true);
    navigation.navigate("PoliticaTerminos");
  }, [navigation]);

  const irAPrivacidad = useCallback(() => {
    setErrorTerminos("");
    setLeyoPrivacidad(true);
    navigation.navigate("PoliticaPrivacidad");
  }, [navigation]);

  const toggleAceptaTerminos = useCallback(() => {
    if (!leyoTerminos) {
      setErrorTerminos("Debes leer los términos primero");
      return;
    }
    setErrorTerminos("");
    setAceptaTerminos((v) => !v);
  }, [leyoTerminos]);

  const toggleAceptaPrivacidad = useCallback(() => {
    if (!leyoPrivacidad) {
      setErrorTerminos("Debes leer la política primero");
      return;
    }
    setErrorTerminos("");
    setAceptaPrivacidad((v) => !v);
  }, [leyoPrivacidad]);

  const toggleListaTipoDocumento = useCallback(() => {
    setMostrarLista((v) => !v);
  }, []);

  const toggleMostrarPassword = useCallback(() => {
    setMostrarPassword((v) => !v);
  }, []);

  const toggleMostrarConfirmPassword = useCallback(() => {
    setMostrarConfirmPassword((v) => !v);
  }, []);

  const seleccionarTipoDocumento = useCallback((tipo: string) => {
    setTipoDocumento(tipo);
    setMostrarLista(false);
  }, []);

  const registrarYContinuar = useCallback(() => {
    if (!aceptaTerminos || !aceptaPrivacidad) {
      setErrorTerminos("Debes aceptar términos y privacidad");
      return;
    }

    if (!validarFormulario()) return;

    signIn(
      {
        id: Date.now(),
        nombre: documento.trim() || "Usuario",
        correo: correo.trim(),
      },
      { initialMainRoute: "TutorialBienvenida" },
    );
  }, [
    aceptaTerminos,
    aceptaPrivacidad,
    validarFormulario,
    documento,
    correo,
    signIn,
  ]);

  return {
    mostrarPassword,
    setMostrarPassword,
    mostrarLista,
    setMostrarLista,
    tipoDocumento,
    documento,
    setDocumento,
    correo,
    setCorreo,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    mostrarConfirmPassword,
    setMostrarConfirmPassword,
    fechaNacimiento,
    setFechaNacimiento,
    aceptaTerminos,
    aceptaPrivacidad,
    errorTerminos,
    errores,
    irATerminos,
    irAPrivacidad,
    toggleAceptaTerminos,
    toggleAceptaPrivacidad,
    seleccionarTipoDocumento,
    toggleListaTipoDocumento,
    toggleMostrarPassword,
    toggleMostrarConfirmPassword,
    registrarYContinuar,
  };
}
