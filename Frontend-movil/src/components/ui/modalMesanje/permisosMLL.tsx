import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { localStyles } from "./permisosStyle";
import { useLocale } from '../../../contexts/LocaleContext';

interface PermisosModalProps {
  visible: boolean;
  tipo: 'sms' | 'llamada' | 'contacto' | 'camara' | 'audio' | 'notificacion'; // 🆕
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function PermisosModal({ visible, tipo, onConfirmar, onCancelar }: PermisosModalProps) {
  const { t } = useLocale();

  const icono =
    tipo === 'sms'          ? "✉️" :
    tipo === 'contacto'     ? "👥" :
    tipo === 'camara'       ? "📷" :
    tipo === 'audio'        ? "🎙️" :
    tipo === 'notificacion' ? "🔔" :
                              "📞";

  const titulo =
    tipo === 'sms'          ? t.permisos.sms_titulo :
    tipo === 'contacto'     ? t.permisos.contacto_titulo :
    tipo === 'camara'       ? t.permisos.camara_titulo :
    tipo === 'audio'        ? t.permisos.audio_titulo :
    tipo === 'notificacion' ? t.permisos.notificacion_titulo :
    t.permisos.llamada_titulo;

  const descripcion =
    tipo === 'sms'          ? t.permisos.sms_desc :
    tipo === 'contacto'     ? t.permisos.contacto_desc :
    tipo === 'camara'       ? t.permisos.camara_desc :
    tipo === 'audio'        ? t.permisos.audio_desc :
    tipo === 'notificacion' ? t.permisos.notificacion_desc :
    t.permisos.llamada_desc;

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
            <Text style={localStyles.btnConfirmarText}>{t.permisos.btn_confirmar}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.btnRegresar} onPress={onCancelar}>
            <Text style={localStyles.btnRegresarText}>{t.permisos.btn_regresar}</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}