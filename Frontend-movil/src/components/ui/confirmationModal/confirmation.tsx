import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { localStyles } from './confirmationStyle';
import { useLocale } from '../../../contexts/LocaleContext';

interface ConfirmationModalProps {
  visible: boolean;
  department: string;
  municipality: string;
  onConfirm: () => void;
  onBack: () => void;
  confirmOnly: boolean; // ← add this
}

export default function ConfirmationModal({ 
  visible, 
  department, 
  municipality, 
  onConfirm, 
  onBack,
  confirmOnly, // ← add this
}: ConfirmationModalProps) {
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onBack}>
      <View style={localStyles.overlay}>
        <View style={localStyles.modalCard}>
          
          <View style={localStyles.iconCircle}>
            <Text style={localStyles.iconText}>⚠️</Text>
          </View>

          <Text style={localStyles.modalTitle}>{t.confirmacion.titulo}</Text>
          
          <Text style={localStyles.modalSubtitle}>
            {t.confirmacion.subtitulo}
          </Text>

          <View style={localStyles.infoBox}>
            <View style={localStyles.dataRow}>
              <Text style={localStyles.dataLabel}>{t.confirmacion.departamento_label}</Text>
              <Text style={localStyles.dataValue}>{department}</Text>
            </View>
            <View style={localStyles.dataRow}>
              <Text style={localStyles.dataLabel}>{t.confirmacion.municipio_label}</Text>
              <Text style={localStyles.dataValue}>{municipality}</Text>
            </View>
          </View>

          <View style={localStyles.buttonContainer}>
            <TouchableOpacity style={localStyles.confirmBtn} onPress={onConfirm}>
              <Text style={localStyles.confirmBtnText}>{t.confirmacion.btn_confirmar}</Text>
            </TouchableOpacity>

            {/* ← Only shows "Change data" if it has NOT been confirmed yet */}
            {!confirmOnly && (
              <TouchableOpacity style={localStyles.backBtn} onPress={onBack}>
                <Text style={localStyles.backBtnText}>{t.confirmacion.btn_cambiar}</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}