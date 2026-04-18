import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { localStyles } from "./permisosStyle";

interface PermisosModalProps {
  visible: boolean;
  tipo: 'sms' | 'llamada' | 'contacto' | 'camara' | 'audio' | 'notificacion'; // 🆕
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function PermisosModal({ visible, tipo, onConfirmar, onCancelar }: PermisosModalProps) {

  const icono =
    tipo === 'sms'          ? "✉️" :
    tipo === 'contacto'     ? "👥" :
    tipo === 'camara'       ? "📷" :
    tipo === 'audio'        ? "🎙️" :
    tipo === 'notificacion' ? "🔔" :
                              "📞";

  const titulo =
    tipo === 'sms'          ? "Permitir que Alerta Mujer acceda a los mensajes" :
    tipo === 'contacto'     ? "Permitir que Alerta Mujer acceda a tus contactos" :
    tipo === 'camara'       ? "Permitir que Alerta Mujer acceda a la cámara" :
    tipo === 'audio'        ? "Permitir que Alerta Mujer acceda al micrófono" :
    tipo === 'notificacion' ? "Permitir que Alerta Mujer envíe notificaciones" :
    "Permitir que Alerta Mujer realice llamadas";

  const descripcion =
    tipo === 'sms'          ? "Esta función enviará un mensaje de texto con tu ubicación a tus contactos de emergencia." :
    tipo === 'contacto'     ? "Necesitamos acceso para elegir personas de confianza que recibirán tus alertas de emergencia." :
    tipo === 'camara'       ? "Permite grabar video como evidencia visual si te encuentras en peligro." :
    tipo === 'audio'        ? "Permite grabar audio para documentar lo que ocurre a tu alrededor en caso de emergencia." :
    tipo === 'notificacion' ? "Te avisaremos cuando alguien responda tu alerta o cuando haya novedades importantes." :
    "La aplicación podrá iniciar una llamada directa para solicitar ayuda inmediata.";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={localStyles.overlay}>
        <View style={localStyles.modalCard}>

          <View style={localStyles.iconContainer}>
            <Text style={{ fontSize: 50 }}>{icono}</Text>
          </View>

          <Text style={localStyles.modalTitle}>{titulo}</Text>
          <Text style={localStyles.modalSub}>{descripcion}</Text>

          <TouchableOpacity style={localStyles.btnConfirmar} onPress={onConfirmar}>
            <Text style={localStyles.btnConfirmarText}>Confirmar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.btnRegresar} onPress={onCancelar}>
            <Text style={localStyles.btnRegresarText}>Regresar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}