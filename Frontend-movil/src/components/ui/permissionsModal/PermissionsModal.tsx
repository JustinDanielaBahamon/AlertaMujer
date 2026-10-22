import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { localStyles } from "./permissionsStyle";
import { useLocale } from '../../../contexts/LocaleContext';

interface PermissionsModalProps {
  visible: boolean;
  type: 'sms' | 'contacto' | 'camara' | 'audio' | 'notificacion'; // 🆕
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PermissionsModal({ visible, type, onConfirm, onCancel }: PermissionsModalProps) {
  const { t } = useLocale();

  const icon =
    type === 'sms'          ? "✉️" :
    type === 'contacto'     ? "👥" :
    type === 'camara'       ? "📷" :
    type === 'audio'        ? "🎙️" :
                              "🔔";

  const title =
    type === 'sms'          ? t.permisos.sms_titulo :
    type === 'contacto'     ? t.permisos.contacto_titulo :
    type === 'camara'       ? t.permisos.camara_titulo :
    type === 'audio'        ? t.permisos.audio_titulo :
    t.permisos.notificacion_titulo;

  // Camera and microphone show the clear disclosure (Prominent Disclosure)
  const description =
    type === 'sms'          ? t.permisos.sms_desc :
    type === 'contacto'     ? t.permisos.contacto_desc :
    type === 'camara'       ? t.permisos.divulgacion_grabacion :
    type === 'audio'        ? t.permisos.divulgacion_grabacion :
    t.permisos.notificacion_desc;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={localStyles.overlay}>
        <View style={localStyles.modalCard}>

          <View style={localStyles.iconContainer}>
            <Text style={{ fontSize: 40 }}>{icon}</Text>
          </View>

          <Text style={localStyles.modalTitle}>{title}</Text>
          <Text style={localStyles.modalSub}>{description}</Text>

          <TouchableOpacity style={localStyles.confirmBtn} onPress={onConfirm}>
            <Text style={localStyles.confirmBtnText}>{t.permisos.btn_confirmar}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.backBtn} onPress={onCancel}>
            <Text style={localStyles.backBtnText}>{t.permisos.btn_regresar}</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}