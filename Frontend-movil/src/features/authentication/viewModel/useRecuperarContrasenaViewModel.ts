import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/types";
import type { AlertaTipo } from "../../../components/ui/modalAlerta/modalAlerta";
import { authService } from "../../../services/auth.service";

type Nav = NativeStackNavigationProp<AuthStackParamList, "RecuperarContrasena">;

// El código que envía el backend tiene 6 dígitos y vence a los 15 minutos;
// se puede pedir otro pasado 1 minuto (el backend no acepta más seguido).
export const DIGITOS_CODIGO = 6;
const TIEMPO_CODIGO = 15 * 60;
const ESPERA_REENVIO = 60;
const codigoVacio = () => Array<string>(DIGITOS_CODIGO).fill('');

/** Mensaje entendible a partir del error de la API. */
function mensajeDeError(e: any, porDefecto: string): string {
  if (e?.response?.status === 429) return 'Hiciste muchos intentos. Espera un minuto e inténtalo de nuevo.';
  if (!e?.response) return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
  return e.response.data?.message ?? porDefecto;
}

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
  const [codigo, setCodigo] = useState<string[]>(codigoVacio());
  const [segundos, setSegundos] = useState(TIEMPO_CODIGO);
  const [esperaReenvio, setEsperaReenvio] = useState(ESPERA_REENVIO);
  const finCodigo = useRef(0); // momento exacto en que vence el código
  const inicioCodigo = useRef(0);
  const verificando = useRef(false);

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

  // Arranca (o reinicia) el contador de vencimiento y la espera para reenviar
  const iniciarTemporizador = () => {
    inicioCodigo.current = Date.now();
    finCodigo.current = Date.now() + TIEMPO_CODIGO * 1000;
    setSegundos(TIEMPO_CODIGO);
    setEsperaReenvio(ESPERA_REENVIO);
  };

  // Cuenta regresiva: solo corre mientras estamos en el paso 2
  useEffect(() => {
    if (paso !== 2) return;
    const id = setInterval(() => {
      const restante = Math.max(0, Math.ceil((finCodigo.current - Date.now()) / 1000));
      setSegundos(restante);
      setEsperaReenvio(Math.max(0, ESPERA_REENVIO - Math.floor((Date.now() - inicioCodigo.current) / 1000)));
    }, 500);
    return () => clearInterval(id);
  }, [paso]);

  const expirado = paso === 2 && segundos === 0;
  const tiempoFormateado = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
  const puedeReenviar = esperaReenvio === 0;

  const enviarEnlace = async () => {
    const correo = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      mostrarAlerta(
        'error',
        'Correo no válido',
        'Revisa que tu correo esté bien escrito, por ejemplo: nombre@correo.com'
      );
      return;
    }
    setIsLoading(true);
    try {
      await authService.pedirCodigoRecuperacion(correo);
      setCodigo(codigoVacio());
      iniciarTemporizador();
      setPaso(2);
    } catch (e) {
      mostrarAlerta('error', 'No se pudo enviar el código', mensajeDeError(e, 'Inténtalo de nuevo en un momento.'));
    } finally {
      setIsLoading(false);
    }
  };

  const comprobarCodigo = async (digitos: string) => {
    if (verificando.current) return;
    verificando.current = true;
    setIsLoading(true);
    try {
      await authService.verificarCodigoRecuperacion(email.trim(), digitos);
      setPaso(3);
    } catch (e) {
      setCodigo(codigoVacio());
      mostrarAlerta('error', 'Código no válido', mensajeDeError(e, 'El código no es válido o ya venció. Pide uno nuevo.'));
    } finally {
      verificando.current = false;
      setIsLoading(false);
    }
  };

  /** Escribe en una casilla; si llegan varios dígitos (pegar o autocompletar) se reparten. */
  const handleCodigoChange = (text: string, index: number): number => {
    if (expirado) return index;
    const digitos = text.replace(/\D/g, '');
    const nuevoCodigo = [...codigo];
    let ultimo = index;
    if (digitos.length <= 1) {
      nuevoCodigo[index] = digitos;
    } else {
      digitos.slice(0, DIGITOS_CODIGO - index).split('').forEach((d, i) => {
        nuevoCodigo[index + i] = d;
        ultimo = index + i;
      });
    }
    setCodigo(nuevoCodigo);
    // Al completar los 6 dígitos se comprueba solo
    if (nuevoCodigo.every((d) => d !== '')) comprobarCodigo(nuevoCodigo.join(''));
    return ultimo;
  };

  // Botón "Confirmar Código" (por si el avance automático no se disparó)
  const verificarCodigo = () => {
    if (expirado) {
      mostrarAlerta(
        'aviso',
        'Código vencido',
        'Se acabó el tiempo. Solicita un nuevo código para continuar.'
      );
      return;
    }
    if (codigo.join('').length < DIGITOS_CODIGO) {
      mostrarAlerta(
        'aviso',
        'Código incompleto',
        'Escribe los 6 dígitos del código que te enviamos.'
      );
      return;
    }
    comprobarCodigo(codigo.join(''));
  };

  // "Solicitar un nuevo código": pide otro al backend (el anterior deja de servir)
  const reenviarCodigo = async () => {
    if (!puedeReenviar) return;
    setIsLoading(true);
    try {
      await authService.pedirCodigoRecuperacion(email.trim());
      setCodigo(codigoVacio());
      iniciarTemporizador();
      mostrarAlerta('exito', 'Código enviado', 'Te enviamos un código nuevo. El anterior ya no sirve.');
    } catch (e) {
      mostrarAlerta('error', 'No se pudo reenviar', mensajeDeError(e, 'Inténtalo de nuevo en un momento.'));
    } finally {
      setIsLoading(false);
    }
  };

  const guardarNuevaContrasena = () => {
    if (nuevaPassword.length < 8) {
      mostrarAlerta(
        'error',
        'Contraseña muy corta',
        'Usa mínimo 8 caracteres para proteger tu cuenta.'
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
    authService
      .restablecerContrasena(email.trim(), codigo.join(''), nuevaPassword)
      .then(() =>
        mostrarAlerta(
          'exito',
          '¡Contraseña actualizada!',
          'Ya puedes iniciar sesión con tu nueva contraseña.',
          'Iniciar sesión',
          () => navigation.reset({ index: 0, routes: [{ name: "Login" }] })
        )
      )
      .catch((e) =>
        mostrarAlerta('error', 'No se pudo guardar', mensajeDeError(e, 'El código ya no es válido. Pide uno nuevo.'))
      )
      .finally(() => setIsLoading(false));
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
    puedeReenviar,
    esperaReenvio,
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