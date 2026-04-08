import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { localStyles } from "./permisosStyle";

// Definimos la interfaz para evitar errores de tipo en la navegación
interface PermisosModalProps {
  visible: boolean;
  tipo: 'sms' | 'llamada'; 
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function PermisosModal({ 
  visible, 
  tipo, 
  onConfirmar, 
  onCancelar 
}: PermisosModalProps) {
  
  const esSMS = tipo === 'sms';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={localStyles.overlay}>
        <View style={localStyles.modalCard}>
          
          <View style={localStyles.iconContainer}>
             <Text style={{fontSize: 50}}>{esSMS ? "✉️" : "📞"}</Text>
          </View>

          <Text style={localStyles.modalTitle}>
            {esSMS 
              ? "Permitir que Alerta Mujer acceda a los mensajes" 
              : "Permitir que Alerta Mujer realice llamadas"}
          </Text>

          <Text style={localStyles.modalSub}>
            {esSMS 
              ? "Esta función enviará un mensaje de texto con tu ubicación a tus contactos de emergencia."
              : "La aplicación podrá iniciar una llamada directa para solicitar ayuda inmediata."}
          </Text>

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