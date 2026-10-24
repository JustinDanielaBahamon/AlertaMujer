// features/authentication/viewModel/useSignUpViewModel.ts
import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import { authService } from "../../../services/auth.service";
import type { User } from "../models/User";
import { dateToIso, formatDateText } from "../../completeSignUp/profileIncomplete";
import {
  digitsOnly,
  documentFilter,
  isValidCellphone,
  isValidDocument,
  isValidEmail,
  isValidName,
  isValidPassword,
  lettersOnly,
} from "../../../utils/validators";

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

  const [name, setNameRaw] = useState("");
  const [phoneNumber, setPhoneRaw] = useState("");
  const [document, setDocumentRaw] = useState("");
  const [email, setEmailRaw] = useState("");
  // Each field filters what is typed: letters in the name, 10 digits in the phone, no spaces in the email
  const setName = useCallback((v: string) => setNameRaw(lettersOnly(v)), []);
  const setPhoneNumber = useCallback((v: string) => setPhoneRaw(digitsOnly(v, 10)), []);
  const setEmail = useCallback((v: string) => setEmailRaw(v.replace(/\s/g, "")), []);
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

  // ── Automatic DD/MM/YYYY format ──────────────────────────────────────────
  const setBirthDate = useCallback((text: string) => setBirthDateRaw(formatDateText(text)), []);
  // The document number accepts digits for C.C and T.I, letters and digits for a foreign document
  const setDocument = useCallback((v: string) => setDocumentRaw(documentFilter(documentType, v)), [documentType]);

  const validateForm = useCallback(() => {
    const newErrors: ErrorsType = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    } else if (!isValidName(name)) {
      newErrors.name = "Escribe tu nombre completo";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "El teléfono es obligatorio";
    } else if (!isValidCellphone(phoneNumber)) {
      newErrors.phoneNumber = "Escribe un celular de 10 dígitos que empiece por 3";
    }

    if (!documentType) {
      newErrors.documentType = "El tipo de documento es obligatorio";
    }

    if (!document.trim()) {
      newErrors.document = "El número de documento es obligatorio";
    } else if (documentType && !isValidDocument(documentType, document)) {
      newErrors.document =
        documentType === "Documento extranjero"
          ? "Escribe entre 5 y 15 letras o números"
          : "Escribe entre 6 y 10 números, sin puntos";
    }

    if (!birthDate.trim()) {
      newErrors.birthDate = "La fecha de nacimiento es obligatoria";
    } else if (!dateToIso(birthDate)) {
      newErrors.birthDate = "Escribe una fecha válida DD/MM/AAAA";
    }

    if (!email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Escribe un correo válido, por ejemplo nombre@correo.com";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (!isValidPassword(password)) {
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
    // What was typed is adapted to the new type (digits only for C.C and T.I)
    setDocumentRaw((current) => documentFilter(type, current));
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
        // Data already used by another account: the notice goes below each field
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

      // Adapt the backend response to the mobile User model
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