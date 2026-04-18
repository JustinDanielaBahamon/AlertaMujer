import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { localStyles } from "./permisosStyle";

interface PermisosModalProps {
  visible: boolean;
  tipo: 'sms' | 'llamada' | 'contacto';
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function PermisosModal({ visible, tipo, onConfirmar, onCancelar }: PermisosModalProps) {

  // Determina el ícono según el tipo de permiso
  const icono = tipo === 'sms' ? "✉️" : tipo === 'contacto' ? "👥" : "📞";

  // Determina el título según el tipo de permiso
  const titulo =
    tipo === 'sms'      ? "Permitir que Alerta Mujer acceda a los mensajes" :
    tipo === 'contacto' ? "Permitir que Alerta Mujer acceda a tus contactos" :
                          "Permitir que Alerta Mujer realice llamadas";

  // Determina la descripción según el tipo de permiso
  const descripcion =
    tipo === 'sms'      ? "Esta función enviará un mensaje de texto con tu ubicación a tus contactos de emergencia." :
    tipo === 'contacto' ? "Necesitamos acceso para elegir personas de confianza que recibirán tus alertas de emergencia." :
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