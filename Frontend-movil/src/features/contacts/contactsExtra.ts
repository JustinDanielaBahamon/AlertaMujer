import type { AppLocale } from "../../contexts/LocaleContext";

/**
 * Strict email validation:
 * - no spaces
 * - user part with letters, numbers and . _ % + -
 * - valid domain and an extension of at least 2 letters
 */
export const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function isValidEmail(email: string): boolean {
  const clean = email.trim();
  return clean.length > 0 && clean.length <= 254 && EMAIL_REGEX.test(clean);
}

type ExtraTexts = {
  label_correo: string;
  placeholder_correo: string;
  correo_requerido_titulo: string;
  correo_requerido_desc: string;
  correo_invalido_titulo: string;
  correo_invalido_desc: string;
  alerta_boton: string;
  alerta_titulo: string;
  alerta_desc: string; // uses {nombre}
  alerta_enviar: string;
  alerta_cancelar: string;
  alerta_mensaje: string; // uses {ubicacion}
  alerta_sin_ubicacion: string;
  alerta_error: string;
  guardar_error_titulo: string;
  guardar_error_desc: string; // when the server gives no reason
  guardar_sin_respuesta: string; // timeout or no connection
};

export const contactExtraTexts: Record<AppLocale, ExtraTexts> = {
  es: {
    label_correo: "Correo electrónico",
    placeholder_correo: "correo@ejemplo.com",
    correo_requerido_titulo: "Correo requerido",
    correo_requerido_desc: "Ingresa el correo electrónico del contacto para continuar.",
    correo_invalido_titulo: "Correo inválido",
    correo_invalido_desc: "Ingresa un correo válido, por ejemplo: nombre@correo.com",
    alerta_boton: "Alertar",
    alerta_titulo: "¿Enviar alerta?",
    alerta_desc: "Se enviará una alerta de emergencia solo a {nombre}.",
    alerta_enviar: "Enviar alerta",
    alerta_cancelar: "Cancelar",
    alerta_mensaje: "🚨 ALERTA DE EMERGENCIA: necesito ayuda. {ubicacion}",
    alerta_sin_ubicacion: "No pude obtener mi ubicación.",
    alerta_error: "No se pudo abrir WhatsApp ni mensajes en este dispositivo.",
    guardar_error_titulo: "No se guardó el contacto",
    guardar_error_desc: "Ocurrió un error al guardar. Intenta de nuevo.",
    guardar_sin_respuesta: "El servidor no respondió. Revisa tu conexión e intenta de nuevo en un momento.",
  },
  en: {
    label_correo: "Email",
    placeholder_correo: "email@example.com",
    correo_requerido_titulo: "Email required",
    correo_requerido_desc: "Enter the contact's email to continue.",
    correo_invalido_titulo: "Invalid email",
    correo_invalido_desc: "Enter a valid email, for example: name@email.com",
    alerta_boton: "Alert",
    alerta_titulo: "Send alert?",
    alerta_desc: "An emergency alert will be sent only to {nombre}.",
    alerta_enviar: "Send alert",
    alerta_cancelar: "Cancel",
    alerta_mensaje: "🚨 EMERGENCY ALERT: I need help. {ubicacion}",
    alerta_sin_ubicacion: "I couldn't get my location.",
    alerta_error: "Could not open WhatsApp or messages on this device.",
    guardar_error_titulo: "The contact wasn't saved",
    guardar_error_desc: "Something went wrong while saving. Try again.",
    guardar_sin_respuesta: "The server didn't respond. Check your connection and try again in a moment.",
  },
  pt: {
    label_correo: "E-mail",
    placeholder_correo: "email@exemplo.com",
    correo_requerido_titulo: "E-mail obrigatório",
    correo_requerido_desc: "Digite o e-mail do contato para continuar.",
    correo_invalido_titulo: "E-mail inválido",
    correo_invalido_desc: "Digite um e-mail válido, por exemplo: nome@email.com",
    alerta_boton: "Alertar",
    alerta_titulo: "Enviar alerta?",
    alerta_desc: "Um alerta de emergência será enviado apenas para {nombre}.",
    alerta_enviar: "Enviar alerta",
    alerta_cancelar: "Cancelar",
    alerta_mensaje: "🚨 ALERTA DE EMERGÊNCIA: preciso de ajuda. {ubicacion}",
    alerta_sin_ubicacion: "Não consegui obter minha localização.",
    alerta_error: "Não foi possível abrir o WhatsApp nem as mensagens neste dispositivo.",
    guardar_error_titulo: "O contato não foi salvo",
    guardar_error_desc: "Ocorreu um erro ao salvar. Tente novamente.",
    guardar_sin_respuesta: "O servidor não respondeu. Verifique sua conexão e tente novamente em instantes.",
  },
  fr: {
    label_correo: "E-mail",
    placeholder_correo: "email@exemple.com",
    correo_requerido_titulo: "E-mail requis",
    correo_requerido_desc: "Saisis l'e-mail du contact pour continuer.",
    correo_invalido_titulo: "E-mail invalide",
    correo_invalido_desc: "Saisis un e-mail valide, par exemple : nom@email.com",
    alerta_boton: "Alerter",
    alerta_titulo: "Envoyer l'alerte ?",
    alerta_desc: "Une alerte d'urgence sera envoyée uniquement à {nombre}.",
    alerta_enviar: "Envoyer l'alerte",
    alerta_cancelar: "Annuler",
    alerta_mensaje: "🚨 ALERTE D'URGENCE : j'ai besoin d'aide. {ubicacion}",
    alerta_sin_ubicacion: "Je n'ai pas pu obtenir ma position.",
    alerta_error: "Impossible d'ouvrir WhatsApp ou les messages sur cet appareil.",
    guardar_error_titulo: "Le contact n'a pas été enregistré",
    guardar_error_desc: "Une erreur s'est produite lors de l'enregistrement. Réessaie.",
    guardar_sin_respuesta: "Le serveur n'a pas répondu. Vérifie ta connexion et réessaie dans un instant.",
  },
};