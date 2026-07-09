import { useNavigation } from "@react-navigation/native";

export interface PasoMetodo {
  texto: string;
}

export interface MetodoActivacion {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  pasos: PasoMetodo[];
}
export const METODOS_ACTIVACION: MetodoActivacion[] = [
  {
    id: "agitar",
    icono: "phone-portrait-outline",
    titulo: "Agitar telefono",
    descripcion:
      "Activa una alerta de emergencia agitando el celular con fuerza, sin necesidad de abrir la aplicación ni desbloquear la pantalla.",
    pasos: [
      { texto: "Activa esta funcion desde Configuracion > Metodos de activación > Activar" },
      { texto: "Agita el celular de forma rapida y firme, varias veces seguidas." },
      { texto: "El sistema detecta el movimiento brusco y dispara la alerta automáticamente." },
      { texto: "Recibiras una vibración mientras se envia la alerta" },
    ],
  },
  {
    id: "popup",
    icono: "notifications-outline",
    titulo: "Notificación emergente en la pantalla de bloqueo",
    descripcion:
      "Aparece una notificación tipo pop-up sobre la pantalla de bloqueo con un boton de acceso directo para enviar la alerta sin desbloquear el celular.",
    pasos: [
      { texto: "Concede permiso para mostrar notificaciones sobre otras aplicaciones." },
      { texto: "Cuando el celular este bloqueado, la notificación aparecera en primer plano." },
      { texto: "Toca el boton de alerta dentro de la notificación para activarla de inmediato" },
      { texto: "No es necesario ingresar tu contraseña ni desbloquear el telefono" },
    ],
  },
];

export function useMetodosActivacionViewModel() {
  const navigation = useNavigation();

  const volver = () => {
    navigation.goBack();
  };

  return {
    metodos: METODOS_ACTIVACION,
    volver,
  };
}