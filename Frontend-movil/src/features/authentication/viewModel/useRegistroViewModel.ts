// features/registro/useRegistroViewModel.ts
import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import { authService } from "../../../services/auth.service";
import type { User } from "../models/Usuario";

type ErrorsType = {
  name?: string;
  phoneNumber?: string;
  document?: string;
  documentType?: string;
  birthDate?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type SignUpNavigation = NativeStackNavigationProp<AuthStackParamList, "SignUp">;

export function useSignUpViewModel() {
  const navigation = useNavigation<SignUpNavigation>();
  const { signIn } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showList, setShowList] = useState(false);
  const [documentType, setDocumentType] = useState("");

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [birthDate, setBirthDateRaw] = useState("");

  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [acceptsPrivacy, setAcceptsPrivacy] = useState(false);

  const [readTerms, setReadTerms] = useState(false);
  const [readPrivacy, setReadPrivacy] = useState(false);
  const [termsError, setTermsError] = useState("");

  const [errors, setErrors] = useState<ErrorsType>({});

  // ── Formato automático DD/MM/AAAA ─────────────────────────────────────────
  const setBirthDate = useCallback((text: string) => {
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
    setBirthDateRaw(formatted);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: ErrorsType = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "El teléfono es obligatorio";
    }

    if (!document.trim()) {
      newErrors.document = "El número de documento es obligatorio";
    }

    if (!documentType) {
      newErrors.documentType = "El tipo de documento es obligatorio";
    }

    if (!birthDate.trim()) {
      newErrors.birthDate = "La fecha de nacimiento es obligatoria";
    } else if (birthDate.length < 10) {
      newErrors.birthDate = "Ingresa una fecha completa DD/MM/AAAA";
    }

    if (!email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!email.includes("@")) {
      newErrors.email = "Correo inválido";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, phoneNumber, document, documentType, birthDate, email, password, confirmPassword]);

  const goToTerms = useCallback(() => {
    setTermsError("");
    setReadTerms(true);
    navigation.navigate("TermsPolicy");
  }, [navigation]);

  const goToPrivacy = useCallback(() => {
    setTermsError("");
    setReadPrivacy(true);
    navigation.navigate("PrivacyPolicy");
  }, [navigation]);

  const toggleAcceptsTerms = useCallback(() => {
    if (!readTerms) {
      setTermsError("Debes leer los términos primero");
      return;
    }
    setTermsError("");
    setAcceptsTerms((v) => !v);
  }, [readTerms]);

  const toggleAcceptsPrivacy = useCallback(() => {
    if (!readPrivacy) {
      setTermsError("Debes leer la política primero");
      return;
    }
    setTermsError("");
    setAcceptsPrivacy((v) => !v);
  }, [readPrivacy]);

  const toggleDocumentTypeList = useCallback(() => {
    setShowList((v) => !v);
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((v) => !v);
  }, []);

  const selectDocumentType = useCallback((type: string) => {
    setDocumentType(type);
    setShowList(false);
  }, []);

  const registerAndContinue = useCallback(async () => {
    if (!acceptsTerms || !acceptsPrivacy) {
      setTermsError("Debes aceptar términos y privacidad");
      return;
    }

    if (!validateForm()) return;

    try {
      const response = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password: password,
        phoneNumber: phoneNumber,
        documentType: documentType,
        documentNumber: document.trim(),
        birthDate: birthDate,
        municipality: "Neiva",
        acceptsTerms: acceptsTerms && acceptsPrivacy,
      });

      if ('error' in response) {
        // Datos que ya usa otra cuenta: el aviso va debajo de cada campo
        if (response.campos) {
          setErrors({
            email: response.campos.email,
            phoneNumber: response.campos.telefono,
            document: response.campos.numeroDocumento,
          });
          return;
        }
        setTermsError(response.error);
        return;
      }

      // Adaptar la respuesta del backend al modelo Usuario del móvil
      const backendUser = response.user;
      const user: User = {
        id: backendUser.id,
        nombre: `${backendUser.firstName} ${backendUser.lastName}`,
        correo: backendUser.email,
        email: backendUser.email,
        telefono: backendUser.telephone,
        rol: backendUser.roleId === 2 ? 'Admin' : 'Usuaria',
        estado: 'Activa',
        role_id: backendUser.roleId,
        first_name: backendUser.firstName,
        last_name: backendUser.lastName,
      };

      signIn(user, response.token, { initialMainRoute: "WelcomeTutorial", refreshToken: response.refreshToken });
    } catch (error) {
      setTermsError("Error al registrar. Intenta nuevamente.");
    }
  }, [
    acceptsTerms,
    acceptsPrivacy,
    validateForm,
    name,
    email,
    password,
    phoneNumber,
    documentType,
    document,
    birthDate,
    signIn,
  ]);

  return {
    name: name,
    setName: setName,
    phoneNumber: phoneNumber,
    setPhoneNumber: setPhoneNumber,
    showPassword: showPassword,
    setShowPassword: setShowPassword,
    showList: showList,
    setShowList: setShowList,
    documentType: documentType,
    document: document,
    setDocument: setDocument,
    email: email,
    setEmail: setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showConfirmPassword: showConfirmPassword,
    setShowConfirmPassword: setShowConfirmPassword,
    birthDate: birthDate,
    setBirthDate: setBirthDate,
    acceptsTerms: acceptsTerms,
    acceptsPrivacy: acceptsPrivacy,
    termsError: termsError,
    errors: errors,
    goToTerms: goToTerms,
    goToPrivacy: goToPrivacy,
    toggleAcceptsTerms: toggleAcceptsTerms,
    toggleAcceptsPrivacy: toggleAcceptsPrivacy,
    selectDocumentType: selectDocumentType,
    toggleDocumentTypeList: toggleDocumentTypeList,
    toggleShowPassword: toggleShowPassword,
    toggleShowConfirmPassword: toggleShowConfirmPassword,
    registerAndContinue: registerAndContinue,
  };
}