// features/registro/useRegistroViewModel.ts
import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";

type ErroresType = {
  nombre?: string;
  telefono?: string;
  documento?: string;
  tipoDocumento?: string;
  fechaNacimiento?: string;
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

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [documento, setDocumento] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [fechaNacimiento, setFechaNacimientoRaw] = useState("");

  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  const [leyoTerminos, setLeyoTerminos] = useState(false);
  const [leyoPrivacidad, setLeyoPrivacidad] = useState(false);
  const [errorTerminos, setErrorTerminos] = useState("");

  const [errores, setErrores] = useState<ErroresType>({});

  // ── Formato automático DD/MM/AAAA ─────────────────────────────────────────
  const setFechaNacimiento = useCallback((text: string) => {
    // Solo dígitos
    const digits = text.replace(/\D/g, "");
    let formatted = "";
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    } else {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4, 8);
    }
    setFechaNacimientoRaw(formatted);
  }, []);

  const validarFormulario = useCallback(() => {
    const nuevosErrores: ErroresType = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    }

    if (!documento.trim()) {
      nuevosErrores.documento = "El número de documento es obligatorio";
    }

    if (!tipoDocumento) {
      nuevosErrores.tipoDocumento = "El tipo de documento es obligatorio";
    }

    if (!fechaNacimiento.trim()) {
      nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    } else if (fechaNacimiento.length < 10) {
      nuevosErrores.fechaNacimiento = "Ingresa una fecha completa DD/MM/AAAA";
    }

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
  }, [nombre, telefono, documento, tipoDocumento, fechaNacimiento, correo, password, confirmPassword]);

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
        nombre: nombre.trim() || "Usuario",
        correo: correo.trim(),
      },
      { initialMainRoute: "TutorialBienvenida" },
    );
  }, [
    aceptaTerminos,
    aceptaPrivacidad,
    validarFormulario,
    nombre,
    correo,
    signIn,
  ]);

  return {
    nombre,
    setNombre,
    telefono,
    setTelefono,
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