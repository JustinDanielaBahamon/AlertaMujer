import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/types";
import type { AlertaTipo } from "../../../components/ui/modalAlerta/modalAlerta";

type Nav = NativeStackNavigationProp<AuthStackParamList, "RecuperarContrasena">;

// Tiempo máximo para ingresar el código: 1:30 (90 segundos)
const TIEMPO_CODIGO = 90;

// Estado del mensaje (modal) que se muestra en pantalla
type AlertaState = {
  visible: boolean;
  tipo: AlertaTipo;
  titulo: string;
  mensaje: string;
  textoBoton: string;
  onCerrar?: () => void;
};

export function useRecuperarContrasenaViewModel() {
  const navigation = useNavigation<Nav>();

  // Estados para el paso 1 (Email)
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Email, 2: Código, 3: Nueva contraseña

  // Estados para el paso 2 (Código)
  const [codigo, setCodigo] = useState(['', '', '', '']);
  const [segundos, setSegundos] = useState(TIEMPO_CODIGO);
  const finCodigo = useRef(0); // momento exacto en que vence el código

  // Estados para el paso 3 (Nueva contraseña)
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Mensaje bonito (modal) en vez del Alert genérico
  const [alerta, setAlerta] = useState<AlertaState>({
    visible: false,
    tipo: 'error',
    titulo: '',
    mensaje: '',
    textoBoton: 'Entendido',
  });

  const mostrarAlerta = (
    tipo: AlertaTipo,
    titulo: string,
    mensaje: string,
    textoBoton: string = 'Entendido',
    onCerrar?: () => void
  ) => {
    setAlerta({ visible: true, tipo, titulo, mensaje, textoBoton, onCerrar });
  };

  const cerrarAlerta = () => {
    const accion = alerta.onCerrar;
    setAlerta((a) => ({ ...a, visible: false, onCerrar: undefined }));
    accion?.();
  };

  // Arranca (o reinicia) el contador de 1:30
  const iniciarTemporizador = () => {
    finCodigo.current = Date.now() + TIEMPO_CODIGO * 1000;
    setSegundos(TIEMPO_CODIGO);
  };

  // Cuenta regresiva: solo corre mientras estamos en el paso 2
  useEffect(() => {
    if (paso !== 2) return;
    const id = setInterval(() => {
      const restante = Math.max(0, Math.ceil((finCodigo.current - Date.now()) / 1000));
      setSegundos(restante);
    }, 500);
    return () => clearInterval(id);
  }, [paso]);

  const expirado = paso === 2 && segundos === 0;
  const tiempoFormateado = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;

  const enviarEnlace = async () => {
    if (!email.includes('@')) {
      mostrarAlerta(
        'error',
        'Correo no válido',
        'Revisa que tu correo esté bien escrito, por ejemplo: nombre@correo.com'
      );
      return;
    }
    setIsLoading(true);
    // Simulación de envío
    setTimeout(() => {
      setIsLoading(false);
      setCodigo(['', '', '', '']);
      iniciarTemporizador();
      setPaso(2); // Pasamos al paso del código
    }, 1500);
  };

  const handleCodigoChange = (text: string, index: number) => {
    if (expirado) return;
    const nuevoCodigo = [...codigo];
    nuevoCodigo[index] = text.replace(/\D/g, ''); // solo números
    setCodigo(nuevoCodigo);

    // TEMPORAL (sin backend): al completar los 4 dígitos pasa directo al paso 3
    if (nuevoCodigo.every((d) => d !== '')) {
      setPaso(3);
    }
  };

  // Botón "Confirmar Código" (por si el usuario no usa el avance automático)
  const verificarCodigo = () => {
    if (expirado) {
      mostrarAlerta(
        'aviso',
        'Código vencido',
        'Se acabó el tiempo. Solicita un nuevo código para continuar.'
      );
      return;
    }
    if (codigo.join('').length < 4) {
      mostrarAlerta(
        'aviso',
        'Código incompleto',
        'Escribe los 4 dígitos del código que te enviamos.'
      );
      return;
    }
    setPaso(3);
  };

  // "Solicitar un nuevo código": limpia los cuadros y reinicia el 1:30
  const reenviarCodigo = () => {
    setCodigo(['', '', '', '']);
    iniciarTemporizador();
  };

  const guardarNuevaContrasena = () => {
    if (nuevaPassword.length < 6) {
      mostrarAlerta(
        'error',
        'Contraseña muy corta',
        'Usa mínimo 6 caracteres para proteger tu cuenta.'
      );
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      mostrarAlerta(
        'error',
        'Las contraseñas no coinciden',
        'Escribe la misma contraseña en los dos campos.'
      );
      return;
    }
    setIsLoading(true);
    // Simulación de guardado (cuando haya backend, aquí va la llamada a la API)
    setTimeout(() => {
      setIsLoading(false);
      mostrarAlerta(
        'exito',
        '¡Contraseña actualizada!',
        'Ya puedes iniciar sesión con tu nueva contraseña.',
        'Iniciar sesión',
        () => navigation.reset({ index: 0, routes: [{ name: "Login" }] })
      );
    }, 1500);
  };

  return {
    email,
    setEmail,
    isLoading,
    paso,
    setPaso,
    codigo,
    enviarEnlace,
    handleCodigoChange,
    verificarCodigo,
    // temporizador
    expirado,
    tiempoFormateado,
    reenviarCodigo,
    // paso 3
    nuevaPassword,
    setNuevaPassword,
    confirmarPassword,
    setConfirmarPassword,
    mostrarNueva,
    toggleMostrarNueva: () => setMostrarNueva((v) => !v),
    mostrarConfirmar,
    toggleMostrarConfirmar: () => setMostrarConfirmar((v) => !v),
    guardarNuevaContrasena,
    // mensajes (modal)
    alerta,
    cerrarAlerta,
    cancelar: () => navigation.goBack()
  };
}