import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/types";
import type { AlertType } from "../../../components/ui/modalAlerta/modalAlerta";
import { authService } from "../../../services/auth.service";

type Nav = NativeStackNavigationProp<AuthStackParamList, "RecuperarContrasena">;

// El código que envía el backend tiene 6 dígitos y vence a los 15 minutos;
// se puede pedir otro pasado 1 minuto (el backend no acepta más seguido).
export const CODE_DIGITS = 6;
const CODE_TIME = 15 * 60;
const RESEND_WAIT = 60;
const emptyCode = () => Array<string>(CODE_DIGITS).fill('');

/** Mensaje entendible a partir del error de la API. */
function errorMessage(e: any, byDefault: string): string {
  if (e?.response?.status === 429) return 'Hiciste muchos intentos. Espera un minuto e inténtalo de nuevo.';
  if (!e?.response) return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
  return e.response.data?.message ?? byDefault;
}

// Estado del mensaje (modal) que se muestra en pantalla
type AlertState = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttonTextValue: string;
  onClose?: () => void;
};

export function useRecoverPasswordViewModel() {
  const navigation = useNavigation<Nav>();

  // Estados para el paso 1 (Email)
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Código, 3: Nueva contraseña

  // Estados para el paso 2 (Código)
  const [code, setCode] = useState<string[]>(emptyCode());
  const [seconds, setSeconds] = useState(CODE_TIME);
  const [resendWait, setResendWait] = useState(RESEND_WAIT);
  const codeEnd = useRef(0); // momento exacto en que vence el código
  const codeStart = useRef(0);
  const verifying = useRef(false);

  // Estados para el paso 3 (Nueva contraseña)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Mensaje bonito (modal) en vez del Alert genérico
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
    buttonTextValue: 'Entendido',
  });

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    buttonTextValue: string = 'Entendido',
    onClose?: () => void
  ) => {
    setAlert({ visible: true, type, title, message, buttonTextValue, onClose });
  };

  const closeAlert = () => {
    const action = alert.onClose;
    setAlert((a) => ({ ...a, visible: false, onClose: undefined }));
    action?.();
  };

  // Arranca (o reinicia) el contador de vencimiento y la espera para reenviar
  const startTimer = () => {
    codeStart.current = Date.now();
    codeEnd.current = Date.now() + CODE_TIME * 1000;
    setSeconds(CODE_TIME);
    setResendWait(RESEND_WAIT);
  };

  // Cuenta regresiva: solo corre mientras estamos en el paso 2
  useEffect(() => {
    if (step !== 2) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((codeEnd.current - Date.now()) / 1000));
      setSeconds(remaining);
      setResendWait(Math.max(0, RESEND_WAIT - Math.floor((Date.now() - codeStart.current) / 1000)));
    }, 500);
    return () => clearInterval(id);
  }, [step]);

  const expiredItem = step === 2 && seconds === 0;
  const formattedDuration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const canResend = resendWait === 0;

  const sendLink = async () => {
    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      showAlert(
        'error',
        'Correo no válido',
        'Revisa que tu correo esté bien escrito, por ejemplo: nombre@correo.com'
      );
      return;
    }
    setIsLoading(true);
    try {
      await authService.requestRecoveryCode(cleanEmail);
      setCode(emptyCode());
      startTimer();
      setStep(2);
    } catch (e) {
      showAlert('error', 'No se pudo enviar el código', errorMessage(e, 'Inténtalo de nuevo en un momento.'));
    } finally {
      setIsLoading(false);
    }
  };

  const checkCode = async (digits: string) => {
    if (verifying.current) return;
    verifying.current = true;
    setIsLoading(true);
    try {
      await authService.verifyRecoveryCode(email.trim(), digits);
      setStep(3);
    } catch (e) {
      setCode(emptyCode());
      showAlert('error', 'Código no válido', errorMessage(e, 'El código no es válido o ya venció. Pide uno nuevo.'));
    } finally {
      verifying.current = false;
      setIsLoading(false);
    }
  };

  /** Escribe en una casilla; si llegan varios dígitos (pegar o autocompletar) se reparten. */
  const handleCodeChange = (text: string, index: number): number => {
    if (expiredItem) return index;
    const digits = text.replace(/\D/g, '');
    const newCode = [...code];
    let lastItem = index;
    if (digits.length <= 1) {
      newCode[index] = digits;
    } else {
      digits.slice(0, CODE_DIGITS - index).split('').forEach((d, i) => {
        newCode[index + i] = d;
        lastItem = index + i;
      });
    }
    setCode(newCode);
    // Al completar los 6 dígitos se comprueba solo
    if (newCode.every((d) => d !== '')) checkCode(newCode.join(''));
    return lastItem;
  };

  // Botón "Confirmar Código" (por si el avance automático no se disparó)
  const verifyCode = () => {
    if (expiredItem) {
      showAlert(
        'aviso',
        'Código vencido',
        'Se acabó el tiempo. Solicita un nuevo código para continuar.'
      );
      return;
    }
    if (code.join('').length < CODE_DIGITS) {
      showAlert(
        'aviso',
        'Código incompleto',
        'Escribe los 6 dígitos del código que te enviamos.'
      );
      return;
    }
    checkCode(code.join(''));
  };

  // "Solicitar un nuevo código": pide otro al backend (el anterior deja de servir)
  const resendCode = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      await authService.requestRecoveryCode(email.trim());
      setCode(emptyCode());
      startTimer();
      showAlert('exito', 'Código enviado', 'Te enviamos un código nuevo. El anterior ya no sirve.');
    } catch (e) {
      showAlert('error', 'No se pudo reenviar', errorMessage(e, 'Inténtalo de nuevo en un momento.'));
    } finally {
      setIsLoading(false);
    }
  };

  const saveNewPassword = () => {
    if (newPassword.length < 8) {
      showAlert(
        'error',
        'Contraseña muy corta',
        'Usa mínimo 8 caracteres para proteger tu cuenta.'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert(
        'error',
        'Las contraseñas no coinciden',
        'Escribe la misma contraseña en los dos campos.'
      );
      return;
    }
    setIsLoading(true);
    authService
      .resetPassword(email.trim(), code.join(''), newPassword)
      .then(() =>
        showAlert(
          'exito',
          '¡Contraseña actualizada!',
          'Ya puedes iniciar sesión con tu nueva contraseña.',
          'Iniciar sesión',
          () => navigation.reset({ index: 0, routes: [{ name: "Login" }] })
        )
      )
      .catch((e) =>
        showAlert('error', 'No se pudo guardar', errorMessage(e, 'El código ya no es válido. Pide uno nuevo.'))
      )
      .finally(() => setIsLoading(false));
  };

  return {
    email,
    setEmail,
    isLoading,
    step: step,
    setStep: setStep,
    code: code,
    sendLink: sendLink,
    handleCodeChange: handleCodeChange,
    verifyCode: verifyCode,
    // temporizador
    expiredItem: expiredItem,
    formattedDuration: formattedDuration,
    resendCode: resendCode,
    canResend: canResend,
    resendWait: resendWait,
    // paso 3
    newPassword: newPassword,
    setNewPassword: setNewPassword,
    confirmPassword: confirmPassword,
    setConfirmPassword: setConfirmPassword,
    showNew: showNew,
    toggleShowNew: () => setShowNew((v) => !v),
    showConfirm: showConfirm,
    toggleShowConfirm: () => setShowConfirm((v) => !v),
    saveNewPassword: saveNewPassword,
    // mensajes (modal)
    alert: alert,
    closeAlert: closeAlert,
    cancel: () => navigation.goBack()
  };
}